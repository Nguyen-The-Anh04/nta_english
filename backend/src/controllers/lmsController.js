const models = require("../models");
const { KhoaHoc, PhongHoc, LopHoc, DkLopHoc, LichHoc, HopDong, ThanhToanHocPhi, NguoiDung } = models;
const { Op } = require("sequelize");

// ==================== KHOA HOC ====================

const getKhoaHocs = async (req, res) => {
  try {
    const khoaHocs = await KhoaHoc.findAll({ order: [["created_at", "DESC"]] });
    res.json({ success: true, data: khoaHocs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createKhoaHoc = async (req, res) => {
  try {
    const kh = await KhoaHoc.create(req.body);
    res.status(201).json({ success: true, data: kh });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateKhoaHoc = async (req, res) => {
  try {
    const kh = await KhoaHoc.findByPk(req.params.id);
    if (!kh) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await kh.update(req.body);
    res.json({ success: true, data: kh });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteKhoaHoc = async (req, res) => {
  try {
    const kh = await KhoaHoc.findByPk(req.params.id);
    if (!kh) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await kh.destroy();
    res.json({ success: true, message: "Đã xóa" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== PHONG HOC ====================

const getPhongHocs = async (req, res) => {
  try {
    const phongs = await PhongHoc.findAll({ order: [["ma_phong", "ASC"]] });
    res.json({ success: true, data: phongs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== LOP HOC ====================

const getLopHocs = async (req, res) => {
  try {
    const { trang_thai, khoa_hoc_id, search, giao_vien_id } = req.query;
    const where = {};
    if (trang_thai) where.trang_thai = trang_thai;
    if (khoa_hoc_id) where.khoa_hoc_id = khoa_hoc_id;
    if (giao_vien_id) where.giao_vien_id = giao_vien_id;
    if (search) where.ma_lop = { [Op.like]: `%${search}%` };

    const lops = await LopHoc.findAll({
      where,
      include: [
        { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa", "hoc_phi"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten", "email"] },
        { model: PhongHoc, as: "phongHoc", attributes: ["id", "ma_phong", "suc_chua"] },
        { model: LichHoc, as: "lichHocs" },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: lops });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getLopHocById = async (req, res) => {
  try {
    const lop = await LopHoc.findByPk(req.params.id, {
      include: [
        { model: KhoaHoc, as: "khoaHoc" },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten", "email", "sdt"] },
        { model: PhongHoc, as: "phongHoc" },
        { model: LichHoc, as: "lichHocs" },
        {
          model: DkLopHoc, as: "dangKys",
          include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email", "sdt"] }],
        },
      ],
    });
    if (!lop) return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
    res.json({ success: true, data: lop });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createLopHoc = async (req, res) => {
  try {
    const { lich_hocs, ...lopData } = req.body;
    const lop = await LopHoc.create(lopData);

    if (lich_hocs && lich_hocs.length > 0) {
      await LichHoc.bulkCreate(lich_hocs.map(l => ({ ...l, lop_hoc_id: lop.id })));
    }

    const result = await LopHoc.findByPk(lop.id, {
      include: [
        { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
        { model: LichHoc, as: "lichHocs" },
      ],
    });
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateLopHoc = async (req, res) => {
  try {
    const lop = await LopHoc.findByPk(req.params.id);
    if (!lop) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    const { lich_hocs, ...lopData } = req.body;
    await lop.update(lopData);

    if (lich_hocs) {
      await LichHoc.destroy({ where: { lop_hoc_id: lop.id } });
      if (lich_hocs.length > 0) {
        await LichHoc.bulkCreate(lich_hocs.map(l => ({ ...l, lop_hoc_id: lop.id })));
      }
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== DANG KY HOC VIEN ====================

const getDangKyByLop = async (req, res) => {
  try {
    const dks = await DkLopHoc.findAll({
      where: { lop_hoc_id: req.params.lopId },
      include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email", "sdt"] }],
    });
    res.json({ success: true, data: dks });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const addHocVienVaoLop = async (req, res) => {
  try {
    const { hoc_vien_id, lop_hoc_id, ghi_chu } = req.body;

    const existing = await DkLopHoc.findOne({ where: { hoc_vien_id, lop_hoc_id } });
    if (existing) return res.status(400).json({ success: false, message: "Học viên đã có trong lớp này" });

    const lop = await LopHoc.findByPk(lop_hoc_id);
    if (!lop) return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });

    const dk = await DkLopHoc.create({ hoc_vien_id, lop_hoc_id, ghi_chu, trang_thai: "da_xac_nhan" });
    await lop.update({ si_so_hien_tai: lop.si_so_hien_tai + 1 });

    res.status(201).json({ success: true, data: dk, message: "Thêm học viên vào lớp thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateDangKy = async (req, res) => {
  try {
    const dk = await DkLopHoc.findByPk(req.params.id);
    if (!dk) return res.status(404).json({ success: false, message: "Không tìm thấy" });

    const oldStatus = dk.trang_thai;
    await dk.update(req.body);

    // Cập nhật sĩ số nếu hủy
    if (req.body.trang_thai === "da_huy" && oldStatus !== "da_huy") {
      const lop = await LopHoc.findByPk(dk.lop_hoc_id);
      if (lop && lop.si_so_hien_tai > 0) {
        await lop.update({ si_so_hien_tai: lop.si_so_hien_tai - 1 });
      }
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== HOC VIEN ====================

const getHocViens = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = { chuc_vu_id: 5 };
    if (search) {
      where[Op.or] = [
        { ho_ten: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { sdt: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (page - 1) * limit;
    const { count, rows } = await NguoiDung.findAndCountAll({
      where,
      attributes: ["id", "ho_ten", "email", "sdt", "trang_thai", "gioi_tinh", "created_at"],
      include: [{
        model: DkLopHoc, as: "dangKyLops",
        include: [{ model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop", "trang_thai"],
          include: [{ model: KhoaHoc, as: "khoaHoc", attributes: ["ten_khoa"] }] }],
      }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });
    res.json({ success: true, data: { hocViens: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message }); }
};

const createHocVien = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { ho_ten, email, sdt, mat_khau } = req.body;

    const existing = await NguoiDung.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(mat_khau || "123456", 10);
    const hv = await NguoiDung.create({ ho_ten, email, sdt, mat_khau: hashed, chuc_vu_id: 5, trang_thai: "hoat_dong" });
    res.status(201).json({ success: true, data: { id: hv.id, ho_ten: hv.ho_ten, email: hv.email, sdt: hv.sdt }, message: "Tạo học viên thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateHocVien = async (req, res) => {
  try {
    const hv = await NguoiDung.findByPk(req.params.id);
    if (!hv) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    const { mat_khau, ...data } = req.body;
    await hv.update(data);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== HOP DONG ====================

const getHopDongs = async (req, res) => {
  try {
    const { hoc_vien_id, trang_thai } = req.query;
    const where = {};
    if (hoc_vien_id) where.hoc_vien_id = hoc_vien_id;
    if (trang_thai) where.trang_thai = trang_thai;

    const hds = await HopDong.findAll({
      where,
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email", "sdt"] },
        { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa", "hoc_phi"] },
        { model: ThanhToanHocPhi, as: "thanhToans" },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = hds.map(hd => ({
      ...hd.toJSON(),
      con_no: parseFloat(hd.tong_tien) - parseFloat(hd.da_tra),
    }));
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createHopDong = async (req, res) => {
  try {
    const ma_hd = "HD" + Date.now();
    const hd = await HopDong.create({ ...req.body, ma_hd });
    res.status(201).json({ success: true, data: hd, message: "Tạo hợp đồng thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createThanhToan = async (req, res) => {
  try {
    const hd = await HopDong.findByPk(req.body.hop_dong_id);
    if (!hd) return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng" });

    const tt = await ThanhToanHocPhi.create({ ...req.body, trang_thai: "da_thanh_toan", ngay_tt: new Date() });

    // Cập nhật da_tra trong hợp đồng
    const newDaTra = parseFloat(hd.da_tra) + parseFloat(req.body.so_tien);
    const newTrangThai = newDaTra >= parseFloat(hd.tong_tien) ? "hoan_thanh" : "hoat_dong";
    await hd.update({ da_tra: newDaTra, trang_thai: newTrangThai });

    res.status(201).json({ success: true, data: tt, message: "Ghi nhận thanh toán thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== GIAO VIEN ====================

const getGiaoViens = async (req, res) => {
  try {
    const gvs = await NguoiDung.findAll({
      where: { chuc_vu_id: 3 },
      attributes: ["id", "ho_ten", "email", "sdt", "trang_thai"],
    });
    res.json({ success: true, data: gvs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getKhoaHocs, createKhoaHoc, updateKhoaHoc, deleteKhoaHoc,
  getPhongHocs,
  getLopHocs, getLopHocById, createLopHoc, updateLopHoc,
  getDangKyByLop, addHocVienVaoLop, updateDangKy,
  getHocViens, createHocVien, updateHocVien,
  getHopDongs, createHopDong, createThanhToan,
  getGiaoViens,
};

// ==================== MODULE 2: DIEM DANH ====================
const { DiemDanh, BaiTap, NopBai, DiemSo, DanhGiaGiaoVien } = models;

// POST /api/lms/diem-danh/bulk - Điểm danh cả buổi
const diemDanhBulk = async (req, res) => {
  try {
    const { lop_hoc_id, lich_hoc_id, ngay, danh_sach } = req.body;
    // danh_sach: [{ dk_lop_hoc_id, trang_thai, ghi_chu }]
    const results = [];
    for (const item of danh_sach) {
      const [dd, created] = await DiemDanh.findOrCreate({
        where: { dk_lop_hoc_id: item.dk_lop_hoc_id, ngay },
        defaults: { lich_hoc_id, trang_thai: item.trang_thai || "co_mat", ghi_chu: item.ghi_chu || null },
      });
      if (!created) await dd.update({ trang_thai: item.trang_thai, ghi_chu: item.ghi_chu });
      results.push(dd);
    }
    res.json({ success: true, message: `Điểm danh ${results.length} học viên thành công`, data: results });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/diem-danh/:lopId - Lấy điểm danh theo lớp + ngày
const getDiemDanh = async (req, res) => {
  try {
    const { ngay } = req.query;
    const { lopId } = req.params;

    const dangKys = await DkLopHoc.findAll({
      where: { lop_hoc_id: lopId, trang_thai: "da_xac_nhan" },
      include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email"] }],
    });

    const result = await Promise.all(dangKys.map(async (dk) => {
      let dd = null;
      if (ngay) {
        dd = await DiemDanh.findOne({ where: { dk_lop_hoc_id: dk.id, ngay } });
      }
      return { dk_lop_hoc_id: dk.id, hoc_vien: dk.hocVien, trang_thai: dd?.trang_thai || null, ghi_chu: dd?.ghi_chu || null, da_diem_danh: !!dd };
    }));

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/diem-danh/:lopId/lich-su - Lịch sử điểm danh
const getLichSuDiemDanh = async (req, res) => {
  try {
    const { lopId } = req.params;
    const dangKys = await DkLopHoc.findAll({
      where: { lop_hoc_id: lopId },
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] },
        { model: DiemDanh, as: "diemDanhs", order: [["ngay", "DESC"]] },
      ],
    });
    res.json({ success: true, data: dangKys });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== MODULE 2: BAI TAP ====================

// GET /api/lms/bai-tap?lop_hoc_id=
const getBaiTaps = async (req, res) => {
  try {
    const { lop_hoc_id, giao_vien_id } = req.query;
    const where = {};
    if (lop_hoc_id) where.lop_hoc_id = lop_hoc_id;
    if (giao_vien_id) where.giao_vien_id = giao_vien_id;

    const baiTaps = await BaiTap.findAll({
      where,
      include: [
        { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
        { model: NopBai, as: "nopBais", attributes: ["id", "hoc_vien_id", "trang_thai"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: baiTaps });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/bai-tap/:id - Chi tiết bài tập + danh sách nộp bài
const getBaiTapById = async (req, res) => {
  try {
    const bt = await BaiTap.findByPk(req.params.id, {
      include: [
        { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"],
          include: [{ model: DkLopHoc, as: "dangKys",
            include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email"] }] }] },
        { model: NopBai, as: "nopBais",
          include: [
            { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] },
            { model: DiemSo, as: "diemSo" },
          ] },
      ],
    });
    if (!bt) return res.status(404).json({ success: false, message: "Không tìm thấy bài tập" });
    res.json({ success: true, data: bt });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/lms/bai-tap
const createBaiTap = async (req, res) => {
  try {
    const bt = await BaiTap.create(req.body);
    res.status(201).json({ success: true, data: bt, message: "Tạo bài tập thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/lms/bai-tap/:id
const updateBaiTap = async (req, res) => {
  try {
    const bt = await BaiTap.findByPk(req.params.id);
    if (!bt) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await bt.update(req.body);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== MODULE 2: CHAM DIEM ====================

// POST /api/lms/cham-diem - Chấm điểm bài nộp
const chamDiem = async (req, res) => {
  try {
    const { nop_bai_id, bai_tap_id, hoc_vien_id, diem, band_score, nhan_xet } = req.body;
    const giao_vien_cham_id = req.user?.id || req.body.giao_vien_cham_id;

    const [ds, created] = await DiemSo.findOrCreate({
      where: { bai_tap_id, hoc_vien_id },
      defaults: { nop_bai_id, diem, band_score, nhan_xet, giao_vien_cham_id, ngay_cham: new Date() },
    });
    if (!created) await ds.update({ diem, band_score, nhan_xet, ngay_cham: new Date() });

    res.json({ success: true, data: ds, message: created ? "Chấm điểm thành công" : "Cập nhật điểm thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/diem-so/:lopId - Bảng điểm cả lớp
const getDiemSoLop = async (req, res) => {
  try {
    const { lopId } = req.params;
    const baiTaps = await BaiTap.findAll({
      where: { lop_hoc_id: lopId },
      include: [{ model: DiemSo, as: "diemSos",
        include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] }] }],
      order: [["created_at", "ASC"]],
    });
    res.json({ success: true, data: baiTaps });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== MODULE 2: DANH GIA GIAO VIEN ====================

// POST /api/lms/danh-gia-gv
const createDanhGia = async (req, res) => {
  try {
    const dg = await DanhGiaGiaoVien.create(req.body);
    res.status(201).json({ success: true, data: dg });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/danh-gia-gv/:giaoVienId
const getDanhGiaGiaoVien = async (req, res) => {
  try {
    const dgs = await DanhGiaGiaoVien.findAll({
      where: { giao_vien_id: req.params.giaoVienId },
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] },
        { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"] },
      ],
      order: [["created_at", "DESC"]],
    });
    // Tính điểm trung bình
    const avg_giang_day = dgs.length ? (dgs.reduce((s, d) => s + (d.diem_giang_day || 0), 0) / dgs.length).toFixed(1) : 0;
    const avg_thai_do = dgs.length ? (dgs.reduce((s, d) => s + (d.diem_thai_do || 0), 0) / dgs.length).toFixed(1) : 0;
    res.json({ success: true, data: dgs, avg_giang_day, avg_thai_do });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  ...module.exports,
  diemDanhBulk, getDiemDanh, getLichSuDiemDanh,
  getBaiTaps, getBaiTapById, createBaiTap, updateBaiTap,
  chamDiem, getDiemSoLop,
  createDanhGia, getDanhGiaGiaoVien,
};

// ==================== MODULE 3: KE TOAN ====================
const { PhieuThu, PhieuChi } = models;
const sequelize = require("../config/db");

// GET /api/lms/ke-toan/tong-quan - Dashboard kế toán
const getKeToanTongQuan = async (req, res) => {
  try {
    const { thang, nam } = req.query;
    const now = new Date();
    const m = parseInt(thang) || now.getMonth() + 1;
    const y = parseInt(nam) || now.getFullYear();

    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = new Date(y, m, 0).toISOString().split("T")[0];

    // Tổng thu trong tháng
    const tongThu = await PhieuThu.sum("tong_tien", {
      where: { ngay_thu: { [Op.between]: [startDate, endDate] } },
    });

    // Tổng chi trong tháng
    const tongChi = await PhieuChi.sum("tong_tien", {
      where: { ngay_chi: { [Op.between]: [startDate, endDate] } },
    });

    // Tổng công nợ (hợp đồng còn nợ)
    const hopDongs = await HopDong.findAll({ where: { trang_thai: "hoat_dong" } });
    const tongConNo = hopDongs.reduce((s, hd) => s + (parseFloat(hd.tong_tien) - parseFloat(hd.da_tra)), 0);

    // Số HV còn nợ
    const soHVConNo = hopDongs.filter(hd => parseFloat(hd.tong_tien) > parseFloat(hd.da_tra)).length;

    // Doanh thu theo tháng (6 tháng gần nhất)
    const doanhThuTheoThang = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const me = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
      const thu = await PhieuThu.sum("tong_tien", { where: { ngay_thu: { [Op.between]: [ms, me] } } }) || 0;
      const chi = await PhieuChi.sum("tong_tien", { where: { ngay_chi: { [Op.between]: [ms, me] } } }) || 0;
      doanhThuTheoThang.push({ thang: `${d.getMonth() + 1}/${d.getFullYear()}`, thu, chi });
    }

    res.json({
      success: true,
      data: {
        tong_thu: tongThu || 0,
        tong_chi: tongChi || 0,
        loi_nhuan: (tongThu || 0) - (tongChi || 0),
        tong_con_no: tongConNo,
        so_hv_con_no: soHVConNo,
        doanh_thu_theo_thang: doanhThuTheoThang,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/ke-toan/cong-no - Danh sách công nợ
const getCongNo = async (req, res) => {
  try {
    const { search } = req.query;
    const hds = await HopDong.findAll({
      where: { trang_thai: "hoat_dong" },
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten", "email", "sdt"],
          ...(search ? { where: { [Op.or]: [
            { ho_ten: { [Op.like]: `%${search}%` } },
            { sdt: { [Op.like]: `%${search}%` } },
          ]}} : {}) },
        { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
        { model: ThanhToanHocPhi, as: "thanhToans", order: [["created_at", "DESC"]] },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = hds
      .filter(hd => hd.hocVien) // lọc nếu search không khớp
      .map(hd => ({
        ...hd.toJSON(),
        con_no: parseFloat(hd.tong_tien) - parseFloat(hd.da_tra),
        phan_tram_da_tra: hd.tong_tien > 0 ? Math.round((parseFloat(hd.da_tra) / parseFloat(hd.tong_tien)) * 100) : 0,
      }));

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/ke-toan/phieu-thu - Danh sách phiếu thu
const getPhieuThus = async (req, res) => {
  try {
    const { tu_ngay, den_ngay, page = 1, limit = 20 } = req.query;
    const where = {};
    if (tu_ngay && den_ngay) where.ngay_thu = { [Op.between]: [tu_ngay, den_ngay] };

    const { count, rows } = await PhieuThu.findAndCountAll({
      where,
      include: [
        { model: NguoiDung, as: "nguoiNop", attributes: ["id", "ho_ten", "sdt"] },
        { model: HopDong, as: "hopDong", attributes: ["id", "ma_hd"],
          include: [{ model: KhoaHoc, as: "khoaHoc", attributes: ["ten_khoa"] }] },
      ],
      order: [["ngay_thu", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/lms/ke-toan/phieu-thu
const createPhieuThu = async (req, res) => {
  try {
    const ma_phieu = "PT" + Date.now();
    const pt = await PhieuThu.create({ ...req.body, ma_phieu });

    // Nếu có hop_dong_id → cập nhật da_tra
    if (req.body.hop_dong_id) {
      const hd = await HopDong.findByPk(req.body.hop_dong_id);
      if (hd) {
        const newDaTra = parseFloat(hd.da_tra) + parseFloat(req.body.tong_tien);
        const newTrangThai = newDaTra >= parseFloat(hd.tong_tien) ? "hoan_thanh" : "hoat_dong";
        await hd.update({ da_tra: newDaTra, trang_thai: newTrangThai });
      }
    }

    res.status(201).json({ success: true, data: pt, message: "Tạo phiếu thu thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/ke-toan/phieu-chi
const getPhieuChis = async (req, res) => {
  try {
    const { tu_ngay, den_ngay, page = 1, limit = 20 } = req.query;
    const where = {};
    if (tu_ngay && den_ngay) where.ngay_chi = { [Op.between]: [tu_ngay, den_ngay] };

    const { count, rows } = await PhieuChi.findAndCountAll({
      where,
      include: [{ model: NguoiDung, as: "nguoiNhan", attributes: ["id", "ho_ten"] }],
      order: [["ngay_chi", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/lms/ke-toan/phieu-chi
const createPhieuChi = async (req, res) => {
  try {
    const ma_phieu = "PC" + Date.now();
    const pc = await PhieuChi.create({ ...req.body, ma_phieu });
    res.status(201).json({ success: true, data: pc, message: "Tạo phiếu chi thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/ke-toan/bao-cao - Báo cáo doanh thu theo khoảng thời gian
const getBaoCaoDoanhThu = async (req, res) => {
  try {
    const { tu_ngay, den_ngay } = req.query;
    const where_thu = tu_ngay && den_ngay ? { ngay_thu: { [Op.between]: [tu_ngay, den_ngay] } } : {};
    const where_chi = tu_ngay && den_ngay ? { ngay_chi: { [Op.between]: [tu_ngay, den_ngay] } } : {};

    const phieuThus = await PhieuThu.findAll({
      where: where_thu,
      include: [{ model: NguoiDung, as: "nguoiNop", attributes: ["ho_ten"] }],
      order: [["ngay_thu", "DESC"]],
    });

    const phieuChis = await PhieuChi.findAll({
      where: where_chi,
      include: [{ model: NguoiDung, as: "nguoiNhan", attributes: ["ho_ten"] }],
      order: [["ngay_chi", "DESC"]],
    });

    const tongThu = phieuThus.reduce((s, p) => s + parseFloat(p.tong_tien), 0);
    const tongChi = phieuChis.reduce((s, p) => s + parseFloat(p.tong_tien), 0);

    // Phân loại chi
    const chiTheoLoai = {};
    phieuChis.forEach(pc => {
      chiTheoLoai[pc.loai_chi] = (chiTheoLoai[pc.loai_chi] || 0) + parseFloat(pc.tong_tien);
    });

    res.json({
      success: true,
      data: {
        tong_thu: tongThu,
        tong_chi: tongChi,
        loi_nhuan: tongThu - tongChi,
        chi_theo_loai: chiTheoLoai,
        phieu_thus: phieuThus,
        phieu_chis: phieuChis,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  ...module.exports,
  getKeToanTongQuan, getCongNo,
  getPhieuThus, createPhieuThu,
  getPhieuChis, createPhieuChi,
  getBaoCaoDoanhThu,
};

// ==================== MODULE 4: PORTAL HOC VIEN ====================

// GET /api/lms/hoc-vien/portal/dashboard - Dashboard học viên
const getHocVienDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy các lớp đang học
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: userId, trang_thai: "da_xac_nhan" },
      include: [
        {
          model: LopHoc, as: "lopHoc",
          include: [
            { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
            { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
            { model: LichHoc, as: "lichHocs" },
          ],
        },
      ],
    });

    // Bài tập chưa nộp
    const lopIds = dangKys.map(dk => dk.lop_hoc_id);
    const baiTapChuaNop = lopIds.length > 0 ? await BaiTap.findAll({
      where: { lop_hoc_id: { [Op.in]: lopIds }, trang_thai: "dang_mo" },
      include: [{
        model: NopBai, as: "nopBais",
        where: { hoc_vien_id: userId },
        required: false,
      }],
    }).then(bts => bts.filter(bt => !bt.nopBais?.length)) : [];

    // Điểm gần nhất
    const diemGanNhat = await DiemSo.findAll({
      where: { hoc_vien_id: userId },
      include: [{ model: BaiTap, as: "baiTap", attributes: ["ten_bai", "loai_bai"] }],
      order: [["ngay_cham", "DESC"]],
      limit: 5,
    });

    // Điểm danh tháng này
    const startOfMonth = new Date(); startOfMonth.setDate(1);
    const diemDanhThang = await DiemDanh.findAll({
      where: {
        dk_lop_hoc_id: { [Op.in]: dangKys.map(dk => dk.id) },
        ngay: { [Op.gte]: startOfMonth.toISOString().split("T")[0] },
      },
    });
    const coMat = diemDanhThang.filter(d => d.trang_thai === "co_mat").length;
    const vangMat = diemDanhThang.filter(d => d.trang_thai === "vang_mat").length;

    res.json({
      success: true,
      data: {
        lop_hoc: dangKys,
        bai_tap_chua_nop: baiTapChuaNop.length,
        diem_gan_nhat: diemGanNhat,
        diem_danh: { co_mat: coMat, vang_mat: vangMat, tong: diemDanhThang.length },
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/hoc-vien/portal/lop-hoc - Lớp học của học viên
const getMyLopHoc = async (req, res) => {
  try {
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: req.user.id },
      include: [{
        model: LopHoc, as: "lopHoc",
        include: [
          { model: KhoaHoc, as: "khoaHoc" },
          { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten", "email"] },
          { model: LichHoc, as: "lichHocs" },
          { model: PhongHoc, as: "phongHoc", attributes: ["id", "ma_phong"] },
        ],
      }],
      order: [["ngay_dk", "DESC"]],
    });
    res.json({ success: true, data: dangKys });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/hoc-vien/portal/bai-tap - Bài tập của học viên
const getMyBaiTap = async (req, res) => {
  try {
    const userId = req.user.id;
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: userId, trang_thai: "da_xac_nhan" },
      attributes: ["lop_hoc_id"],
    });
    const lopIds = dangKys.map(dk => dk.lop_hoc_id);
    if (!lopIds.length) return res.json({ success: true, data: [] });

    const baiTaps = await BaiTap.findAll({
      where: { lop_hoc_id: { [Op.in]: lopIds } },
      include: [
        { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
        {
          model: NopBai, as: "nopBais",
          where: { hoc_vien_id: userId },
          required: false,
          include: [{ model: DiemSo, as: "diemSo" }],
        },
      ],
      order: [["han_nop", "ASC"]],
    });

    const result = baiTaps.map(bt => ({
      ...bt.toJSON(),
      da_nop: bt.nopBais?.length > 0,
      nop_bai: bt.nopBais?.[0] || null,
      diem: bt.nopBais?.[0]?.diemSo || null,
    }));

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/lms/hoc-vien/portal/nop-bai - Nộp bài
const nopBai = async (req, res) => {
  try {
    const { bai_tap_id, ghi_chu } = req.body;
    const hoc_vien_id = req.user.id;
    const file_nop = req.file ? req.file.filename : null;

    const bt = await BaiTap.findByPk(bai_tap_id);
    if (!bt) return res.status(404).json({ success: false, message: "Không tìm thấy bài tập" });

    const isLate = bt.han_nop && new Date() > new Date(bt.han_nop);

    const [nb, created] = await NopBai.findOrCreate({
      where: { bai_tap_id, hoc_vien_id },
      defaults: { ghi_chu, file_nop, trang_thai: isLate ? "tre_han" : "da_nop" },
    });
    if (!created) await nb.update({ ghi_chu, ...(file_nop && { file_nop }), trang_thai: isLate ? "tre_han" : "da_nop" });

    res.json({ success: true, data: nb, message: isLate ? "Nộp bài trễ hạn" : "Nộp bài thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/hoc-vien/portal/diem-so - Điểm số của học viên
const getMyDiemSo = async (req, res) => {
  try {
    const userId = req.user.id;
    const diems = await DiemSo.findAll({
      where: { hoc_vien_id: userId },
      include: [
        { model: BaiTap, as: "baiTap",
          include: [{ model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"],
            include: [{ model: KhoaHoc, as: "khoaHoc", attributes: ["ten_khoa"] }] }] },
        { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] },
      ],
      order: [["ngay_cham", "DESC"]],
    });
    res.json({ success: true, data: diems });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/hoc-vien/portal/diem-danh - Lịch sử điểm danh
const getMyDiemDanh = async (req, res) => {
  try {
    const userId = req.user.id;
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: userId },
      include: [
        { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"],
          include: [{ model: KhoaHoc, as: "khoaHoc", attributes: ["ten_khoa"] }] },
        { model: DiemDanh, as: "diemDanhs", order: [["ngay", "DESC"]] },
      ],
    });
    res.json({ success: true, data: dangKys });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/lms/hoc-vien/portal/danh-gia - Đánh giá giảng viên
const hocVienDanhGia = async (req, res) => {
  try {
    const { lop_hoc_id, giao_vien_id, buoi_hoc_ngay, diem_giang_day, diem_thai_do, nhan_xet } = req.body;
    const hoc_vien_id = req.user.id;

    const [dg, created] = await DanhGiaGiaoVien.findOrCreate({
      where: { hoc_vien_id, lop_hoc_id, buoi_hoc_ngay },
      defaults: { giao_vien_id, diem_giang_day, diem_thai_do, nhan_xet },
    });
    if (!created) await dg.update({ diem_giang_day, diem_thai_do, nhan_xet });

    res.json({ success: true, data: dg, message: "Đánh giá thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/lms/hoc-vien/portal/hoc-phi - Học phí của học viên
const getMyHocPhi = async (req, res) => {
  try {
    const hds = await HopDong.findAll({
      where: { hoc_vien_id: req.user.id },
      include: [
        { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
        { model: ThanhToanHocPhi, as: "thanhToans", order: [["created_at", "DESC"]] },
      ],
      order: [["created_at", "DESC"]],
    });
    const result = hds.map(hd => ({
      ...hd.toJSON(),
      con_no: parseFloat(hd.tong_tien) - parseFloat(hd.da_tra),
    }));
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  ...module.exports,
  getHocVienDashboard, getMyLopHoc, getMyBaiTap, nopBai,
  getMyDiemSo, getMyDiemDanh, hocVienDanhGia, getMyHocPhi,
};

// ==================== PHU HUYNH ====================
const { PhuHuynh } = require("../models/LMSModels");

// GET /api/lms/phu-huynh?hoc_vien_id= hoặc ?nguoi_dung_id=
const getPhuHuynh = async (req, res) => {
  try {
    const { hoc_vien_id, nguoi_dung_id } = req.query;
    const where = {};
    if (hoc_vien_id) where.hoc_vien_id = hoc_vien_id;
    if (nguoi_dung_id) where.nguoi_dung_id = nguoi_dung_id;
    const { NguoiDung } = require("../models/UserModels");
    const list = await PhuHuynh.findAll({
      where,
      include: [{ model: NguoiDung, as: "hocVien", attributes: ["id","ho_ten","sdt","email"] }],
      order: [["la_tai_khoan_chinh","DESC"],["id","ASC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/lms/phu-huynh
const createPhuHuynh = async (req, res) => {
  try {
    const { hoc_vien_id, ho_ten, sdt, email, quan_he, la_tai_khoan_chinh, ghi_chu } = req.body;
    if (!ho_ten) return res.status(400).json({ success: false, message: "Thiếu họ tên phụ huynh" });

    // Nếu là tài khoản chính → tạo tài khoản NguoiDung cho phụ huynh
    let nguoi_dung_id = null;
    if (la_tai_khoan_chinh && sdt) {
      const { NguoiDung } = require("../models/UserModels");
      const bcrypt = require("bcryptjs");
      let existing = await NguoiDung.findOne({ where: { sdt } });
      if (!existing) {
        const hash = await bcrypt.hash("123456", 10);
        existing = await NguoiDung.create({
          ho_ten, sdt, email: email || `ph_${sdt}@nta.vn`,
          mat_khau: hash, chuc_vu_id: 7, // role phụ huynh
          trang_thai: "hoat_dong",
        });
      }
      nguoi_dung_id = existing.id;
    }

    const ph = await PhuHuynh.create({ hoc_vien_id, ho_ten, sdt, email, quan_he, la_tai_khoan_chinh: !!la_tai_khoan_chinh, nguoi_dung_id, ghi_chu });
    res.status(201).json({ success: true, data: ph, message: "Thêm phụ huynh thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/lms/phu-huynh/:id
const updatePhuHuynh = async (req, res) => {
  try {
    const ph = await PhuHuynh.findByPk(req.params.id);
    if (!ph) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await ph.update(req.body);
    res.json({ success: true, data: ph });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/lms/phu-huynh/:id
const deletePhuHuynh = async (req, res) => {
  try {
    await PhuHuynh.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  ...module.exports,
  getPhuHuynh, createPhuHuynh, updatePhuHuynh, deletePhuHuynh,
};

// ==================== PHU HUYNH - LICH HOC CON ====================
const getLichHocCon = async (req, res) => {
  try {
    const { hocVienId } = req.params;
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: hocVienId },
      include: [{
        model: LopHoc, as: "lopHoc",
        include: [
          { model: KhoaHoc, as: "khoaHoc", attributes: ["id","ten_khoa"] },
          { model: NguoiDung, as: "giaoVien", attributes: ["id","ho_ten","sdt"] },
          { model: LichHoc, as: "lichHocs" },
          { model: PhongHoc, as: "phongHoc", attributes: ["id","ma_phong"] },
        ],
      }],
    });
    res.json({ success: true, data: dangKys });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getBaiTapCon = async (req, res) => {
  try {
    const { hocVienId } = req.params;
    const dangKys = await DkLopHoc.findAll({
      where: { hoc_vien_id: hocVienId, trang_thai: "da_xac_nhan" },
      attributes: ["lop_hoc_id"],
    });
    const lopIds = dangKys.map(dk => dk.lop_hoc_id);
    if (!lopIds.length) return res.json({ success: true, data: [] });
    const { Op } = require("sequelize");
    const baiTaps = await BaiTap.findAll({
      where: { lop_hoc_id: { [Op.in]: lopIds } },
      include: [
        { model: LopHoc, as: "lopHoc", attributes: ["id","ma_lop"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id","ho_ten"] },
        { model: NopBai, as: "nopBais", where: { hoc_vien_id: hocVienId }, required: false,
          include: [{ model: DiemSo, as: "diemSo" }] },
      ],
      order: [["han_nop","ASC"]],
    });
    res.json({ success: true, data: baiTaps.map(bt => ({
      ...bt.toJSON(), da_nop: bt.nopBais?.length > 0, nop_bai: bt.nopBais?.[0] || null,
      diem: bt.nopBais?.[0]?.diemSo || null,
    })) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  ...module.exports,
  getLichHocCon, getBaiTapCon,
};

// ==================== THONG BAO ====================
const { DataTypes } = require("sequelize");

const ThongBao = sequelize.define("ThongBao", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tieu_de: { type: DataTypes.STRING(255), allowNull: false },
  noi_dung: { type: DataTypes.TEXT },
  loai: { type: DataTypes.STRING(50), field: "loai_tb", defaultValue: "thong_bao" },
  nguoi_gui_id: { type: DataTypes.INTEGER },
  nguoi_nhan_id: { type: DataTypes.INTEGER },
  lop_hoc_id: { type: DataTypes.INTEGER },
  da_doc: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: "thong_bao", timestamps: true, createdAt: "created_at", updatedAt: false });

// GET /api/lms/thong-bao — học viên/giáo viên xem thông báo của mình
const getThongBao = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Op } = require("sequelize");
    const list = await ThongBao.findAll({
      where: {
        [Op.or]: [
          { nguoi_nhan_id: userId },
          { nguoi_nhan_id: null, lop_hoc_id: { [Op.ne]: null } },
        ],
      },
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/lms/thong-bao — giáo viên/admin tạo thông báo
const createThongBao = async (req, res) => {
  try {
    const { tieu_de, noi_dung, loai, nguoi_nhan_id, lop_hoc_id } = req.body;
    const tb = await ThongBao.create({
      tieu_de, noi_dung, loai: loai || "thong_bao",
      nguoi_gui_id: req.user.id,
      nguoi_nhan_id: nguoi_nhan_id || null,
      lop_hoc_id: lop_hoc_id || null,
    });
    res.status(201).json({ success: true, data: tb });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/lms/thong-bao/:id/doc — đánh dấu đã đọc
const danhDauDaDoc = async (req, res) => {
  try {
    await ThongBao.update({ da_doc: true }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  ...module.exports,
  getThongBao, createThongBao, danhDauDaDoc,
};

// ==================== GHI CHU HOC VIEN ====================
const { DataTypes: DT2 } = require("sequelize");
const seq2 = require("../config/db");

const GhiChuHocVien = seq2.define("GhiChuHocVien", {
  id:          { type: DT2.INTEGER, primaryKey: true, autoIncrement: true },
  hoc_vien_id: { type: DT2.INTEGER, allowNull: false },
  noi_dung:    { type: DT2.TEXT, allowNull: false },
  nguoi_tao_id:{ type: DT2.INTEGER },
  ten_nguoi_tao:{ type: DT2.STRING(150) },
}, { tableName: "ghi_chu_hoc_vien", timestamps: true, createdAt: "created_at", updatedAt: false });

// GET /api/lms/hoc-vien/:id/ghi-chu
const getGhiChuHocVien = async (req, res) => {
  try {
    const list = await GhiChuHocVien.findAll({
      where: { hoc_vien_id: req.params.id },
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/lms/hoc-vien/:id/ghi-chu
const createGhiChuHocVien = async (req, res) => {
  try {
    const { noi_dung } = req.body;
    const nguoi_tao = req.user;
    const gc = await GhiChuHocVien.create({
      hoc_vien_id: req.params.id,
      noi_dung,
      nguoi_tao_id: nguoi_tao?.id,
      ten_nguoi_tao: nguoi_tao?.ho_ten || nguoi_tao?.email || "Admin",
    });
    res.status(201).json({ success: true, data: gc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// DELETE /api/lms/hoc-vien/:id/ghi-chu/:gcId
const deleteGhiChuHocVien = async (req, res) => {
  try {
    await GhiChuHocVien.destroy({ where: { id: req.params.gcId, hoc_vien_id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  ...module.exports,
  getGhiChuHocVien, createGhiChuHocVien, deleteGhiChuHocVien,
};
