const { DeThi, CauHoi, KetQuaDeThi, BaiLam } = require("../models/ExamModels");
const { NguoiDung } = require("../models/UserModels");
const { LichHenTest } = require("../models/TestModels");
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
      include: [{
        model: CauHoi, as: "cauHois",
        attributes: ["id","stt","ky_nang","noi_dung","lua_chon","diem","hinh_anh"],
        order: [["stt","ASC"]],
      }],
    });
    if (!de) return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
    res.json({ success: true, data: de });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/exam/de-thi — tạo đề thi + câu hỏi
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

    // Lấy đề thi + câu hỏi (không có đáp án đúng)
    const de = await DeThi.findByPk(de_thi_id, {
      include: [{
        model: CauHoi, as: "cauHois",
        attributes: ["id","stt","phan","ky_nang","noi_dung","lua_chon","diem","hinh_anh"],
        order: [["stt","ASC"]],
      }],
    });
    
    console.log("[batDauLamBai] DeThi:", de ? { id: de.id, ten_de: de.ten_de, cauHois: de.cauHois?.length } : "null");

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

module.exports = {
  getAllDeThi, getDeThiById, createDeThi, updateDeThi, deleteDeThi,
  addCauHoi, deleteCauHoi,
  batDauLamBai, traLoi, nopBai,
  getKetQua, getMyResults, getAllKetQua,
};
