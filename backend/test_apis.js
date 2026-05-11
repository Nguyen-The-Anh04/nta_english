require("dotenv").config();
const models = require("./src/models");
const { Op } = require("sequelize");

async function testAPIs() {
  const results = [];
  const test = async (name, fn) => {
    try {
      const r = await fn();
      const count = Array.isArray(r) ? r.length : (typeof r === "number" ? r : "?");
      results.push({ name, status: "OK", count });
    } catch (e) {
      results.push({ name, status: "ERROR", msg: e.message.slice(0, 80) });
    }
  };

  const {
    LopHoc, KhoaHoc, DkLopHoc, HopDong, PhieuThu, PhieuChi,
    DiemDanh, BaiTap, NguoiDung, LichHoc, ThanhToanHocPhi,
    DiemDanh: DD, BaiTap: BT
  } = models;

  // LMS core
  await test("lop_hoc findAll+include", () => LopHoc.findAll({
    include: [
      { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
      { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
      { model: LichHoc, as: "lichHocs" },
    ], limit: 3
  }));

  await test("khoa_hoc findAll", () => KhoaHoc.findAll());

  await test("dk_lop_hoc findAll+include", () => DkLopHoc.findAll({
    include: [{ model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] }],
    limit: 3
  }));

  await test("hop_dong findAll+include", () => HopDong.findAll({
    include: [
      { model: NguoiDung, as: "hocVien", attributes: ["id", "ho_ten"] },
      { model: KhoaHoc, as: "khoaHoc", attributes: ["id", "ten_khoa"] },
    ], limit: 3
  }));

  await test("phieu_thu findAll+include", () => PhieuThu.findAll({
    include: [{ model: NguoiDung, as: "nguoiNop", attributes: ["id", "ho_ten"] }],
    limit: 3
  }));

  await test("phieu_chi findAll+include", () => PhieuChi.findAll({
    include: [{ model: NguoiDung, as: "nguoiNhan", attributes: ["id", "ho_ten"] }],
    limit: 3
  }));

  await test("diem_danh findAll", () => DiemDanh.findAll({ limit: 3 }));

  await test("bai_tap findAll+include", () => BaiTap.findAll({
    include: [
      { model: LopHoc, as: "lopHoc", attributes: ["id", "ma_lop"] },
      { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
    ], limit: 3
  }));

  await test("lich_hoc findAll", () => LichHoc.findAll({ limit: 3 }));

  await test("thanh_toan_hoc_phi findAll", () => ThanhToanHocPhi.findAll({ limit: 3 }));

  // Ke toan aggregates
  await test("phieu_thu SUM tong_tien", async () => {
    const r = await PhieuThu.sum("tong_tien", {
      where: { ngay_thu: { [Op.between]: ["2026-01-01", "2026-12-31"] } }
    });
    return [r]; // wrap to get count=1
  });

  await test("phieu_chi SUM tong_tien", async () => {
    const r = await PhieuChi.sum("tong_tien", {
      where: { ngay_chi: { [Op.between]: ["2026-01-01", "2026-12-31"] } }
    });
    return [r];
  });

  await test("hop_dong cong_no (hoat_dong)", () => HopDong.findAll({
    where: { trang_thai: "hoat_dong" }, limit: 3
  }));

  // HV portal
  await test("hoc_vien findAll (chuc_vu=5)", () => NguoiDung.findAll({
    where: { chuc_vu_id: 5 }, limit: 5
  }));

  await test("giao_vien findAll (chuc_vu=3)", () => NguoiDung.findAll({
    where: { chuc_vu_id: 3 }, limit: 5
  }));

  // Print results
  console.log("\n=== KET QUA TEST API ===\n");
  let ok = 0, err = 0;
  results.forEach(r => {
    if (r.status === "OK") {
      console.log("  OK  " + r.name + " (" + r.count + ")");
      ok++;
    } else {
      console.log("  ERR " + r.name + " -> " + r.msg);
      err++;
    }
  });
  console.log("\nTong: " + ok + " OK, " + err + " ERROR");
  process.exit(0);
}

testAPIs().catch(e => { console.error(e.message); process.exit(1); });
