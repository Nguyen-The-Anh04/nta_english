const { DeThi, Passage, CauHoi, KetQuaDeThi, BaiLam } = require("../models/ExamModels");
const { NguoiDung } = require("../models/UserModels");
const { LichHenTest, KetQuaLichTest } = require("../models/TestModels");
const { Op } = require("sequelize");
const path = require("path");

// ==================== DE THI ====================

// GET /api/exam/de-thi
const getAllDeThi = async (req, res) => {
  try {
    const list = await DeThi.findAll({
      where: { trang_thai: "hoat_dong" },
      include: [{ model: CauHoi, as: "cauHois", attributes: ["id"] }],
      order: [["created_at", "DESC"]],
    });
    const result = list.map(d => ({ ...d.toJSON(), so_cau: d.cauHois?.length || 0 }));
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/de-thi/:id — lấy đề + câu hỏi (KHÔNG có đáp án đúng)
const getDeThiById = async (req, res) => {
  try {
    const de = await DeThi.findByPk(req.params.id, {
      include: [
        {
          model: Passage,
          as: "passages",
          attributes: ["id","title","content","order_index","section_type"],
          include: [{
            model: CauHoi, as: "cauHois",
            attributes: ["id","stt","phan","ky_nang","loai_cau","noi_dung","lua_chon","diem","hinh_anh","huong_dan","order_index"],
          }],
        },
        {
          model: CauHoi, as: "cauHois",
          attributes: ["id","stt","phan","ky_nang","loai_cau","noi_dung","lua_chon","diem","hinh_anh","huong_dan","passage_id","order_index"],
          order: [["stt","ASC"]],
        },
      ],
    });
    if (!de) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
    res.json({ success: true, data: de });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/de-thi/template-excel — download template Excel
const downloadTemplateExcel = async (req, res) => {
  const filePath = require("path").join(__dirname, "../../uploads/template_de_thi.xlsx");
  const fs = require("fs");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File template chưa được tạo" });
  }
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=template_de_thi.xlsx");
  res.sendFile(filePath);
};

// POST /api/exam/de-thi/upload-excel — upload đề thi từ file Excel
const uploadDeThiExcel = async (req, res) => {
  try {
    const XLSX = require("xlsx");
    const file_audio = req.files?.file_audio?.[0]?.filename || null;

    if (!req.files?.file_excel?.[0]) {
      return res.status(400).json({ success: false, message: "Thiếu file Excel" });
    }

    const wb = XLSX.readFile(req.files.file_excel[0].path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: "File Excel không có dữ liệu" });
    }

    // Parse header
    const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
    const getCol = (name) => headers.indexOf(name);

    const iKyNang = getCol("ky_nang");
    const iLoai = getCol("loai_cau");
    const iBaiTap = getCol("bai_tap_id");
    const iHuongDan = getCol("huong_dan");
    const iPassage = getCol("passage");
    const iNoiDung = getCol("noi_dung_cau");
    const iA = getCol("lua_chon_a");
    const iB = getCol("lua_chon_b");
    const iC = getCol("lua_chon_c");
    const iD = getCol("lua_chon_d");
    const iDapAn = getCol("dap_an");
    const iDiem = getCol("diem");

    // Get ten_de from request body or filename
    const ten_de = req.body.ten_de || req.files.file_excel[0].originalname.replace(/\.xlsx?$/i, "");
    const thoi_gian_phut = parseInt(req.body.thoi_gian_phut) || 90;
    const loai = req.body.loai || "khac";

    // Count questions per section
    let so_cau_nghe = 0, so_cau_doc = 0;
    const dataRows = rows.slice(1).filter(r => r.some(c => c !== null && c !== undefined && c !== ""));

    dataRows.forEach(r => {
      const ky = String(r[iKyNang] || "").toLowerCase();
      if (ky.includes("listen")) so_cau_nghe++;
      else if (ky.includes("read")) so_cau_doc++;
    });

    // Create DeThi
    const de = await DeThi.create({
      ten_de, loai, thoi_gian_phut,
      file_audio,
      so_cau_nghe, so_cau_doc,
      trang_thai: "hoat_dong",
      created_by: req.user?.id,
    });

    // Parse and create CauHoi
    const cauHoisToCreate = [];
    let stt = 1;
    let currentPassage = "";
    let currentHuongDan = "";
    let currentBaiTap = "";

    dataRows.forEach(r => {
      const kyNang = String(r[iKyNang] || "").trim();
      const loaiCau = String(r[iLoai] || "mcq").trim().toLowerCase();
      const baiTapId = String(r[iBaiTap] || "").trim();
      const huongDan = String(r[iHuongDan] || "").trim();
      const passage = String(r[iPassage] || "").trim();
      const noiDung = String(r[iNoiDung] || "").trim();
      const dapAn = String(r[iDapAn] || "").trim();
      const diem = parseFloat(r[iDiem]) || 1;

      if (!noiDung && !dapAn) return; // skip empty rows

      // Track passage and huong dan per bai tap
      if (baiTapId !== currentBaiTap) {
        currentBaiTap = baiTapId;
        if (passage) currentPassage = passage;
        if (huongDan) currentHuongDan = huongDan;
      } else {
        if (passage) currentPassage = passage;
        if (huongDan) currentHuongDan = huongDan;
      }

      const phan = kyNang.toLowerCase().includes("listen") ? "nghe"
        : kyNang.toLowerCase().includes("writ") ? "viet" : "doc";

      // Build lua_chon object
      let lua_chon = null;
      if (loaiCau === "mcq") {
        lua_chon = {};
        if (r[iA]) lua_chon.A = String(r[iA]);
        if (r[iB]) lua_chon.B = String(r[iB]);
        if (r[iC]) lua_chon.C = String(r[iC]);
        if (r[iD]) lua_chon.D = String(r[iD]);
      }

      cauHoisToCreate.push({
        de_thi_id: de.id,
        stt: stt++,
        phan,
        ky_nang: phan,
        loai_cau: loaiCau,
        bai_tap_id: baiTapId,
        huong_dan: currentHuongDan || null,
        passage: currentPassage || null,
        noi_dung: noiDung || huongDan || "—",
        lua_chon,
        dap_an_dung: dapAn || null,
        diem,
      });
    });

    if (cauHoisToCreate.length > 0) {
      try {
        await CauHoi.bulkCreate(cauHoisToCreate);
        console.log(`[uploadExcel] Created ${cauHoisToCreate.length} cauHois for de_thi ${de.id}`);
      } catch (bulkErr) {
        console.error('[uploadExcel] bulkCreate error:', bulkErr.message);
        // Fallback: insert từng câu
        let created = 0;
        for (const ch of cauHoisToCreate) {
          try { await CauHoi.create(ch); created++; }
          catch (e2) { console.error('[uploadExcel] single create error:', e2.message, 'row:', ch.noi_dung); }
        }
        console.log(`[uploadExcel] Fallback created ${created}/${cauHoisToCreate.length}`);
      }
    }

    res.status(201).json({
      success: true,
      data: de,
      message: `Tạo đề thi thành công với ${cauHoisToCreate.length} câu hỏi (Nghe: ${so_cau_nghe}, Đọc: ${so_cau_doc})`,
    });
  } catch (e) {
    console.error("Upload Excel error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};


const uploadDeThiJSON = async (req, res) => {
  try {
    const file_audio = req.files?.file_audio?.[0]?.filename || null;
    let jsonData;

    if (req.files?.file_json?.[0]) {
      const fs = require("fs");
      const content = fs.readFileSync(req.files.file_json[0].path, "utf8");
      jsonData = JSON.parse(content);
    } else if (req.body.json_data) {
      jsonData = typeof req.body.json_data === "string" ? JSON.parse(req.body.json_data) : req.body.json_data;
    } else {
      return res.status(400).json({ success: false, message: "Thiếu file JSON hoặc json_data" });
    }

    const { ten_de, mo_ta, loai, thoi_gian_phut, ky_nang: kyNangArr } = jsonData;

    // Tính tổng câu hỏi theo phần
    let allCauHois = [];
    let so_cau_nghe = 0, so_cau_doc = 0, so_cau_viet = 0;

    if (kyNangArr && Array.isArray(kyNangArr)) {
      kyNangArr.forEach(ky => {
        const tenKy = (ky.ten || "").toLowerCase();
        (ky.bai_tap || []).forEach(bt => {
          (bt.cau_hoi || []).forEach(cq => {
            const phan = tenKy.includes("listen") || tenKy === "listening" ? "nghe"
              : tenKy.includes("writ") || tenKy === "writing" ? "viet" : "doc";
            allCauHois.push({
              phan,
              ky_nang: phan,
              loai_cau: bt.loai || "mcq", // mcq, fill_blank, true_false, essay
              bai_tap_id: bt.id,
              bai_tap_huong_dan: bt.huong_dan,
              bai_tap_passage: bt.passage,
              noi_dung: cq.noi_dung || cq.nhan || cq.cau_hoi || "",
              lua_chon: cq.lua_chon || null,
              dap_an_dung: Array.isArray(cq.dap_an) ? cq.dap_an.join("|") : (cq.dap_an || cq.dap_an_dung || ""),
              diem: cq.diem || 1,
              so_cau: cq.so,
              extra: JSON.stringify({ ...cq }),
            });
            if (phan === "nghe") so_cau_nghe++;
            else if (phan === "viet") so_cau_viet++;
            else so_cau_doc++;
          });
        });
      });
    }

    const de = await DeThi.create({
      ten_de: ten_de || "Đề thi mới",
      mo_ta: mo_ta || "",
      loai: loai || "khac",
      thoi_gian_phut: thoi_gian_phut || 60,
      file_audio,
      so_cau_nghe, so_cau_doc,
      json_data: JSON.stringify(jsonData), // lưu toàn bộ JSON gốc
      trang_thai: "hoat_dong",
      created_by: req.user?.id,
    });

    if (allCauHois.length > 0) {
      await CauHoi.bulkCreate(allCauHois.map((c, i) => ({
        de_thi_id: de.id, stt: i + 1,
        phan: c.phan,
        ky_nang: c.ky_nang,
        noi_dung: c.noi_dung,
        lua_chon: c.lua_chon,
        dap_an_dung: c.dap_an_dung,
        diem: c.diem,
        hinh_anh: null,
      })));
    }

    res.status(201).json({ success: true, data: de, message: `Tạo đề thi thành công với ${allCauHois.length} câu hỏi` });
  } catch (e) {
    console.error("Upload JSON error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/exam/de-thi/template — download template JSON
const downloadTemplate = async (req, res) => {
  const template = {
    ten_de: "IELTS Academic Test - 3 Skills (Listening, Reading, Writing)",
    mo_ta: "Đề thi IELTS Academic Test 3 kỹ năng: Listening, Reading, Writing",
    loai: "ielts",
    thoi_gian_phut: 120,
    ky_nang: [
      {
        ten: "Listening",
        bai_tap: [
          {
            id: "L1",
            loai: "mcq",
            huong_dan: "You will hear a conversation. Answer the questions below.",
            audio: "ielts_listening_part1.mp3",
            cau_hoi: [
              { so: 1, nhan: "Question 1?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "B", diem: 1 },
              { so: 2, nhan: "Question 2?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "C", diem: 1 },
              { so: 3, nhan: "Question 3?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "A", diem: 1 }
            ]
          },
          {
            id: "L2",
            loai: "fill_blank",
            huong_dan: "Fill in the blanks with the correct information.",
            audio: "ielts_listening_part2.mp3",
            cau_hoi: [
              { so: 4, nhan: "Blank 1:", dap_an: ["answer"], diem: 1 },
              { so: 5, nhan: "Blank 2:", dap_an: ["answer"], diem: 1 }
            ]
          },
          {
            id: "L3",
            loai: "true_false",
            huong_dan: "Write TRUE, FALSE, or NOT GIVEN.",
            audio: "ielts_listening_part3.mp3",
            cau_hoi: [
              { so: 6, nhan: "Statement 1?", dap_an: "TRUE", diem: 1 },
              { so: 7, nhan: "Statement 2?", dap_an: "FALSE", diem: 1 },
              { so: 8, nhan: "Statement 3?", dap_an: "NOT GIVEN", diem: 1 }
            ]
          }
        ]
      },
      {
        ten: "Reading",
        bai_tap: [
          {
            id: "R1",
            loai: "true_false",
            passage: "Your reading passage goes here...",
            huong_dan: "Do the statements agree with the passage? Write TRUE, FALSE, or NOT GIVEN.",
            cau_hoi: [
              { so: 1, noi_dung: "Statement 1?", dap_an: "TRUE", diem: 1 },
              { so: 2, noi_dung: "Statement 2?", dap_an: "FALSE", diem: 1 },
              { so: 3, noi_dung: "Statement 3?", dap_an: "NOT GIVEN", diem: 1 }
            ]
          },
          {
            id: "R2",
            loai: "mcq",
            passage: "Your reading passage goes here...",
            huong_dan: "Choose the best answer (A, B, C, or D).",
            cau_hoi: [
              { so: 4, noi_dung: "Question 1?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "B", diem: 1 },
              { so: 5, noi_dung: "Question 2?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "C", diem: 1 },
              { so: 6, noi_dung: "Question 3?", lua_chon: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }, dap_an: "A", diem: 1 }
            ]
          },
          {
            id: "R3",
            loai: "fill_blank",
            passage: "Your reading passage goes here...",
            huong_dan: "Complete the summary. Write NO MORE THAN TWO WORDS.",
            cau_hoi: [
              { so: 7, noi_dung: "Blank 1:", dap_an: "answer", diem: 1 },
              { so: 8, noi_dung: "Blank 2:", dap_an: "answer", diem: 1 }
            ]
          }
        ]
      },
      {
        ten: "Writing",
        bai_tap: [
          {
            id: "W1",
            loai: "essay",
            huong_dan: "The chart below shows...\n\nSummarize the information by selecting and reporting the main features.\n\nWrite at least 150 words.",
            cau_hoi: [
              { so: 1, noi_dung: "Task 1: Write at least 150 words about the chart.", diem: 10 }
            ]
          },
          {
            id: "W2",
            loai: "essay",
            huong_dan: "Some people believe that... Others think that...\n\nDiscuss both views and give your opinion.\n\nWrite at least 250 words.",
            cau_hoi: [
              { so: 2, noi_dung: "Task 2: Write an essay of at least 250 words.", diem: 20 }
            ]
          }
        ]
      }
    ]
  };
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=ielts_3skills_template.json");
  res.json(template);
};


const createDeThi = async (req, res) => {
  try {
    const { ten_de, mo_ta, loai, thoi_gian_phut, cau_hois } = req.body;
    const file_pdf = req.files?.file_pdf?.[0]?.filename || null;
    const file_audio = req.files?.file_audio?.[0]?.filename || null;

    const cauHoisArr = typeof cau_hois === 'string' ? JSON.parse(cau_hois) : (cau_hois || []);
    const so_cau_nghe = cauHoisArr.filter(c => c.phan === 'nghe').length;
    const so_cau_doc = cauHoisArr.filter(c => c.phan === 'doc').length;

    const de = await DeThi.create({
      ten_de, mo_ta, loai, thoi_gian_phut: thoi_gian_phut || 60,
      file_pdf, file_audio,
      so_cau_nghe, so_cau_doc,
      created_by: req.user?.id, trang_thai: "hoat_dong",
    });

    if (cauHoisArr.length > 0) {
      await CauHoi.bulkCreate(cauHoisArr.map((c, i) => ({
        de_thi_id: de.id, stt: i + 1,
        phan: c.phan || 'doc',
        ky_nang: c.phan || c.ky_nang || 'doc',
        noi_dung: c.noi_dung,
        lua_chon: c.lua_chon,
        dap_an_dung: c.dap_an_dung,
        diem: c.diem || 1,
      })));
    }

    res.status(201).json({ success: true, data: de, message: "Tạo đề thi thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/exam/de-thi/:id
const updateDeThi = async (req, res) => {
  try {
    const de = await DeThi.findByPk(req.params.id);
    if (!de) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await de.update(req.body);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/exam/de-thi/:id
const deleteDeThi = async (req, res) => {
  try {
    await DeThi.update({ trang_thai: "tam_dung" }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/exam/de-thi/:id/publish - Publish/Công bố đề thi
const publishDeThi = async (req, res) => {
  try {
    const de = await DeThi.findByPk(req.params.id);
    if (!de) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
    
    const { trang_thai } = req.body;
    await de.update({ trang_thai: trang_thai || "hoat_dong" });
    
    res.json({ success: true, message: trang_thai === "tam_dung" ? "Đã tạm dừng đề thi" : "Đã công bố đề thi", data: { trang_thai: de.trang_thai } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/exam/de-thi/:id/cap-nhat - Cập nhật đề thi (bao gồm cả file)
const updateDeThiFull = async (req, res) => {
  try {
    const de = await DeThi.findByPk(req.params.id);
    if (!de) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
    
    const { ten_de, mo_ta, loai, thoi_gian_phut, trang_thai, json_data } = req.body;
    const file_pdf = req.files?.file_pdf?.[0]?.filename || null;
    const file_audio = req.files?.file_audio?.[0]?.filename || null;
    
    const updateData = {};
    if (ten_de) updateData.ten_de = ten_de;
    if (mo_ta !== undefined) updateData.mo_ta = mo_ta;
    if (loai) updateData.loai = loai;
    if (thoi_gian_phut) updateData.thoi_gian_phut = thoi_gian_phut;
    if (trang_thai) updateData.trang_thai = trang_thai;
    if (json_data) updateData.json_data = json_data;
    if (file_pdf) updateData.file_pdf = file_pdf;
    if (file_audio) updateData.file_audio = file_audio;
    
    await de.update(updateData);
    res.json({ success: true, message: "Cập nhật thành công", data: de });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/exam/de-thi/:id/cau-hoi — thêm câu hỏi vào đề
const addCauHoi = async (req, res) => {
  try {
    const { phan, ky_nang, noi_dung, lua_chon, dap_an_dung, diem } = req.body;
    const count = await CauHoi.count({ where: { de_thi_id: req.params.id } });
    const ch = await CauHoi.create({
      de_thi_id: req.params.id, stt: count + 1,
      phan: phan || 'doc',
      ky_nang: phan || ky_nang || 'doc',
      noi_dung, lua_chon, dap_an_dung, diem: diem || 1,
    });
    // Cập nhật so_cau_nghe / so_cau_doc
    const nghe = await CauHoi.count({ where: { de_thi_id: req.params.id, phan: 'nghe' } });
    const doc = await CauHoi.count({ where: { de_thi_id: req.params.id, phan: 'doc' } });
    await DeThi.update({ so_cau_nghe: nghe, so_cau_doc: doc }, { where: { id: req.params.id } });
    res.status(201).json({ success: true, data: ch });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/exam/cau-hoi/:id
const deleteCauHoi = async (req, res) => {
  try {
    await CauHoi.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== LAM BAI ====================

// POST /api/exam/bat-dau — học viên bắt đầu làm bài
// FIX: Cho phép không cần auth, lấy thông tin từ lich_hen_test
const batDauLamBai = async (req, res) => {
  try {
    const { de_thi_id, lich_hen_test_id } = req.body;
    
    let hoc_vien_id = req.user?.id;
    
    // Nếu không có auth, lấy hoc_vien_id từ lich_hen_test
    if (!hoc_vien_id && lich_hen_test_id) {
      const lich = await LichHenTest.findByPk(lich_hen_test_id, {
        include: [{ model: NguoiDung, as: "hocVien", attributes: ["id"] }]
      });
      if (lich?.hocVien) {
        hoc_vien_id = lich.hocVien.id;
      }
    }
    
    if (!hoc_vien_id) {
      return res.status(400).json({ success: false, message: "Không xác định được học viên" });
    }

    // Kiểm tra đã có kết quả chưa
    let kq = await KetQuaDeThi.findOne({
      where: { de_thi_id, hoc_vien_id, trang_thai: { [Op.in]: ["chua_lam","dang_lam"] } },
    });

    if (!kq) {
      kq = await KetQuaDeThi.create({
        de_thi_id, hoc_vien_id,
        lich_hen_test_id: lich_hen_test_id || null,
        trang_thai: "dang_lam",
        bat_dau_luc: new Date(),
      });
    } else if (kq.trang_thai === "chua_lam") {
      await kq.update({ trang_thai: "dang_lam", bat_dau_luc: new Date() });
    }

    // Lấy đề thi + câu hỏi + passages (không có đáp án đúng)
    const de = await DeThi.findByPk(de_thi_id, {
      include: [
        {
          model: Passage,
          as: "passages",
          attributes: ["id","title","content","order_index","section_type"],
        },
        {
          model: CauHoi, as: "cauHois",
          attributes: ["id","stt","phan","ky_nang","loai_cau","noi_dung","lua_chon","diem","hinh_anh","huong_dan","passage","passage_id","bai_tap_id","order_index"],
          order: [["stt","ASC"]],
        },
      ],
    });
    
    console.log("[batDauLamBai] DeThi:", de ? { id: de.id, ten_de: de.ten_de, cauHois: de.cauHois?.length, passages: de.passages?.length } : "null");

    // Lấy câu đã trả lời
    const daDone = await BaiLam.findAll({ where: { ket_qua_de_thi_id: kq.id } });
    const doneMap = {};
    daDone.forEach(b => { doneMap[b.cau_hoi_id] = b.dap_an_chon; });

    res.json({ success: true, data: { ket_qua_id: kq.id, de_thi: de, da_tra_loi: doneMap } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/exam/tra-loi — lưu từng câu trả lời
const traLoi = async (req, res) => {
  try {
    const { ket_qua_de_thi_id, cau_hoi_id, dap_an_chon } = req.body;

    const cauHoi = await CauHoi.findByPk(cau_hoi_id);
    if (!cauHoi) return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });

    const dung_sai = cauHoi.dap_an_dung && dap_an_chon === cauHoi.dap_an_dung;
    const diem_duoc = dung_sai ? parseFloat(cauHoi.diem) : 0;

    const [bl] = await BaiLam.findOrCreate({
      where: { ket_qua_de_thi_id, cau_hoi_id },
      defaults: { dap_an_chon, dung_sai, diem_duoc },
    });
    if (bl.dap_an_chon !== dap_an_chon) {
      await bl.update({ dap_an_chon, dung_sai, diem_duoc });
    }

    res.json({ success: true, data: { dung_sai, diem_duoc } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/exam/nop-bai — nộp bài, tính điểm tổng
const nopBai = async (req, res) => {
  try {
    const { ket_qua_de_thi_id } = req.body;

    const kq = await KetQuaDeThi.findByPk(ket_qua_de_thi_id, {
      include: [{
        model: BaiLam, as: "baiLams",
        include: [{ model: CauHoi, as: "cauHoi", attributes: ["id","phan","dap_an_dung","diem","noi_dung","lua_chon"] }],
      }],
    });
    if (!kq) return res.status(404).json({ success: false, message: "Không tìm thấy" });

    // Tính điểm theo phần
    let diem_nghe = 0, diem_doc = 0, so_dung_nghe = 0, so_dung_doc = 0;
    let tong_nghe = 0, tong_doc = 0;

    kq.baiLams.forEach(b => {
      const phan = b.cauHoi?.phan || 'doc';
      const dung = b.dung_sai;
      const diem = parseFloat(b.diem_duoc || 0);
      if (phan === 'nghe') { diem_nghe += diem; if (dung) so_dung_nghe++; tong_nghe++; }
      else { diem_doc += diem; if (dung) so_dung_doc++; tong_doc++; }
    });

    // Lấy tổng câu từ đề thi
    const de = await DeThi.findByPk(kq.de_thi_id);
    const totalNghe = de?.so_cau_nghe || tong_nghe;
    const totalDoc = de?.so_cau_doc || tong_doc;

    const diem_tong = Math.round((diem_nghe + diem_doc) * 100) / 100;
    const thoi_gian_lam = kq.bat_dau_luc
      ? Math.round((new Date() - new Date(kq.bat_dau_luc)) / 1000)
      : null;

    await kq.update({
      diem_tong,
      thoi_gian_lam,
      hoan_thanh_luc: new Date(),
      trang_thai: "hoan_thanh",
    });

    // Cập nhật trạng thái lịch hẹn test nếu có
    if (kq.lich_hen_test_id) {
      await LichHenTest.update(
        { trang_thai: "hoan_thanh" },
        { where: { id: kq.lich_hen_test_id } }
      );
      // Cập nhật KetQuaLichTest với điểm thực tế
      await KetQuaLichTest.update(
        {
          diem_tong,
          diem_nghe: Math.round(diem_nghe * 100) / 100,
          diem_doc:  Math.round(diem_doc  * 100) / 100,
          thoi_gian_lam,
          trang_thai: "hoan_thanh",
          ngay_lam: new Date(),
        },
        { where: { lich_hen_test_id: kq.lich_hen_test_id } }
      );
    }

    // Build chi tiết từng câu
    const chi_tiet = kq.baiLams.map(b => ({
      cau_hoi_id: b.cau_hoi_id,
      phan: b.cauHoi?.phan,
      noi_dung: b.cauHoi?.noi_dung,
      dap_an_chon: b.dap_an_chon,
      dap_an_dung: b.cauHoi?.dap_an_dung,
      dung: b.dung_sai,
      diem_duoc: b.diem_duoc,
    }));

    res.json({
      success: true,
      data: {
        diem_tong,
        diem_nghe: Math.round(diem_nghe * 100) / 100,
        diem_doc: Math.round(diem_doc * 100) / 100,
        so_dung_nghe, tong_nghe: totalNghe,
        so_dung_doc, tong_doc: totalDoc,
        thoi_gian_lam,
        chi_tiet,
      },
      message: `Nộp bài thành công! Nghe: ${so_dung_nghe}/${totalNghe} | Đọc: ${so_dung_doc}/${totalDoc}`,
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/ket-qua-by-lich/:lichHenTestId — admin xem kết quả theo lịch hẹn
const getKetQuaByLich = async (req, res) => {
  try {
    const list = await KetQuaDeThi.findAll({
      where: { lich_hen_test_id: req.params.lichHenTestId },
      include: [
        { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai","thoi_gian_phut","so_cau_nghe","so_cau_doc"] },
        { model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt"] },
        {
          model: BaiLam, as: "baiLams",
          include: [{ model: CauHoi, as: "cauHoi", attributes: ["id","stt","phan","noi_dung","lua_chon","dap_an_dung","diem"] }],
          order: [["id","ASC"]],
        },
      ],
      order: [["bat_dau_luc","DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/ket-qua/:id — xem kết quả chi tiết
const getKetQua = async (req, res) => {
  try {
    const kq = await KetQuaDeThi.findByPk(req.params.id, {
      include: [
        { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai","thoi_gian_phut"] },
        { model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt"] },
        {
          model: BaiLam, as: "baiLams",
          include: [{ model: CauHoi, as: "cauHoi" }],
          order: [["id","ASC"]],
        },
      ],
    });
    if (!kq) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: kq });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/my-results — học viên xem kết quả của mình
const getMyResults = async (req, res) => {
  try {
    const list = await KetQuaDeThi.findAll({
      where: { hoc_vien_id: req.user.id },
      include: [{ model: DeThi, as: "deThi", attributes: ["id","ten_de","loai","thoi_gian_phut"] }],
      order: [["bat_dau_luc","DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/exam/admin/ket-qua — admin xem tất cả kết quả
const getAllKetQua = async (req, res) => {
  try {
    const { de_thi_id, hoc_vien_id } = req.query;
    const where = { trang_thai: "hoan_thanh" };
    if (de_thi_id) where.de_thi_id = de_thi_id;
    if (hoc_vien_id) where.hoc_vien_id = hoc_vien_id;

    const list = await KetQuaDeThi.findAll({
      where,
      include: [
        { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai"] },
        { model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt","email"] },
      ],
      order: [["hoan_thanh_luc","DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== PASSAGE APIs ====================

// POST /api/exam/passages — tạo passage mới
const createPassage = async (req, res) => {
  try {
    const { de_thi_id, title, content, order_index, section_type } = req.body;
    const p = await Passage.create({ de_thi_id, title, content, order_index: order_index || 1, section_type: section_type || "reading" });
    res.status(201).json({ success: true, data: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/exam/passages/:id
const updatePassage = async (req, res) => {
  try {
    const p = await Passage.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await p.update(req.body);
    res.json({ success: true, data: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/exam/passages/:id
const deletePassage = async (req, res) => {
  try {
    await Passage.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  getAllDeThi, getDeThiById, createDeThi, updateDeThi, deleteDeThi,
  uploadDeThiJSON, downloadTemplate,
  uploadDeThiExcel, downloadTemplateExcel,
  createPassage, updatePassage, deletePassage,
  addCauHoi, deleteCauHoi,
  batDauLamBai, traLoi, nopBai,
  getKetQua, getKetQuaByLich, getMyResults, getAllKetQua,
  publishDeThi, updateDeThiFull,
};
