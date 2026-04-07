const express = require("express");
const router = express.Router();
const lms = require("../controllers/lmsController");
const { auth } = require("../middleware/auth");

// Khoa hoc
router.get("/khoa-hoc", lms.getKhoaHocs);
router.post("/khoa-hoc", auth, lms.createKhoaHoc);
router.put("/khoa-hoc/:id", auth, lms.updateKhoaHoc);
router.delete("/khoa-hoc/:id", auth, lms.deleteKhoaHoc);

// Phong hoc
router.get("/phong-hoc", lms.getPhongHocs);

// Giao vien
router.get("/giao-vien", auth, lms.getGiaoViens);

// Lop hoc
router.get("/lop-hoc", auth, lms.getLopHocs);
router.get("/lop-hoc/:id", auth, lms.getLopHocById);
router.post("/lop-hoc", auth, lms.createLopHoc);
router.put("/lop-hoc/:id", auth, lms.updateLopHoc);

// Dang ky hoc vien vao lop
router.get("/lop-hoc/:lopId/hoc-vien", auth, lms.getDangKyByLop);
router.post("/dang-ky", auth, lms.addHocVienVaoLop);
router.put("/dang-ky/:id", auth, lms.updateDangKy);

// Hoc vien
router.get("/hoc-vien", auth, lms.getHocViens);
router.post("/hoc-vien", auth, lms.createHocVien);
router.put("/hoc-vien/:id", auth, lms.updateHocVien);

// Hop dong & thanh toan
router.get("/hop-dong", auth, lms.getHopDongs);
router.post("/hop-dong", auth, lms.createHopDong);
router.post("/thanh-toan", auth, lms.createThanhToan);

// ==================== MODULE 2: DIEM DANH ====================
router.get("/diem-danh/:lopId", auth, lms.getDiemDanh);
router.get("/diem-danh/:lopId/lich-su", auth, lms.getLichSuDiemDanh);
router.post("/diem-danh/bulk", auth, lms.diemDanhBulk);

// ==================== MODULE 2: BAI TAP ====================
router.get("/bai-tap", auth, lms.getBaiTaps);
router.get("/bai-tap/:id", auth, lms.getBaiTapById);
router.post("/bai-tap", auth, lms.createBaiTap);
router.put("/bai-tap/:id", auth, lms.updateBaiTap);

// ==================== MODULE 2: CHAM DIEM ====================
router.post("/cham-diem", auth, lms.chamDiem);
router.get("/diem-so/:lopId", auth, lms.getDiemSoLop);

// ==================== MODULE 2: DANH GIA GIAO VIEN ====================
router.post("/danh-gia-gv", lms.createDanhGia);
router.get("/danh-gia-gv/:giaoVienId", auth, lms.getDanhGiaGiaoVien);

// ==================== MODULE 3: KE TOAN ====================
router.get("/ke-toan/tong-quan", auth, lms.getKeToanTongQuan);
router.get("/ke-toan/cong-no", auth, lms.getCongNo);
router.get("/ke-toan/phieu-thu", auth, lms.getPhieuThus);
router.post("/ke-toan/phieu-thu", auth, lms.createPhieuThu);
router.get("/ke-toan/phieu-chi", auth, lms.getPhieuChis);
router.post("/ke-toan/phieu-chi", auth, lms.createPhieuChi);
router.get("/ke-toan/bao-cao", auth, lms.getBaoCaoDoanhThu);

// ==================== MODULE 4: PORTAL HOC VIEN ====================
router.get("/hoc-vien/portal/dashboard", auth, lms.getHocVienDashboard);
router.get("/hoc-vien/portal/lop-hoc", auth, lms.getMyLopHoc);
router.get("/hoc-vien/portal/bai-tap", auth, lms.getMyBaiTap);
router.post("/hoc-vien/portal/nop-bai", auth, lms.nopBai);
router.get("/hoc-vien/portal/diem-so", auth, lms.getMyDiemSo);
router.get("/hoc-vien/portal/diem-danh", auth, lms.getMyDiemDanh);
router.post("/hoc-vien/portal/danh-gia", auth, lms.hocVienDanhGia);
router.get("/hoc-vien/portal/hoc-phi", auth, lms.getMyHocPhi);

module.exports = router;
