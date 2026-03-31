const { KhuyenMai } = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách khuyến mại
const getKhuyenMai = async (req, res) => {
  try {
    const { trang_thai, loai_khoa } = req.query;
    const where = {};

    if (trang_thai) {
      where.trang_thai = trang_thai;
    }

    if (loai_khoa) {
      where.loai_khoa = loai_khoa;
    }

    const khuyenMais = await KhuyenMai.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: khuyenMais,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khuyến mại",
    });
  }
};

// Lấy chi tiết khuyến mại
const getKhuyenMaiById = async (req, res) => {
  try {
    const { id } = req.params;
    const khuyenMai = await KhuyenMai.findByPk(id);

    if (!khuyenMai) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mại",
      });
    }

    res.json({
      success: true,
      data: khuyenMai,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết khuyến mại",
    });
  }
};

// Tạo khuyến mại mới
const createKhuyenMai = async (req, res) => {
  try {
    const {
      ten_khoa,
      mo_ta,
      loai_khoa,
      gia_tri,
      dieu_kien,
      loai_dieu_kien,
      ma_khoa,
      ngay_bat_dau,
      ngay_ket_thuc,
      trang_thai,
      ap_dung_cho,
      danh_muc_id,
      san_pham_id,
    } = req.body;

    // Kiểm tra mã khuyến mại trùng lặp
    if (ma_khoa) {
      const existing = await KhuyenMai.findOne({ where: { ma_khoa } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Mã khuyến mại đã tồn tại",
        });
      }
    }

    const khuyenMai = await KhuyenMai.create({
      ten_khoa,
      mo_ta,
      loai_khoa,
      gia_tri,
      dieu_kien,
      loai_dieu_kien,
      ma_khoa,
      ngay_bat_dau,
      ngay_ket_thuc,
      trang_thai: trang_thai || "hoat_dong",
      ap_dung_cho: ap_dung_cho || "tat_ca",
      danh_muc_id,
      san_pham_id,
    });

    res.status(201).json({
      success: true,
      message: "Tạo khuyến mại thành công",
      data: khuyenMai,
    });
  } catch (error) {
    console.error("Lỗi tạo khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo khuyến mại",
    });
  }
};

// Cập nhật khuyến mại
const updateKhuyenMai = async (req, res) => {
  try {
    const { id } = req.params;
    const khuyenMai = await KhuyenMai.findByPk(id);

    if (!khuyenMai) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mại",
      });
    }

    // Kiểm tra mã khuyến mại trùng lặp (nếu có thay đổi)
    if (req.body.ma_khoa && req.body.ma_khoa !== khuyenMai.ma_khoa) {
      const existing = await KhuyenMai.findOne({
        where: { ma_khoa: req.body.ma_khoa },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Mã khuyến mại đã tồn tại",
        });
      }
    }

    await khuyenMai.update(req.body);

    res.json({
      success: true,
      message: "Cập nhật khuyến mại thành công",
      data: khuyenMai,
    });
  } catch (error) {
    console.error("Lỗi cập nhật khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật khuyến mại",
    });
  }
};

// Xóa khuyến mại
const deleteKhuyenMai = async (req, res) => {
  try {
    const { id } = req.params;
    const khuyenMai = await KhuyenMai.findByPk(id);

    if (!khuyenMai) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mại",
      });
    }

    await khuyenMai.destroy();

    res.json({
      success: true,
      message: "Xóa khuyến mại thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa khuyến mại",
    });
  }
};

// Áp dụng khuyến mại cho đơn hàng
const apDungKhuyenMai = async (req, res) => {
  try {
    const { ma_khoa, tong_tien, so_luong, danh_muc_id, san_pham_id } = req.body;

    // Tìm khuyến mại theo mã
    const khuyenMai = await KhuyenMai.findOne({
      where: {
        ma_khoa,
        trang_thai: "hoat_dong",
        ngay_bat_dau: { [Op.lte]: new Date() },
        ngay_ket_thuc: { [Op.gte]: new Date() },
      },
    });

    if (!khuyenMai) {
      return res.status(404).json({
        success: false,
        message: "Mã khuyến mại không hợp lệ hoặc đã hết hạn",
      });
    }

    // Kiểm tra điều kiện áp dụng
    let apDung = false;
    let giamGia = 0;

    if (khuyenMai.loai_dieu_kien === "so_luong") {
      apDung = so_luong >= khuyenMai.dieu_kien;
    } else if (khuyenMai.loai_dieu_kien === "tong_tien") {
      apDung = tong_tien >= khuyenMai.dieu_kien;
    } else {
      apDung = true; // Không có điều kiện
    }

    if (!apDung) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng không đủ điều kiện áp dụng khuyến mại`,
      });
    }

    // Kiểm tra phạm vi áp dụng
    if (khuyenMai.ap_dung_cho === "danh_muc" && khuyenMai.danh_muc_id !== danh_muc_id) {
      return res.status(400).json({
        success: false,
        message: "Khuyến mại không áp dụng cho danh mục này",
      });
    }

    if (khuyenMai.ap_dung_cho === "san_pham" && khuyenMai.san_pham_id !== san_pham_id) {
      return res.status(400).json({
        success: false,
        message: "Khuyến mại không áp dụng cho sản phẩm này",
      });
    }

    // Tính toán giảm giá
    if (khuyenMai.loai_khoa === "giam_phan_tram") {
      giamGia = (tong_tien * khuyenMai.gia_tri) / 100;
    } else if (khuyenMai.loai_khoa === "giam_tien") {
      giamGia = khuyenMai.gia_tri;
    } else if (khuyenMai.loai_khoa === "mien_phi_van_chuyen") {
      giamGia = khuyenMai.gia_tri; // Phí vận chuyển
    }

    res.json({
      success: true,
      message: "Áp dụng khuyến mại thành công",
      data: {
        khuyen_mai: khuyenMai,
        giam_gia: giamGia,
        tong_tien_sau_giam: tong_tien - giamGia,
      },
    });
  } catch (error) {
    console.error("Lỗi áp dụng khuyến mại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi áp dụng khuyến mại",
    });
  }
};

module.exports = {
  getKhuyenMai,
  getKhuyenMaiById,
  createKhuyenMai,
  updateKhuyenMai,
  deleteKhuyenMai,
  apDungKhuyenMai,
};
