const db = require("../config/db");
const { QueryTypes } = require("sequelize");

// ==================== NHÀ CUNG CẤP ====================

const getNhaCungCaps = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT n.*, COUNT(s.id) as so_san_pham 
               FROM nha_cung_cap n 
               LEFT JOIN sach s ON s.nha_cung_cap_id = n.id
               WHERE 1=1`;
    const params = [];
    if (search) { sql += " AND (n.ten_ncc LIKE ? OR n.ma_ncc LIKE ? OR n.sdt LIKE ?)"; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
    sql += " GROUP BY n.id ORDER BY n.created_at DESC";
    const rows = await db.query(sql, { replacements: params, type: QueryTypes.SELECT });
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createNhaCungCap = async (req, res) => {
  try {
    const { ten_ncc, nguoi_lien_he, sdt, email, dia_chi, ghi_chu } = req.body;
    if (!ten_ncc) return res.status(400).json({ success: false, message: "Tên nhà cung cấp là bắt buộc" });
    const ma_ncc = "NCC" + Date.now().toString().slice(-6);
    await db.query(
      "INSERT INTO nha_cung_cap (ma_ncc, ten_ncc, nguoi_lien_he, sdt, email, dia_chi, ghi_chu) VALUES (?,?,?,?,?,?,?)",
      { replacements: [ma_ncc, ten_ncc, nguoi_lien_he, sdt, email, dia_chi, ghi_chu], type: QueryTypes.INSERT }
    );
    res.status(201).json({ success: true, message: "Thêm nhà cung cấp thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const updateNhaCungCap = async (req, res) => {
  try {
    const { ten_ncc, nguoi_lien_he, sdt, email, dia_chi, ghi_chu, trang_thai } = req.body;
    await db.query(
      "UPDATE nha_cung_cap SET ten_ncc=?, nguoi_lien_he=?, sdt=?, email=?, dia_chi=?, ghi_chu=?, trang_thai=? WHERE id=?",
      { replacements: [ten_ncc, nguoi_lien_he, sdt, email, dia_chi, ghi_chu, trang_thai, req.params.id], type: QueryTypes.UPDATE }
    );
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteNhaCungCap = async (req, res) => {
  try {
    const [hdns] = await db.query("SELECT COUNT(*) as n FROM hoa_don_nhap WHERE nha_cung_cap_id = ?",
      { replacements: [req.params.id], type: QueryTypes.SELECT });
    if (hdns.n > 0) return res.status(400).json({ success: false, message: "Không thể xóa vì đã có hoá đơn nhập" });
    await db.query("DELETE FROM nha_cung_cap WHERE id = ?", { replacements: [req.params.id], type: QueryTypes.DELETE });
    res.json({ success: true, message: "Đã xóa" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ==================== HOÁ ĐƠN NHẬP ====================

const getHoaDonNhaps = async (req, res) => {
  try {
    const { nha_cung_cap_id, tu_ngay, den_ngay } = req.query;
    let sql = `SELECT h.*, n.ten_ncc, n.ma_ncc FROM hoa_don_nhap h
               LEFT JOIN nha_cung_cap n ON n.id = h.nha_cung_cap_id WHERE 1=1`;
    const params = [];
    if (nha_cung_cap_id) { sql += " AND h.nha_cung_cap_id = ?"; params.push(nha_cung_cap_id); }
    if (tu_ngay && den_ngay) { sql += " AND h.ngay_nhap BETWEEN ? AND ?"; params.push(tu_ngay, den_ngay); }
    sql += " ORDER BY h.created_at DESC";
    const rows = await db.query(sql, { replacements: params, type: QueryTypes.SELECT });
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const getHoaDonNhapById = async (req, res) => {
  try {
    const [hdn] = await db.query(
      `SELECT h.*, n.ten_ncc, n.ma_ncc, n.sdt, n.email FROM hoa_don_nhap h
       LEFT JOIN nha_cung_cap n ON n.id = h.nha_cung_cap_id WHERE h.id = ?`,
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    );
    if (!hdn) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    const chiTiets = await db.query(
      `SELECT ct.*, s.ten_sach, s.ma_sach, s.hinh_anh FROM chi_tiet_hoa_don_nhap ct
       LEFT JOIN sach s ON s.id = ct.sach_id WHERE ct.hoa_don_nhap_id = ?`,
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: { ...hdn, chi_tiets: chiTiets } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createHoaDonNhap = async (req, res) => {
  const t = await db.transaction();
  try {
    const { nha_cung_cap_id, ngay_nhap, ghi_chu, chi_tiets } = req.body;
    if (!nha_cung_cap_id || !ngay_nhap || !chi_tiets?.length)
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });

    // Tính tổng tiền
    const tongTien = chi_tiets.reduce((s, item) => s + Number(item.so_luong) * Number(item.don_gia), 0);
    const ma_hdn = "HDN" + Date.now();

    const [result] = await db.query(
      "INSERT INTO hoa_don_nhap (ma_hdn, nha_cung_cap_id, ngay_nhap, tong_tien, ghi_chu, trang_thai) VALUES (?,?,?,?,?,'da_nhap')",
      { replacements: [ma_hdn, nha_cung_cap_id, ngay_nhap, tongTien, ghi_chu || ""], transaction: t, type: QueryTypes.INSERT }
    );
    const hdnId = result;

    // Thêm chi tiết + cập nhật tồn kho, giá nhập, và nha_cung_cap_id
    for (const item of chi_tiets) {
      await db.query(
        "INSERT INTO chi_tiet_hoa_don_nhap (hoa_don_nhap_id, sach_id, so_luong, don_gia) VALUES (?,?,?,?)",
        { replacements: [hdnId, item.sach_id, item.so_luong, item.don_gia], transaction: t, type: QueryTypes.INSERT }
      );
      // Cộng tồn kho, cập nhật giá nhập mới nhất, và gắn nhà cung cấp nếu chưa có
      await db.query(
        `UPDATE sach 
         SET so_luong_ton = so_luong_ton + ?,
             gia_nhap = ?,
             nha_cung_cap_id = ?
         WHERE id = ?`,
        { replacements: [item.so_luong, item.don_gia, nha_cung_cap_id, item.sach_id], transaction: t, type: QueryTypes.UPDATE }
      );
    }

    await t.commit();
    res.status(201).json({ success: true, message: `Tạo hoá đơn nhập thành công. Tổng: ${tongTien.toLocaleString()}đ`, data: { id: hdnId, ma_hdn } });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteHoaDonNhap = async (req, res) => {
  const t = await db.transaction();
  try {
    // Hoàn lại tồn kho
    const chiTiets = await db.query(
      "SELECT sach_id, so_luong FROM chi_tiet_hoa_don_nhap WHERE hoa_don_nhap_id = ?",
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    );
    for (const ct of chiTiets) {
      await db.query("UPDATE sach SET so_luong_ton = so_luong_ton - ? WHERE id = ?",
        { replacements: [ct.so_luong, ct.sach_id], transaction: t, type: QueryTypes.UPDATE });
    }
    await db.query("DELETE FROM chi_tiet_hoa_don_nhap WHERE hoa_don_nhap_id = ?",
      { replacements: [req.params.id], transaction: t, type: QueryTypes.DELETE });
    await db.query("DELETE FROM hoa_don_nhap WHERE id = ?",
      { replacements: [req.params.id], transaction: t, type: QueryTypes.DELETE });
    await t.commit();
    res.json({ success: true, message: "Đã xóa hoá đơn và hoàn lại tồn kho" });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
};

const getSachByNcc = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT s.id, s.ma_sach, s.ten_sach, s.gia_nhap, s.gia_ban, s.so_luong_ton, s.trang_thai, s.hinh_anh,
              l.ten_loai
       FROM sach s
       LEFT JOIN loai_sach l ON l.id = s.loai_sach_id
       WHERE s.nha_cung_cap_id = ?
       ORDER BY s.ten_sach`,
      { replacements: [req.params.nccId], type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  getNhaCungCaps, createNhaCungCap, updateNhaCungCap, deleteNhaCungCap,
  getHoaDonNhaps, getHoaDonNhapById, createHoaDonNhap, deleteHoaDonNhap,
  getSachByNcc,
};
