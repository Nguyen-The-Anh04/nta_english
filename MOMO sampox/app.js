
//////////////////////////////BẢN HIỂN THỊ QR CODE THANH TOÁN MOMO///////////////////////////       
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 Cấu hình MOMO TEST
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const partnerCode = "MOMO";
const redirectUrl = "https://bookas.vn"; // URL chuyển về sau khi thanh toán
const ipnUrl = "https://1521-14-244-118-99.ngrok-free.app/callback"; // URL callback nhận trạng thái
const requestType = "payWithMethod";
const autoCapture = true;
const lang = "vi";

// ================================================
// 🧩 1️⃣ TẠO ĐƠN THANH TOÁN + QR
// ================================================
app.post("/payment", async (req, res) => {
  const { amount, orderInfo, orderIdClient } = req.body;

  if (!amount) return res.status(400).json({ message: "Missing amount" });

  const orderId = partnerCode + new Date().getTime(); // Sinh mã đơn hàng MOMO
  const requestId = orderId;
  const extraData = orderIdClient || ""; // Gắn id của đơn hàng nội bộ nếu có

  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo || "Thanh toán đơn hàng"}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    partnerName: "TheAnhStore",
    storeId: "TheAnhStoreOnline",
    requestId,
    amount,
    orderId,
    orderInfo: orderInfo || "Thanh toán đơn hàng",
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    signature,
  };

  try {
    const result = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );

    const { payUrl } = result.data;

    // 🔥 Trả về link và QR động
    return res.status(200).json({
      success: true,
      ...result.data,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payUrl)}`,
    });
  } catch (error) {
    console.error("❌ Lỗi MoMo:", error.response?.data || error.message);
    return res.status(500).json({ message: "Server error", detail: error.message });
  }
});

// ================================================
// 📩 2️⃣ CALLBACK TỪ MOMO
// ================================================
app.post("/callback", (req, res) => {
  const callbackData = req.body;
  console.log("📥 Callback data:", callbackData);

  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = callbackData;

  // ✅ Tạo lại chữ ký để xác thực
  const rawSignature =
    `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}` +
    `&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}` +
    `&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const serverSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  if (serverSignature !== signature) {
    console.error("🚫 Sai chữ ký callback!");
    return res.status(400).json({ message: "Invalid signature" });
  }

  // 🧠 TODO: Cập nhật trạng thái đơn hàng trong DB
  if (resultCode === 0) {
    console.log(`✅ Đơn hàng ${orderId} đã thanh toán thành công!`);
  } else {
    console.log(`⚠️ Thanh toán thất bại cho đơn hàng ${orderId}`);
  }

  // Phản hồi về MoMo
  return res.status(200).json({
    partnerCode,
    orderId,
    requestId,
    resultCode: 0,
    message: "Confirm success",
  });
});

// ================================================
// 🔎 3️⃣ KIỂM TRA TRẠNG THÁI GIAO DỊCH
// ================================================
app.post("/payment/status", async (req, res) => {
  const { orderId, requestId } = req.body;
  if (!orderId || !requestId)
    return res.status(400).json({ message: "Missing orderId or requestId" });

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const requestBody = { partnerCode, requestId, orderId, signature, lang: "vi" };

  try {
    const result = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/query",
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ message: "Server error", detail: error.message });
  }
});

// ================================================
app.listen(4000, () => {
  console.log("🚀 MoMo Payment Server running on port 4000");
});
