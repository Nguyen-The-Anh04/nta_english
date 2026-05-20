require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASS, database: process.env.DB_NAME,
  });

  // 1. Chi tiết khoá học (nội dung từng module/chủ đề)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS chi_tiet_khoa_hoc (
      id INT PRIMARY KEY AUTO_INCREMENT,
      khoa_hoc_id INT NOT NULL,
      so_thu_tu INT NOT NULL DEFAULT 1,
      ten_chuong VARCHAR(255) NOT NULL,
      mo_ta TEXT,
      so_buoi INT DEFAULT 1,
      ky_nang ENUM('nghe','doc','noi','viet','tong_hop') DEFAULT 'tong_hop',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id)
    )
  `);
  console.log("✅ Tạo bảng chi_tiet_khoa_hoc");

  // 2. Buổi học (lịch sử từng buổi của lớp)
  await c.execute(`
    CREATE TABLE IF NOT EXISTS buoi_hoc (
      id INT PRIMARY KEY AUTO_INCREMENT,
      lop_hoc_id INT NOT NULL,
      so_buoi INT NOT NULL,
      ngay_hoc DATE NOT NULL,
      gio_bat_dau TIME,
      gio_ket_thuc TIME,
      chu_de VARCHAR(255),
      noi_dung TEXT,
      tai_lieu VARCHAR(500),
      trang_thai ENUM('chua_hoc','da_hoc','nghi_le','bu_lich') DEFAULT 'chua_hoc',
      ghi_chu TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id)
    )
  `);
  console.log("✅ Tạo bảng buoi_hoc");

  // Seed chi tiết khoá học
  console.log("\n=== SEED CHI TIẾT KHOÁ HỌC ===");
  const [khs] = await c.execute("SELECT id, ten_khoa FROM khoa_hoc WHERE trang_thai='dang_mo' LIMIT 5");

  const CHUONG_BY_KHOA = {
    "Base": [
      { so:1, ten:"Ngữ pháp cơ bản - Thì hiện tại", mo_ta:"Thì hiện tại đơn, hiện tại tiếp diễn, hiện tại hoàn thành", so_buoi:4, ky_nang:"tong_hop" },
      { so:2, ten:"Từ vựng chủ đề gia đình & bạn bè", mo_ta:"500 từ vựng cơ bản về gia đình, bạn bè, mô tả người", so_buoi:3, ky_nang:"doc" },
      { so:3, ten:"Kỹ năng nghe cơ bản", mo_ta:"Nghe hội thoại ngắn, điền từ, chọn đáp án", so_buoi:4, ky_nang:"nghe" },
      { so:4, ten:"Kỹ năng nói - Giới thiệu bản thân", mo_ta:"Luyện phát âm, giới thiệu bản thân, hỏi thăm", so_buoi:3, ky_nang:"noi" },
      { so:5, ten:"Kỹ năng đọc hiểu cơ bản", mo_ta:"Đọc đoạn văn ngắn, tìm ý chính, trả lời câu hỏi", so_buoi:3, ky_nang:"doc" },
      { so:6, ten:"Kỹ năng viết câu đơn giản", mo_ta:"Viết câu hoàn chỉnh, đoạn văn ngắn mô tả", so_buoi:3, ky_nang:"viet" },
    ],
    "Pre": [
      { so:1, ten:"Ngữ pháp trung cấp - Thì quá khứ & tương lai", mo_ta:"Quá khứ đơn, quá khứ tiếp diễn, tương lai đơn, tương lai gần", so_buoi:4, ky_nang:"tong_hop" },
      { so:2, ten:"Từ vựng học thuật cơ bản", mo_ta:"Academic Word List 1-3, từ vựng theo chủ đề IELTS", so_buoi:4, ky_nang:"doc" },
      { so:3, ten:"IELTS Listening Section 1 & 2", mo_ta:"Điền form, bản đồ, sơ đồ, hội thoại thực tế", so_buoi:4, ky_nang:"nghe" },
      { so:4, ten:"IELTS Speaking Part 1", mo_ta:"Trả lời câu hỏi cá nhân, luyện fluency và pronunciation", so_buoi:4, ky_nang:"noi" },
      { so:5, ten:"IELTS Reading - Matching & T/F/NG", mo_ta:"Kỹ thuật làm dạng bài Matching Headings, True/False/Not Given", so_buoi:4, ky_nang:"doc" },
      { so:6, ten:"IELTS Writing Task 1 - Biểu đồ", mo_ta:"Mô tả biểu đồ cột, đường, tròn, bảng số liệu", so_buoi:4, ky_nang:"viet" },
    ],
    "Foundation": [
      { so:1, ten:"Ngữ pháp nâng cao - Câu điều kiện & Bị động", mo_ta:"Conditional 1,2,3, Passive voice, Reported speech", so_buoi:5, ky_nang:"tong_hop" },
      { so:2, ten:"Từ vựng học thuật AWL 4-6", mo_ta:"Academic Word List 4-6, collocations, word forms", so_buoi:4, ky_nang:"doc" },
      { so:3, ten:"IELTS Listening Section 3 & 4", mo_ta:"Hội thoại học thuật, bài giảng, multiple choice", so_buoi:5, ky_nang:"nghe" },
      { so:4, ten:"IELTS Speaking Part 2 & 3", mo_ta:"Cue card 2 phút, thảo luận chủ đề trừu tượng", so_buoi:5, ky_nang:"noi" },
      { so:5, ten:"IELTS Reading - Summary & MCQ", mo_ta:"Summary completion, Multiple choice, Short answer", so_buoi:5, ky_nang:"doc" },
      { so:6, ten:"IELTS Writing Task 2 - Opinion Essay", mo_ta:"Agree/Disagree, Discussion, Problem-Solution essays", so_buoi:6, ky_nang:"viet" },
    ],
    "Standard": [
      { so:1, ten:"Ngữ pháp IELTS nâng cao", mo_ta:"Complex sentences, Cleft sentences, Inversion, Ellipsis", so_buoi:5, ky_nang:"tong_hop" },
      { so:2, ten:"Từ vựng học thuật AWL 7-10", mo_ta:"Academic Word List 7-10, idioms, phrasal verbs học thuật", so_buoi:5, ky_nang:"doc" },
      { so:3, ten:"IELTS Listening - Chiến lược toàn bài", mo_ta:"Prediction, keyword spotting, paraphrase recognition", so_buoi:5, ky_nang:"nghe" },
      { so:4, ten:"IELTS Speaking - Band 6.0-7.0", mo_ta:"Coherence, lexical resource, grammatical range, pronunciation", so_buoi:6, ky_nang:"noi" },
      { so:5, ten:"IELTS Reading - Tốc độ & Chiến lược", mo_ta:"Skimming, scanning, time management, all question types", so_buoi:6, ky_nang:"doc" },
      { so:6, ten:"IELTS Writing - Cả 2 Task", mo_ta:"Task 1 process/map, Task 2 all types, coherence & cohesion", so_buoi:8, ky_nang:"viet" },
    ],
    "Complete": [
      { so:1, ten:"Luyện đề IELTS tổng hợp", mo_ta:"Làm đề Cambridge IELTS 15-18, phân tích lỗi sai", so_buoi:8, ky_nang:"tong_hop" },
      { so:2, ten:"IELTS Listening - Band 7.0+", mo_ta:"Accent recognition, speed listening, complex diagrams", so_buoi:6, ky_nang:"nghe" },
      { so:3, ten:"IELTS Speaking - Band 7.0+", mo_ta:"Sophisticated vocabulary, complex grammar, natural delivery", so_buoi:6, ky_nang:"noi" },
      { so:4, ten:"IELTS Reading - Band 7.0+", mo_ta:"Academic texts, complex paraphrase, time pressure drills", so_buoi:6, ky_nang:"doc" },
      { so:5, ten:"IELTS Writing - Band 7.0+", mo_ta:"Advanced cohesion, sophisticated arguments, error-free writing", so_buoi:8, ky_nang:"viet" },
    ],
  };

  for (const kh of khs) {
    const tenKey = Object.keys(CHUONG_BY_KHOA).find(k => kh.ten_khoa.includes(k));
    if (!tenKey) continue;
    const chuongs = CHUONG_BY_KHOA[tenKey];
    for (const ch of chuongs) {
      const [ex] = await c.execute("SELECT id FROM chi_tiet_khoa_hoc WHERE khoa_hoc_id=? AND so_thu_tu=?", [kh.id, ch.so]);
      if (ex.length > 0) continue;
      await c.execute(
        "INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, so_thu_tu, ten_chuong, mo_ta, so_buoi, ky_nang) VALUES (?,?,?,?,?,?)",
        [kh.id, ch.so, ch.ten, ch.mo_ta, ch.so_buoi, ch.ky_nang]
      );
    }
    console.log(`  ✅ ${kh.ten_khoa}: ${chuongs.length} chương`);
  }

  // Seed buổi học cho lớp đang diễn ra
  console.log("\n=== SEED BUỔI HỌC ===");
  const [lops] = await c.execute(`
    SELECT l.id, l.ma_lop, l.so_buoi_tong, l.so_buoi_da_hoc, l.ngay_bat_dau,
           lh.thu_trong_tuan, lh.gio_bat_dau, lh.gio_ket_thuc
    FROM lop_hoc l
    JOIN lich_hoc lh ON lh.lop_hoc_id = l.id
    WHERE l.trang_thai = 'dang_dien_ra' AND l.ma_lop NOT LIKE 'LOP%'
    LIMIT 10
  `);

  const thuMap = { Thu2:1, Thu3:2, Thu4:3, Thu5:4, Thu6:5, Thu7:6, CNhat:0 };
  const CHU_DE = [
    "Giới thiệu khoá học & kiểm tra đầu vào",
    "Ngữ pháp - Thì cơ bản",
    "Từ vựng chủ đề 1",
    "Kỹ năng nghe - Bài 1",
    "Kỹ năng nói - Luyện phát âm",
    "Kỹ năng đọc - Bài 1",
    "Kỹ năng viết - Câu đơn giản",
    "Ôn tập & kiểm tra giữa kỳ",
    "Ngữ pháp nâng cao",
    "Từ vựng học thuật",
  ];

  const processedLops = new Set();
  for (const lop of lops) {
    if (processedLops.has(lop.id)) continue;
    processedLops.add(lop.id);

    const [existing] = await c.execute("SELECT COUNT(*) as n FROM buoi_hoc WHERE lop_hoc_id=?", [lop.id]);
    if (existing[0].n > 0) continue;

    const startDate = new Date(lop.ngay_bat_dau);
    const dow = thuMap[lop.thu_trong_tuan];
    let cur = new Date(startDate);
    // Tìm ngày đầu tiên khớp thứ
    while (cur.getDay() !== dow) cur.setDate(cur.getDate() + 1);

    const total = Math.min(lop.so_buoi_tong || 20, 20);
    const done = lop.so_buoi_da_hoc || 0;

    for (let i = 0; i < total; i++) {
      const ngay = cur.toISOString().split("T")[0];
      const trangThai = i < done ? "da_hoc" : "chua_hoc";
      const chuDe = CHU_DE[i % CHU_DE.length];
      await c.execute(
        "INSERT INTO buoi_hoc (lop_hoc_id, so_buoi, ngay_hoc, gio_bat_dau, gio_ket_thuc, chu_de, trang_thai) VALUES (?,?,?,?,?,?,?)",
        [lop.id, i+1, ngay, lop.gio_bat_dau, lop.gio_ket_thuc, chuDe, trangThai]
      );
      cur.setDate(cur.getDate() + 7); // tuần sau
    }
    console.log(`  ✅ ${lop.ma_lop}: ${total} buổi (${done} đã học)`);
  }

  // Tổng kết
  const [c1] = await c.execute("SELECT COUNT(*) as n FROM chi_tiet_khoa_hoc");
  const [c2] = await c.execute("SELECT COUNT(*) as n FROM buoi_hoc");
  console.log(`\n=== KẾT QUẢ ===`);
  console.log(`  chi_tiet_khoa_hoc: ${c1[0].n} records`);
  console.log(`  buoi_hoc: ${c2[0].n} records`);

  await c.end();
  console.log("\nDone!");
}

run().catch(console.error);
