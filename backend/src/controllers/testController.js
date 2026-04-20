const bcrypt = require("bcryptjs");
const path = require("path");
const { DeThi, LichHenTest, KetQuaLichTest } = require("../models/TestModels");
const { NguoiDung } = require("../models/UserModels");
const { Op } = require("sequelize");

// ==================== DE THI ====================

const getDeThi = async (req, res) => {
  try {
    // Sử dụng câu query trực tiếp vì bảng de_thi đã có sẵn cấu trúc khác
    const list = await DeThi.findAll({
      where: { trang_thai: "dang_mo" },
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createDeThi = async (req, res) => {
  try {
    const { ten_de, mo_ta, loai } = req.body;
    const file_pdf = req.file ? req.file.filename : null;
    const de = await DeThi.create({ ten_de, mo_ta, loai, file_pdf, created_by: req.user?.id });
    res.status(201).json({ success: true, data: de });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteDeThi = async (req, res) => {
  try {
    await DeThi.update({ trang_thai: "tam_dung" }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== LICH HEN TEST ====================

const getLichHenTest = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, trang_thai } = req.query;
    const where = {};
    if (trang_thai && trang_thai !== "all") where.trang_thai = trang_thai;

    const include = [
      { model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt","email"],
        ...(search ? { where: { [Op.or]: [
          { ho_ten: { [Op.like]: `%${search}%` } },
          { sdt: { [Op.like]: `%${search}%` } },
        ]}} : {}) },
      { model: NguoiDung, as: "giaoVien", attributes: ["id","ho_ten"] },
      { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai","file_pdf","file_audio","thoi_gian_phut"] },
      { model: KetQuaLichTest, as: "ketQuas",
        include: [{ model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten"] }] },
    ];

    const { count, rows } = await LichHenTest.findAndCountAll({
      where, include,
      order: [["thoi_gian", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true,
    });

    res.json({ success: true, data: { list: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createLichHenTest = async (req, res) => {
  try {
    const { hoc_vien_id, giao_vien_id, lead_id, de_thi_id, dia_diem, thoi_gian, ghi_chu,
            ho_ten_hv, sdt_hv, email_hv } = req.body;

    let finalHocVienId = hoc_vien_id || null;

    // Nếu chưa có hoc_vien_id → tạo account học viên từ thông tin lead
    if (!finalHocVienId && sdt_hv) {
      let existing = await NguoiDung.findOne({ where: { sdt: sdt_hv } });
      if (!existing && email_hv) {
        existing = await NguoiDung.findOne({ where: { email: email_hv } });
      }
      if (!existing) {
        const hashed = await bcrypt.hash("123456", 10);
        const uniqueEmail = email_hv || `hv_${sdt_hv}_${Date.now()}@nta.vn`;
        existing = await NguoiDung.create({
          ho_ten: ho_ten_hv || "Học viên",
          email: uniqueEmail,
          sdt: sdt_hv,
          mat_khau: hashed,
          chuc_vu_id: 5,
          trang_thai: "hoat_dong",
        });
      }
      finalHocVienId = existing.id;
    }

    const lich = await LichHenTest.create({
      hoc_vien_id: finalHocVienId || null,
      giao_vien_id: giao_vien_id || null,
      lead_id: lead_id || null,
      de_thi_id: de_thi_id || null,
      dia_diem: dia_diem || null,
      thoi_gian: thoi_gian || null,
      ghi_chu: ghi_chu || null,
      trang_thai: "dang_test", // Tự động chuyển sang "đang kiểm tra"
    });

    // Tạo bản ghi kết quả trống (chỉ khi có đủ thông tin)
    if (finalHocVienId) {
      await KetQuaLichTest.create({
        lich_hen_test_id: lich.id,
        hoc_vien_id: finalHocVienId,
        trang_thai: "chua_lam",
      });
    }

    const result = await LichHenTest.findByPk(lich.id, {
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt","email"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id","ho_ten"] },
        { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai"] },
        { model: KetQuaLichTest, as: "ketQuas" },
      ],
    });

    res.status(201).json({ success: true, data: result, message: "Tạo lịch hẹn test thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateLichHenTest = async (req, res) => {
  try {
    const lich = await LichHenTest.findByPk(req.params.id);
    if (!lich) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await lich.update(req.body);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteLichHenTest = async (req, res) => {
  try {
    await LichHenTest.update({ trang_thai: "huy" }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== KET QUA ====================

const updateKetQua = async (req, res) => {
  try {
    const kq = await KetQuaLichTest.findByPk(req.params.id);
    if (!kq) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await kq.update({ ...req.body, trang_thai: "hoan_thanh", ngay_lam: new Date() });
    // Cập nhật trạng thái lịch hẹn
    await LichHenTest.update({ trang_thai: "hoan_thanh" }, { where: { id: kq.lich_hen_test_id } });
    res.json({ success: true, data: kq });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== PORTAL HOC VIEN ====================

const getMyLichTest = async (req, res) => {
  try {
    const list = await LichHenTest.findAll({
      where: { hoc_vien_id: req.user.id },
      include: [
        { model: DeThi, as: "deThi", attributes: ["id","ten_de","loai","file_pdf","file_audio","thoi_gian_phut"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id","ho_ten"] },
        { model: KetQuaLichTest, as: "ketQuas" },
      ],
      order: [["thoi_gian", "DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  getDeThi, createDeThi, deleteDeThi,
  getLichHenTest, createLichHenTest, updateLichHenTest, deleteLichHenTest,
  updateKetQua,
  getMyLichTest,
};
