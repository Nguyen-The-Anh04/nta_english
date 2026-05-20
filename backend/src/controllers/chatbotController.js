const { GoogleGenerativeAI } = require("@google/generative-ai");
const sequelize = require("../config/db");
const { Sach, LoaiSach } = require("../models");
const { Op } = require("sequelize");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Lấy hoặc tạo lịch sử chat từ DB
async function getHistory(sessionId) {
  const [rows] = await sequelize.query(
    "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT 20",
    { replacements: [sessionId] }
  );
  return rows.map((r) => ({
    role: r.role === "assistant" ? "model" : "user",
    parts: [{ text: r.content }],
  }));
}

// Lưu tin nhắn vào DB
async function saveMessage(sessionId, role, content) {
  await sequelize.query(
    "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
    { replacements: [sessionId, role, content] }
  );
}

// Tìm sách liên quan theo từ khóa
async function findRelatedBooks(keyword) {
  if (!keyword) return [];
  return Sach.findAll({
    where: {
      [Op.or]: [
        { ten_sach: { [Op.like]: `%${keyword}%` } },
        { mo_ta: { [Op.like]: `%${keyword}%` } },
        { tac_gia: { [Op.like]: `%${keyword}%` } },
      ],
      trang_thai: { [Op.ne]: "het_hang" },
    },
    include: [{ model: LoaiSach, as: "loaiSach" }],
    limit: 4,
  });
}

// Trích xuất từ khóa tìm sách từ tin nhắn
function extractBookKeyword(message) {
  const lower = message.toLowerCase();
  const bookTriggers = ["sách", "book", "mua", "giá", "tìm", "gợi ý", "recommend", "ielts", "toeic", "tiếng anh", "ngữ pháp", "từ vựng"];
  if (bookTriggers.some((t) => lower.includes(t))) {
    const cleaned = message.replace(/[?!.,]/g, "").trim();
    return cleaned.length > 3 ? cleaned : null;
  }
  return null;
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn bán hàng của NTA English Center - chuyên bán sách tiếng Anh.
Nhiệm vụ:
- Tư vấn và gợi ý sách phù hợp cho khách hàng
- Trả lời câu hỏi về sản phẩm, giá cả, chính sách
- Hỗ trợ khách hàng thân thiện, nhiệt tình
- Khi có thông tin sách từ hệ thống, hãy giới thiệu cụ thể (tên, giá, mô tả)
- Định dạng giá tiền theo VNĐ (ví dụ: 150.000đ)
- Nếu khách muốn đặt hàng, hướng dẫn họ vào trang sản phẩm hoặc liên hệ trực tiếp
- Trả lời ngắn gọn, rõ ràng, thân thiện bằng tiếng Việt`;

// Trả lời fallback khi Gemini bị rate limit
function fallbackReply(message, bookContext) {
  const lower = message.toLowerCase();

  // Có sách từ DB → ưu tiên hiển thị
  if (bookContext) {
    return "Tôi tìm được một số sách phù hợp cho bạn, xem bên dưới nhé! 👇";
  }

  // Chào hỏi / giao lưu
  if (lower.match(/^(hi|hello|xin chào|chào|hey|alo|ơi)/)) {
    return "Chào bạn! 😊 Mình là trợ lý của NTA English Center. Bạn cần tìm sách hay hỏi gì cứ nhắn mình nhé!";
  }
  if (lower.includes("bạn tên") || lower.includes("mày tên") || lower.includes("tên bạn")) {
    return "Mình là trợ lý ảo của NTA English Center, bạn có thể gọi mình là NTA Bot 🤖. Mình ở đây để giúp bạn tìm sách và tư vấn học tiếng Anh!";
  }
  if (lower.includes("khỏe") || lower.includes("thế nào")) {
    return "Mình ổn, cảm ơn bạn hỏi thăm 😄 Bạn đang cần tìm sách gì không? Mình sẵn sàng giúp!";
  }
  if (lower.includes("cảm ơn") || lower.includes("thanks") || lower.includes("thank")) {
    return "Không có gì! 😊 Nếu cần tư vấn thêm cứ nhắn mình nhé!";
  }
  if (lower.includes("tạm biệt") || lower.includes("bye") || lower.includes("goodbye")) {
    return "Tạm biệt bạn! Chúc bạn học tốt 📚 Lần sau cần gì cứ ghé lại nhé!";
  }

  // Câu hỏi về giá / đặt hàng / chính sách
  if (lower.includes("giá") || lower.includes("bao nhiêu tiền")) {
    return "Sách tại NTA dao động từ 50.000đ đến 500.000đ tùy loại. Bạn muốn tìm sách gì để mình tư vấn cụ thể hơn?";
  }
  if (lower.includes("đặt hàng") || lower.includes("mua ở đâu")) {
    return "Bạn có thể đặt hàng ngay trên website tại trang Cửa hàng. Chọn sách → thêm vào giỏ → thanh toán là xong! Cần hỗ trợ thêm không?";
  }
  if (lower.includes("giao hàng") || lower.includes("ship")) {
    return "Mình giao hàng toàn quốc, 2-5 ngày làm việc. Đơn trên 300.000đ miễn phí ship luôn 🚚";
  }
  if (lower.includes("đổi trả") || lower.includes("hoàn tiền")) {
    return "Đổi trả trong 7 ngày nếu sách bị lỗi in hoặc hư hỏng khi nhận. Liên hệ hotline để được hỗ trợ nhanh nhất nhé!";
  }

  // Mặc định
  return "Mình hiểu rồi! 😊 Bạn có muốn mình giúp tìm sách tiếng Anh phù hợp không? Chỉ cần nói tên loại sách hoặc mục tiêu học là mình tư vấn ngay!";
}

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: "Thiếu message hoặc sessionId" });
    }

    // Tìm sách liên quan nếu có
    const keyword = extractBookKeyword(message);
    let books = [];
    let bookContext = "";
    if (keyword) {
      books = await findRelatedBooks(keyword);
      if (books.length > 0) {
        bookContext = "\n\n[Thông tin sách từ hệ thống]:\n" +
          books.map((b) =>
            `- ${b.ten_sach} | Tác giả: ${b.tac_gia || "N/A"} | Giá: ${Number(b.gia_ban).toLocaleString("vi-VN")}đ | Loại: ${b.loaiSach?.ten_loai || "N/A"}`
          ).join("\n");
      }
    }

    // Lấy lịch sử chat
    const history = await getHistory(sessionId);

    let reply;
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        systemInstruction: SYSTEM_PROMPT,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message + bookContext);
      reply = result.response.text();
    } catch (aiErr) {
      if (aiErr.status === 429) {
        reply = fallbackReply(message, bookContext);
      } else {
        throw aiErr;
      }
    }

    // Lưu lịch sử
    await saveMessage(sessionId, "user", message);
    await saveMessage(sessionId, "assistant", reply);

    // Format books để trả về frontend
    const booksData = books.map((b) => ({
      id: b.id,
      ten_sach: b.ten_sach,
      tac_gia: b.tac_gia,
      gia_ban: Number(b.gia_ban),
      hinh_anh: b.hinh_anh,
      loai: b.loaiSach?.ten_loai || "",
      trang_thai: b.trang_thai,
    }));

    res.json({ success: true, reply, books: booksData });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ success: false, message: "Lỗi chatbot: " + error.message });
  }
};

// Lấy lịch sử chat theo session
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await sequelize.query(
      "SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY id ASC",
      { replacements: [sessionId] }
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa lịch sử chat
exports.clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sequelize.query("DELETE FROM chat_messages WHERE session_id = ?", {
      replacements: [sessionId],
    });
    res.json({ success: true, message: "Đã xóa lịch sử chat" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
