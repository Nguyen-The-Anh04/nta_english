const { LoaiSach, Sach, DonHang, ChiTietDonHang, CTV, HoaHong, RutTienCTV, NguoiDung, CommissionProducts } = require("../models");
const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/db");

// ==================== BOOKS ====================

// GET /api/books/categories - Get all book categories
const getCategories = async (req, res) => {
  try {
    const categories = await LoaiSach.findAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/books - Get all books
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 100, loai_sach_id, search, trang_thai } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (loai_sach_id) where.loai_sach_id = loai_sach_id;
    if (search) {
      where[Op.or] = [
        { ten_sach: { [Op.like]: `%${search}%` } },
        { ma_sach: { [Op.like]: `%${search}%` } },
        { tac_gia: { [Op.like]: `%${search}%` } },
      ];
    }
    if (trang_thai) where.trang_thai = trang_thai;

    const { count, rows: books } = await Sach.findAndCountAll({
      where,
      include: [{ model: LoaiSach, as: "loaiSach", attributes: ["ten_loai"] }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/books/top-products - Get sales data per product
const getTopProducts = async (req, res) => {
  try {
    // Lấy số lượng đã bán theo từng sách (từ đơn hàng đã thanh toán hoặc đã giao)
    const salesData = await ChiTietDonHang.findAll({
      attributes: [
        "sach_id",
        [sequelize.fn("SUM", sequelize.col("so_luong")), "da_ban"],
        [sequelize.fn("SUM", sequelize.col("thanh_tien")), "doanh_thu"],
      ],
      include: [
        { 
          model: DonHang, 
          as: "donHang", 
          attributes: [],
          where: { trang_thai: { [Op.in]: ["da_tt", "dang_giao", "da_giao"] } }
        }
      ],
      group: ["sach_id"],
      raw: true,
    });

    const result = {};
    salesData.forEach(item => {
      if (item.sach_id) {
        result[item.sach_id] = {
          da_ban: parseInt(item.da_ban) || 0,
          doanh_thu: parseFloat(item.doanh_thu) || 0,
        };
      }
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get top products error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/books/:id - Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Sach.findByPk(req.params.id, {
      include: [{ model: LoaiSach, as: "loaiSach" }],
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Sách không tồn tại" });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    console.error("Get book by ID error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/books - Create book (Admin)
const createBook = async (req, res) => {
  try {
    const { loai_sach_id, nha_cung_cap_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai } = req.body;

    const book = await Sach.create({
      loai_sach_id,
      nha_cung_cap_id,
      ma_sach,
      ten_sach,
      tac_gia,
      nha_xuat_ban,
      gia_nhap,
      gia_ban,
      so_luong_ton: so_luong_ton || 0,
      hinh_anh,
      mo_ta,
      trang_thai: trang_thai || "co_san",
    });

    res.status(201).json({
      success: true,
      message: "Tạo sách thành công",
      data: book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Handle unique constraint error (ma_sach already exists)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: "Mã sách đã tồn tại! Vui lòng dùng mã khác." });
    }
    
    // Handle validation error
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: "Lỗi validation: " + error.message });
    }
    
    // Handle required fields validation
    if (!ten_sach || !ma_sach || !gia_ban) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc (tên sách, mã sách, giá bán)" });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/books/:id - Update book
const updateBook = async (req, res) => {
  try {
    const book = await Sach.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Sách không tồn tại" });
    }

    const { ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai, nha_cung_cap_id } = req.body;

    await book.update({
      ten_sach: ten_sach || book.ten_sach,
      tac_gia: tac_gia || book.tac_gia,
      nha_xuat_ban: nha_xuat_ban || book.nha_xuat_ban,
      gia_nhap: gia_nhap || book.gia_nhap,
      gia_ban: gia_ban || book.gia_ban,
      so_luong_ton: so_luong_ton || book.so_luong_ton,
      hinh_anh: hinh_anh || book.hinh_anh,
      mo_ta: mo_ta || book.mo_ta,
      trang_thai: trang_thai || book.trang_thai,
      nha_cung_cap_id: nha_cung_cap_id !== undefined ? nha_cung_cap_id : book.nha_cung_cap_id,
    });

    res.json({ success: true, message: "Cập nhật sách thành công" });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/books/:id - Delete book (Admin)
const deleteBook = async (req, res) => {
  try {
    const book = await Sach.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Sách không tồn tại" });
    }

    // Check if book has any orders
    const orderItems = await ChiTietDonHang.findAll({ where: { sach_id: book.id } });
    if (orderItems.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể xóa sách này vì đã có đơn hàng" 
      });
    }

    await book.destroy();
    res.json({ success: true, message: "Xóa sách thành công" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ==================== ORDERS ====================

// GET /api/orders/stats - Get order statistics by status
const getOrderStats = async (req, res) => {
  try {
    const stats = await DonHang.findAll({
      attributes: [
        'trang_thai',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['trang_thai']
    });

    const statsMap = {
      all: 0,
      cho_tt: 0,
      da_tt: 0,
      dang_giao: 0,
      da_giao: 0,
      da_huy: 0
    };

    stats.forEach(stat => {
      statsMap[stat.trang_thai] = parseInt(stat.dataValues.count);
      statsMap.all += parseInt(stat.dataValues.count);
    });

    res.json({
      success: true,
      data: statsMap
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/orders - Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, trang_thai, ctv_id, nguoi_dung_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (trang_thai) where.trang_thai = trang_thai;
    if (ctv_id) where.ctv_id = ctv_id;
    if (nguoi_dung_id) where.nguoi_dung_id = nguoi_dung_id;

    const { count, rows: orders } = await DonHang.findAndCountAll({
      where,
      include: [
        { model: NguoiDung, as: "nguoiMua", attributes: ["id", "ho_ten", "email", "sdt"] },
        { 
          model: ChiTietDonHang, 
          as: "chiTiets", 
          include: [{ model: Sach, as: "sach", attributes: ["id", "ten_sach", "gia_ban", "hinh_anh"] }] 
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/orders/:id - Get order details
const getOrderById = async (req, res) => {
  try {
    const order = await DonHang.findByPk(req.params.id, {
      include: [
        { model: NguoiDung, as: "nguoiMua", attributes: ["id", "ho_ten", "email", "sdt"] },
        { 
          model: ChiTietDonHang, 
          as: "chiTiets", 
          include: [{ model: Sach, as: "sach", attributes: ["id", "ten_sach", "gia_ban", "hinh_anh", "tac_gia"] }] 
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // Lấy thông tin CTV từ bảng ctv (ctv_id trên đơn hàng là ctv.id)
    let ctvInfo = null;
    if (order.ctv_id) {
      ctvInfo = await CTV.findByPk(order.ctv_id, {
        include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["id", "ho_ten", "email", "sdt"] }],
      });
    }

    const result = order.toJSON();
    result.ctvGioiThieu = ctvInfo ? {
      id: ctvInfo.id,
      ho_ten: ctvInfo.nguoiDung?.ho_ten,
      email: ctvInfo.nguoiDung?.email,
      ma_gioi_thieu: ctvInfo.ma_gioi_thieu,
    } : null;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
  }
};

// POST /api/orders - Create order (hỗ trợ khách vãng lai, tự tạo tài khoản)
const createOrder = async (req, res) => {
  try {
    const { sach_ids, ctv_id, phuong_thuc_tt = "cod", dia_chi_giao, ghi_chu, tong_tien: tong_tien_from_frontend, khuyen_mai_id, ma_khoa, giam_gia,
      ho_ten_khach, sdt_khach, email_khach } = req.body;
    let nguoi_dung_id = req.user ? req.user.id : null;
    let account_created = false;
    let new_account = null;

    // Nếu chưa đăng nhập nhưng có SĐT → tự tạo tài khoản
    if (!nguoi_dung_id && sdt_khach) {
      let existing = await NguoiDung.findOne({ where: { sdt: sdt_khach } });
      if (!existing) {
        const bcrypt = require("bcryptjs");
        const hash = await bcrypt.hash("123456", 10);
        existing = await NguoiDung.create({
          ho_ten: ho_ten_khach || sdt_khach,
          sdt: sdt_khach,
          email: email_khach || `${sdt_khach}@nta.vn`,
          mat_khau: hash,
          chuc_vu_id: 6, // khách hàng
        });
        account_created = true;
        new_account = { username: sdt_khach, password: "123456" };
      }
      nguoi_dung_id = existing.id;
    }

    // Validate books
    const books = await Sach.findAll({ where: { id: { [Op.in]: sach_ids.map(b => b.sach_id) } } });
    if (books.length !== sach_ids.length) {
      return res.status(400).json({ success: false, message: "Một số sách không tồn tại" });
    }

    // Check stock
    for (let book of books) {
      const orderItem = sach_ids.find(b => b.sach_id === book.id);
      if (book.so_luong_ton < orderItem.so_luong) {
        return res.status(400).json({ success: false, message: `Sách "${book.ten_sach}" không đủ số lượng` });
      }
    }

    // Generate order code
    const ma_don_hang = "DH" + Date.now();

    // Calculate total from books (original price)
    let tong_tien_goc = 0;
    const chi_tiet = sach_ids.map(item => {
      const book = books.find(b => b.id === item.sach_id);
      const thanh_tien = book.gia_ban * item.so_luong;
      tong_tien_goc += thanh_tien;
      return {
        sach_id: item.sach_id,
        so_luong: item.so_luong,
        gia_sp: book.gia_ban,
        thanh_tien,
      };
    });
    
    // Use discounted price from frontend if provided, otherwise use calculated price
    const tong_tien = tong_tien_from_frontend || tong_tien_goc;

    // Create order
    const order = await DonHang.create({
      ma_don_hang,
      nguoi_dung_id,
      ctv_id,
      tong_tien,
      tong_tien_goc: tong_tien_goc,
      giam_gia: giam_gia || 0,
      khuyen_mai_id: khuyen_mai_id || null,
      trang_thai: "cho_tt",
      phuong_thuc_tt,
      dia_chi_giao,
      ghi_chu,
    });

    // Create order items
    await ChiTietDonHang.bulkCreate(
      chi_tiet.map(item => ({ ...item, don_hang_id: order.id }))
    );

    // Update stock
    for (let book of books) {
      const orderItem = sach_ids.find(b => b.sach_id === book.id);
      await book.update({ so_luong_ton: book.so_luong_ton - orderItem.so_luong });
    }

    // Create commission for CTV (based on discounted price)
    if (ctv_id) {
      const ctv = await CTV.findByPk(ctv_id);
      if (ctv) {
        // Get commission rates from CommissionProducts
        const commissionProduct = await CommissionProducts.findOne({
          where: { san_pham_id: sach_ids[0]?.sach_id, trang_thai: "hoat_dong" },
        });

        // Default commission rates
        let f1_percent = 10;
        let f2_percent = 5;
        let f3_percent = 2;

        // Use custom rates if available
        if (commissionProduct) {
          f1_percent = commissionProduct.f1_percent;
          f2_percent = commissionProduct.f2_percent;
          f3_percent = commissionProduct.f3_percent;
        }

        // Create commission for F1 (direct CTV)
        await HoaHong.create({
          ctv_id: ctv.id,
          don_hang_id: order.id,
          ty_le_pham_ram: f1_percent,
          tien_hoa_hong: (tong_tien * f1_percent) / 100,
          cap_do: 1,
          trang_thai: "cho_xac_nhan",
        });

        // Update F1 total commission
        await ctv.update({ tong_hoa_hong: parseFloat(ctv.tong_hoa_hong || 0) + parseFloat((tong_tien * f1_percent) / 100) });

        // Create commission for F2 (parent of F1)
        if (ctv.ctv_cha_id) {
          const f2 = await CTV.findByPk(ctv.ctv_cha_id);
          if (f2) {
            await HoaHong.create({
              ctv_id: f2.id,
              don_hang_id: order.id,
              ty_le_pham_ram: f2_percent,
              tien_hoa_hong: (tong_tien * f2_percent) / 100,
              cap_do: 2,
              trang_thai: "cho_xac_nhan",
            });

            // Update F2 total commission
            await f2.update({ tong_hoa_hong: parseFloat(f2.tong_hoa_hong || 0) + parseFloat((tong_tien * f2_percent) / 100) });

            // Create commission for F3 (parent of F2)
            if (f2.ctv_cha_id) {
              const f3 = await CTV.findByPk(f2.ctv_cha_id);
              if (f3) {
                await HoaHong.create({
                  ctv_id: f3.id,
                  don_hang_id: order.id,
                  ty_le_pham_ram: f3_percent,
                  tien_hoa_hong: (tong_tien * f3_percent) / 100,
                  cap_do: 3,
                  trang_thai: "cho_xac_nhan",
                });

                // Update F3 total commission
                await f3.update({ tong_hoa_hong: parseFloat(f3.tong_hoa_hong || 0) + parseFloat((tong_tien * f3_percent) / 100) });
              }
            }
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: { 
        order_id: order.id, 
        ma_don_hang: order.ma_don_hang, 
        tong_tien: order.tong_tien,
        tong_tien_goc: tong_tien_goc,
        giam_gia: giam_gia || 0,
        khuyen_mai_id: khuyen_mai_id || null,
        account_created,
        new_account,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/orders/:id/status - Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { trang_thai } = req.body;
    const validStatuses = ["cho_tt", "da_tt", "dang_giao", "da_giao", "da_huy"];

    if (!validStatuses.includes(trang_thai)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const order = await DonHang.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // Validate chuyển trạng thái theo nghiệp vụ
    const ALLOWED_TRANSITIONS = {
      cho_tt:    ['dang_giao', 'da_huy'],
      dang_giao: ['da_giao', 'da_huy'],
      da_giao:   ['da_tt'],
      da_tt:     [],
      da_huy:    [],
    };
    const current = order.trang_thai;
    if (current === trang_thai) {
      return res.json({ success: true, message: "Không có thay đổi" });
    }
    const STATUS_TEXT = { cho_tt:'Chờ xác nhận', da_tt:'Đã thanh toán', dang_giao:'Đang giao', da_giao:'Đã giao', da_huy:'Đã hủy' };
    if (!ALLOWED_TRANSITIONS[current]?.includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển từ "${STATUS_TEXT[current]}" sang "${STATUS_TEXT[trang_thai]}"`,
      });
    }

    // Map trang_thai → 3 cột status riêng biệt
    const STATUS_MAP = {
      cho_tt:    { order_status: 'pending',   payment_status: 'unpaid',   shipping_status: 'not_shipped' },
      dang_giao: { order_status: 'confirmed', payment_status: 'unpaid',   shipping_status: 'shipping'    },
      da_giao:   { order_status: 'confirmed', payment_status: 'unpaid',   shipping_status: 'delivered'   },
      da_tt:     { order_status: 'completed', payment_status: 'paid',     shipping_status: 'delivered'   },
      da_huy:    { order_status: 'cancelled', payment_status: order.payment_status === 'paid' ? 'refunded' : 'unpaid', shipping_status: 'not_shipped' },
    };
    const newStatuses = STATUS_MAP[trang_thai];

    // If cancelling, restore stock AND hủy hoa hồng pending
    if (trang_thai === "da_huy" && order.trang_thai !== "da_huy") {
      const items = await ChiTietDonHang.findAll({ where: { don_hang_id: order.id } });
      for (let item of items) {
        const book = await Sach.findByPk(item.sach_id);
        await book.update({ so_luong_ton: book.so_luong_ton + item.so_luong });
      }
      // Hủy hoa hồng pending của đơn này
      await HoaHong.update(
        { trang_thai: "da_huy" },
        { where: { don_hang_id: order.id, trang_thai: "cho_xac_nhan" } }
      );
    }

    // Khi đơn hoàn tất (da_giao) → chuyển hoa hồng từ cho_xac_nhan → da_tra
    if (trang_thai === "da_giao" && order.trang_thai !== "da_giao") {
      await HoaHong.update(
        { trang_thai: "da_tra" },
        { where: { don_hang_id: order.id, trang_thai: "cho_xac_nhan" } }
      );
    }

    await order.update({ trang_thai, ...newStatuses });

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/books/orders/:id - Delete order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await DonHang.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }
    // Restore stock
    const items = await ChiTietDonHang.findAll({ where: { don_hang_id: order.id } });
    for (let item of items) {
      const book = await Sach.findByPk(item.sach_id);
      if (book) await book.update({ so_luong_ton: book.so_luong_ton + item.so_luong });
    }
    // Delete related records first (foreign key constraints)
    await ChiTietDonHang.destroy({ where: { don_hang_id: order.id } });
    await HoaHong.destroy({ where: { don_hang_id: order.id } });
    // Delete order
    await order.destroy();
    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ==================== AFFILIATE ====================

// GET /api/affiliate/profile - Get CTV profile
const getCTVProfile = async (req, res) => {
  try {
    const ctv = await CTV.findOne({
      where: { nguoi_dung_id: req.user.id },
      include: [
        { model: NguoiDung, as: "nguoiDung", attributes: ["id", "email", "ho_ten", "sdt"] },
        { model: CTV, as: "cha", attributes: ["id", "ma_gioi_thieu", "nguoi_dung_id"] },
      ],
    });

    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    res.json({ success: true, data: ctv });
  } catch (error) {
    console.error("Get CTV profile error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/stats - Dashboard stats
const getAffiliateStats = async (req, res) => {
  try {
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });

    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    const cho_xac_nhan = await HoaHong.sum("tien_hoa_hong", {
      where: { ctv_id: ctv.id, trang_thai: "cho_xac_nhan" },
    });

    const da_tra = await HoaHong.sum("tien_hoa_hong", {
      where: { ctv_id: ctv.id, trang_thai: "da_tra" },
    });

    const da_rut = await RutTienCTV.sum("so_tien", {
      where: { ctv_id: ctv.id, trang_thai: "da_duyet" },
    });

    const tong_f1 = await CTV.count({ where: { ctv_cha_id: ctv.id } });
    
    // F2: children of F1
    const f1_downlines = await CTV.findAll({ where: { ctv_cha_id: ctv.id }, attributes: ['id'] });
    const f1_ids = f1_downlines.map(f => f.id);
    const tong_f2 = f1_ids.length > 0 ? await CTV.count({ where: { ctv_cha_id: { [Op.in]: f1_ids } } }) : 0;
    
    // F3: children of F2
    const f2_downlines = f1_ids.length > 0 ? await CTV.findAll({ where: { ctv_cha_id: { [Op.in]: f1_ids } }, attributes: ['id'] }) : [];
    const f2_ids = f2_downlines.map(f => f.id);
    const tong_f3 = f2_ids.length > 0 ? await CTV.count({ where: { ctv_cha_id: { [Op.in]: f2_ids } } }) : 0;

    res.json({
      success: true,
      data: {
        cho_xac_nhan: cho_xac_nhan || 0,
        da_tra: da_tra || 0,
        da_rut: da_rut || 0,
        co_the_rut: (da_tra || 0) - (da_rut || 0),
        f1: tong_f1,
        f2: tong_f2,
        f3: tong_f3,
      },
    });
  } catch (error) {
    console.error("Get affiliate stats error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


// GET /api/affiliate/downline - Get F1/F2/F3
const getDownline = async (req, res) => {
  try {
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    // Get F1 (direct children of current CTV)
    const f1 = await CTV.findAll({
      where: { ctv_cha_id: ctv.id },
      include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
    });

    // Get F2 (children of F1)
    const f1_ids = f1.map(c => c.id);
    const f2 = f1_ids.length > 0 ? await CTV.findAll({
      where: { ctv_cha_id: { [Op.in]: f1_ids } },
      include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
    }) : [];

    // Get F3 (children of F2)
    const f2_ids = f2.map(c => c.id);
    const f3 = f2_ids.length > 0 ? await CTV.findAll({
      where: { ctv_cha_id: { [Op.in]: f2_ids } },
      include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
    }) : [];

    res.json({
      success: true,
      data: { f1, f2, f3 },
    });
  } catch (error) {
    console.error("Get downline error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/admin/ctvs - Admin: Get all CTVs with full downline tree
const getAllCTVsWithDownline = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { "$nguoiDung.ho_ten$": { [Op.like]: `%${search}%` } },
        { "$nguoiDung.email$": { [Op.like]: `%${search}%` } },
        { ma_gioi_thieu: { [Op.like]: `%${search}%` } },
      ];
    }

    // Get all CTVs with user info
    const { count, rows: ctvs } = await CTV.findAndCountAll({
      where: whereClause,
      include: [
        { model: NguoiDung, as: "nguoiDung", attributes: ["id", "ho_ten", "email", "sdt"] },
        { model: CTV, as: "cha", attributes: ["id", "ma_gioi_thieu"], include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten"] }] },
      ],
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    // For each CTV, get their downline tree and calculate commission
    const ctvList = [];
    for (const ctv of ctvs) {
      // Get F1 (direct downlines)
      const f1 = await CTV.findAll({
        where: { ctv_cha_id: ctv.id },
        include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
      });

      // Get F2 (children of F1)
      const f1_ids = f1.map(f => f.id);
      const f2 = f1_ids.length > 0 ? await CTV.findAll({
        where: { ctv_cha_id: { [Op.in]: f1_ids } },
        include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
      }) : [];

      // Get F3 (children of F2)
      const f2_ids = f2.map(f => f.id);
      const f3 = f2_ids.length > 0 ? await CTV.findAll({
        where: { ctv_cha_id: { [Op.in]: f2_ids } },
        include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
      }) : [];

      // Calculate total commission from HoaHong table (đã tính % hoa hồng)
      const hoaHongResult = await HoaHong.findAll({
        where: { ctv_id: ctv.id, trang_thai: "da_tra" },
        attributes: [[fn('SUM', col('tien_hoa_hong')), 'total']],
      });
      const tong_hoa_hong = parseFloat(hoaHongResult[0]?.dataValues?.total || 0);

      ctvList.push({
        ...ctv.toJSON(),
        trang_thai: ctv.trang_thai || "hoat_dong",
        downline: {
          f1: f1.map(f => ({ id: f.id, ho_ten: f.nguoiDung?.ho_ten, email: f.nguoiDung?.email })),
          f2: f2.map(f => ({ id: f.id, ho_ten: f.nguoiDung?.ho_ten, email: f.nguoiDung?.email })),
          f3: f3.map(f => ({ id: f.id, ho_ten: f.nguoiDung?.ho_ten, email: f.nguoiDung?.email })),
        },
        tong_f1: f1.length,
        tong_f2: f2.length,
        tong_f3: f3.length,
        tong_hoa_hong: tong_hoa_hong,
      });
    }

    res.json({
      success: true,
      data: {
        ctvs: ctvList,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all CTVs error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/affiliate/admin/ctvs/:id/status - Admin: Cập nhật trạng thái CTV
const updateCTVStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    const ctv = await CTV.findByPk(id);
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    await ctv.update({ trang_thai });

    res.json({ success: true, message: "Cập nhật trạng thái thành công", data: ctv });
  } catch (error) {
    console.error("Update CTV status error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/admin/ctvs - Admin: Tạo CTV mới
const createCTV = async (req, res) => {
  try {
    const { nguoi_dung_id, ma_gioi_thieu, ctv_cha_id, cap_do } = req.body;
    if (!nguoi_dung_id) return res.status(400).json({ success: false, message: "Thiếu nguoi_dung_id" });
    const existing = await CTV.findOne({ where: { nguoi_dung_id } });
    if (existing) return res.status(400).json({ success: false, message: "Người dùng đã là CTV" });
    const ma = ma_gioi_thieu || "CTV" + Date.now();
    const ctv = await CTV.create({ nguoi_dung_id, ma_gioi_thieu: ma, ctv_cha_id: ctv_cha_id || null, cap_do: cap_do || 1, trang_thai: "hoat_dong" });
    res.status(201).json({ success: true, message: "Tạo CTV thành công", data: ctv });
  } catch (error) {
    console.error("Create CTV error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/affiliate/admin/ctvs/:id - Admin: Cập nhật CTV
const updateCTV = async (req, res) => {
  try {
    const ctv = await CTV.findByPk(req.params.id);
    if (!ctv) return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    const { ma_gioi_thieu, ctv_cha_id, cap_do, trang_thai } = req.body;
    await ctv.update({
      ma_gioi_thieu: ma_gioi_thieu || ctv.ma_gioi_thieu,
      ctv_cha_id: ctv_cha_id !== undefined ? ctv_cha_id : ctv.ctv_cha_id,
      cap_do: cap_do || ctv.cap_do,
      trang_thai: trang_thai || ctv.trang_thai,
    });
    res.json({ success: true, message: "Cập nhật CTV thành công", data: ctv });
  } catch (error) {
    console.error("Update CTV error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/affiliate/admin/ctvs/:id - Admin: Xóa CTV
const deleteCTV = async (req, res) => {
  try {
    const { id } = req.params;

    const ctv = await CTV.findByPk(id);
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    // Kiểm tra nếu CTV có downline thì không cho xóa
    const downlineCount = await CTV.count({ where: { ctv_cha_id: id } });
    if (downlineCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Không thể xóa CTV có downline. Vui lòng chuyển downline sang CTV khác trước." 
      });
    }

    await ctv.destroy();

    res.json({ success: true, message: "Xóa CTV thành công" });
  } catch (error) {
    console.error("Delete CTV error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/commissions - Get commissions
const getCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    const { count, rows } = await HoaHong.findAndCountAll({
      where: { ctv_id: ctv.id },
      include: [{ model: DonHang, as: "donHang", attributes: ["ma_don_hang", "tong_tien"] }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        commissions: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    console.error("Get commissions error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/withdraw - Request withdrawal
const requestWithdraw = async (req, res) => {
  try {
    const { so_tien, so_tk_ngan_hang, ten_ngan_hang, ten_chu_tk, phuong_thuc, noi_dung_tt } = req.body;

    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    // Check balance
    const confirmed = await HoaHong.sum("tien_hoa_hong", {
      where: { ctv_id: ctv.id, trang_thai: "da_tra" },
    });
    const pending = await HoaHong.sum("tien_hoa_hong", {
      where: { ctv_id: ctv.id, trang_thai: "cho_xac_nhan" },
    });
    const withdrawn = await RutTienCTV.sum("so_tien", {
      where: { ctv_id: ctv.id, trang_thai: "da_duyet" },
    });

    const available = (confirmed || 0) - (withdrawn || 0);
    if (so_tien > available) {
      return res.status(400).json({ success: false, message: "Số dư không đủ" });
    }

    const withdrawal = await RutTienCTV.create({
      ctv_id: ctv.id,
      so_tien,
      so_tk_ngan_hang,
      ten_ngan_hang: ten_ngan_hang || "MB BANK",
      ten_chu_tk,
      phuong_thuc: phuong_thuc || "bank",
      noi_dung_tt,
      phi_rut: 1000,
      trang_thai: "cho_duyet",
    });

    res.status(201).json({
      success: true,
      message: "Yêu cầu rút tiền thành công",
      data: withdrawal,
    });
  } catch (error) {
    console.error("Request withdraw error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/withdrawals - Get withdrawal history
const getWithdrawals = async (req, res) => {
  try {
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (!ctv) {
      return res.status(404).json({ success: false, message: "CTV không tồn tại" });
    }

    const withdrawals = await RutTienCTV.findAll({
      where: { ctv_id: ctv.id },
      order: [["ngay_yeu_cau", "DESC"]],
    });

    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Mock MoMo service
const { mockMoMoDisbursement, generateWithdrawalQR, generateTransferInfo } = require("../services/withdrawalMockService");

// GET /api/affiliate/admin/withdrawals - Get all withdrawals (Admin)
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await RutTienCTV.findAll({
      order: [["ngay_yeu_cau", "DESC"]],
      include: [
        {
          model: CTV,
          as: "ctv",
          include: [{ model: NguoiDung, as: "nguoiDung" }],
        },
      ],
    });

    res.json({ success: true, data: withdrawals });
  } catch (error) {
    console.error("Get all withdrawals error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/admin/withdrawals/:id/approve - Approve withdrawal (Admin)
const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy phương thức từ yêu cầu của CTV (CTV đã chọn rồi)
    const { phuong_thuc: methodFromRequest } = req.body;
    const selectedMethod = methodFromRequest || 'bank';

    const withdrawal = await RutTienCTV.findByPk(id, {
      include: [{ model: CTV, as: "ctv", include: [{ model: NguoiDung, as: "nguoiDung" }] }],
    });

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu rút tiền" });
    }

    if (withdrawal.trang_thai !== "cho_duyet") {
      return res.status(400).json({ success: false, message: "Yêu cầu này đã được xử lý" });
    }

    // Sử dụng phương thức mà CTV đã chọn khi yêu cầu
    const method = withdrawal.phuong_thuc || 'bank';

    let result;
    if (method === "momo") {
      // Gọi mock MoMo disbursement API
      result = await mockMoMoDisbursement({
        phone: withdrawal.ctv?.nguoiDung?.sdt,
        amount: withdrawal.so_tien,
      });
    } else {
      // Chuyển qua ngân hàng (thủ công)
      result = {
        resultCode: 0,
        message: "Chuyển qua ngân hàng",
        transId: "BANK" + Date.now(),
      };
    }

    if (result.resultCode === 0) {
      // Tạo QR MoMo nếu phương thức là momo
      let qr_url = null;
      if (method === "momo" && withdrawal.so_tk_ngan_hang) {
        const soTien = withdrawal.so_tien - (withdrawal.phi_rut || 1000);
        const noiDung = encodeURIComponent(`Rut tien CTV ${withdrawal.ten_chu_tk || ""}`);
        const tenTK = encodeURIComponent(withdrawal.ten_chu_tk || "CTV");
        // VietQR cho MoMo
        qr_url = `https://img.vietqr.io/image/MOMO-${withdrawal.so_tk_ngan_hang}-compact2.png?amount=${soTien}&addInfo=${noiDung}&accountName=${tenTK}`;
      }

      await withdrawal.update({
        trang_thai: "da_duyet",
        ngay_duyet: new Date(),
        ghi_chu: qr_url ? `QR:${qr_url}` : result.message,
        ma_giao_dich: result.transId,
        phuong_thuc: method || "bank",
      });

      res.json({
        success: true,
        message: "Đã duyệt yêu cầu rút tiền",
        transactionId: result.transId,
        method: method || "bank",
        qr_url,
      });
    } else {
      await withdrawal.update({
        trang_thai: "da_tu_choi",
        ghi_chu: result.message,
      });

      res.json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/admin/withdrawals/:id/reject - Reject withdrawal (Admin)
const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await RutTienCTV.findByPk(id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu rút tiền" });
    }

    if (withdrawal.trang_thai !== "cho_duyet") {
      return res.status(400).json({ success: false, message: "Yêu cầu này đã được xử lý" });
    }

    await withdrawal.update({
      trang_thai: "da_tu_choi",
      ngay_duyet: new Date(),
      ghi_chu: reason || "Từ chối",
    });

    res.json({ success: true, message: "Đã từ chối yêu cầu rút tiền" });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/admin/withdrawals/:id/qr - Get withdrawal QR code
const getWithdrawalQR = async (req, res) => {
  try {
    const { id } = req.params;

    const withdrawal = await RutTienCTV.findByPk(id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu rút tiền" });
    }

    const qrUrl = generateWithdrawalQR(withdrawal);
    const transferInfo = generateTransferInfo(withdrawal);

    res.json({
      success: true,
      data: {
        qrUrl,
        ...transferInfo,
      },
    });
  } catch (error) {
    console.error("Get withdrawal QR error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/register - Register as CTV (requires auth)
const registerAsCTV = async (req, res) => {
  try {
    const { ma_gioi_thieu } = req.body;

    // Check if already CTV
    const existing = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bạn đã là CTV" });
    }

    let ctv_cha_id = null;
    let cap_do = 1;

    // Find parent CTV
    if (ma_gioi_thieu) {
      const parentCTV = await CTV.findOne({ where: { ma_gioi_thieu } });
      if (parentCTV) {
        ctv_cha_id = parentCTV.id;
        cap_do = parentCTV.cap_do < 3 ? parentCTV.cap_do + 1 : 3;
      }
    }

    // Generate code
    const ma_ctv = "CTV" + Date.now();

    const ctv = await CTV.create({
      nguoi_dung_id: req.user.id,
      ctv_cha_id,
      cap_do,
      ma_gioi_thieu: ma_ctv,
      tong_downline: 0,
      tong_hoa_hong: 0,
      trang_thai: "hoat_dong",
    });

    // Update parent downline count
    if (ctv_cha_id) {
      await parentCTV.update({ tong_downline: parentCTV.tong_downline + 1 });
    }

    res.status(201).json({
      success: true,
      message: "Đăng ký CTV thành công",
      data: ctv,
    });
  } catch (error) {
    console.error("Register CTV error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/register-new - Register new user as CTV (no auth required)
const registerAffiliate = async (req, res) => {
  try {
    const { ho_ten, email, mat_khau, sdt, tinh_thanh, nghe_nghiep, link_mxh, ly_do, ma_gioi_thieu } = req.body;

    // Validate required fields
    if (!ho_ten || !email || !mat_khau) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin (họ tên, email, mật khẩu)" });
    }

    // Convert empty strings to null for optional fields
    const optionalFields = {
      sdt: sdt || null,
      tinh_thanh: tinh_thanh || null,
      nghe_nghiep: nghe_nghiep || null,
      link_mxh: link_mxh || null,
      ly_do: ly_do || null,
    };

    // Check if email already exists
    const existingUser = await NguoiDung.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mat_khau, salt);

    // Create user
    const user = await NguoiDung.create({
      ho_ten,
      email,
      mat_khau: hashedPassword,
      sdt: sdt || null,
      chuc_vu_id: 6, // CTV role
      trang_thai: "hoat_dong",
    });

    // Find parent CTV if referral code provided
    let ctv_cha_id = null;
    let cap_do = 1;

    if (ma_gioi_thieu) {
      const parentCTV = await CTV.findOne({ where: { ma_gioi_thieu } });
      if (parentCTV) {
        ctv_cha_id = parentCTV.id;
        // cap_do = cap_do của cha + 1, tối đa 3
        cap_do = Math.min(parentCTV.cap_do + 1, 3);
      }
    }

    // Generate unique affiliate code
    const ma_ctv = "CTV" + Date.now();

    // Create CTV record
    const ctv = await CTV.create({
      nguoi_dung_id: user.id,
      ctv_cha_id,
      cap_do,
      ma_gioi_thieu: ma_ctv,
      tong_downline: 0,
      tong_hoa_hong: 0,
      trang_thai: "hoat_dong",
    });

    // Update parent downline count
    if (ctv_cha_id) {
      const parentCTV = await CTV.findByPk(ctv_cha_id);
      await parentCTV.update({ tong_downline: parentCTV.tong_downline + 1 });
    }

    // Generate JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user.id, email: user.email, chuc_vu_id: user.chuc_vu_id },
      process.env.JWT_SECRET || "nta_secret_key_2026",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký CTV thành công",
      data: {
        user: {
          id: user.id,
          ho_ten: user.ho_ten,
          email: user.email,
          sdt: user.sdt,
          chuc_vu_id: user.chuc_vu_id,
        },
        ctv: {
          id: ctv.id,
          ma_gioi_thieu: ctv.ma_gioi_thieu,
          cap_do: ctv.cap_do,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register affiliate error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/generate-link - Generate affiliate link for a product
const generateAffiliateLink = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    // Get CTV info
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: userId } });
    if (!ctv) {
      return res.status(400).json({ success: false, message: "Bạn chưa đăng ký làm CTV" });
    }

    // Get product info
    const product = await Sach.findByPk(product_id, {
      include: [{ model: LoaiSach, as: "loaiSach" }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    // Generate affiliate link
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const affiliateLink = `${baseUrl}/product/${product_id}?ref=${ctv.ma_gioi_thieu}`;

    res.json({
      success: true,
      data: {
        link: affiliateLink,
        product: {
          id: product.id,
          ten_sach: product.ten_sach,
          gia_ban: product.gia_ban,
          loaiSach: product.loaiSach,
        },
        ctv: {
          ma_gioi_thieu: ctv.ma_gioi_thieu,
          cap_do: ctv.cap_do,
        },
      },
    });
  } catch (error) {
    console.error("Generate affiliate link error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/products - Get products with commission info
const getAffiliateProducts = async (req, res) => {
  try {
    const { loai_sach_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (loai_sach_id) where.loai_sach_id = loai_sach_id;

    const { count, rows: books } = await Sach.findAndCountAll({
      where,
      include: [{ model: LoaiSach, as: "loaiSach", attributes: ["id", "ten_loai"] }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Add commission rate based on category
    const productsWithCommission = books.map(book => {
      const categoryName = book.loaiSach?.ten_loai?.toLowerCase() || "";
      const commission = categoryName.includes("ielts") ? 10 : 5;
      
      return {
        id: book.id,
        ten_sach: book.ten_sach,
        gia_ban: book.gia_ban,
        hinh_anh: book.hinh_anh,
        mo_ta: book.mo_ta,
        loaiSach: book.loaiSach,
        commission,
        commissionAmount: parseFloat(book.gia_ban) * commission / 100,
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithCommission,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get affiliate products error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/affiliate/by-ref/:refCode - Get CTV by referral code
const getCTVByRefCode = async (req, res) => {
  try {
    const { refCode } = req.params;

    const ctv = await CTV.findOne({
      where: { ma_gioi_thieu: refCode },
      attributes: ["id", "ma_gioi_thieu", "cap_do"],
    });

    if (!ctv) {
      return res.status(404).json({ success: false, message: "Không tìm thấy CTV" });
    }

    res.json({ success: true, data: ctv });
  } catch (error) {
    console.error("Get CTV by ref code error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/admin/fix-cap-do - Tính lại cap_do cho toàn bộ CTV
const fixCapDo = async (req, res) => {
  try {
    // Lấy tất cả CTV không có cha (gốc) → cap_do = 1
    const roots = await CTV.findAll({ where: { ctv_cha_id: null } });
    let updated = 0;

    const fixRecursive = async (parentId, parentCapDo) => {
      const children = await CTV.findAll({ where: { ctv_cha_id: parentId } });
      for (const child of children) {
        const correctCapDo = Math.min(parentCapDo + 1, 3);
        if (child.cap_do !== correctCapDo) {
          await child.update({ cap_do: correctCapDo });
          updated++;
        }
        await fixRecursive(child.id, correctCapDo);
      }
    };

    for (const root of roots) {
      if (root.cap_do !== 1) {
        await root.update({ cap_do: 1 });
        updated++;
      }
      await fixRecursive(root.id, 1);
    }

    res.json({ success: true, message: `Đã cập nhật cap_do cho ${updated} CTV`, data: { updated } });
  } catch (error) {
    console.error("Fix cap_do error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/affiliate/admin/backfill-commissions - Tạo hoa hồng cho các đơn da_tt chưa có
const backfillCommissions = async (req, res) => {
  try {
    // Lấy tất cả đơn da_tt có ctv_id (kể cả đơn không có ctv_id để debug)
    const allOrders = await DonHang.findAll({
      where: { trang_thai: "da_tt" },
    });

    const details = [];
    let created = 0;
    let skipped = 0;

    for (const order of allOrders) {
      const info = { order_id: order.id, ma_don_hang: order.ma_don_hang, ctv_id: order.ctv_id, reason: null };

      if (!order.ctv_id) {
        info.reason = "no_ctv_id";
        skipped++;
        details.push(info);
        continue;
      }

      // Kiểm tra đã có hoa hồng chưa
      const existing = await HoaHong.findOne({ where: { don_hang_id: order.id } });
      if (existing) {
        // Nếu hoa hồng đang cho_xac_nhan → update thành da_tra
        if (existing.trang_thai === "cho_xac_nhan") {
          await existing.update({ trang_thai: "da_tra" });
          info.reason = `updated cho_xac_nhan -> da_tra (hoa_hong_id=${existing.id})`;
          created++;
        } else {
          info.reason = `already_has_commission (hoa_hong_id=${existing.id}, trang_thai=${existing.trang_thai})`;
          skipped++;
        }
        details.push(info);
        continue;
      }

      // Tìm CTV — ctv_id trên đơn hàng có thể là nguoi_dung_id hoặc ctv.id trực tiếp
      let ctv = await CTV.findOne({ where: { nguoi_dung_id: order.ctv_id } });
      if (!ctv) {
        // Thử tìm trực tiếp theo ctv.id
        ctv = await CTV.findByPk(order.ctv_id);
      }
      if (!ctv) {
        info.reason = `ctv_not_found (tried nguoi_dung_id=${order.ctv_id} and ctv.id=${order.ctv_id})`;
        skipped++;
        details.push(info);
        continue;
      }

      const commissionAmount = parseFloat(order.tong_tien) * 0.10;
      if (commissionAmount > 0) {
        await HoaHong.create({
          ctv_id: ctv.id,
          don_hang_id: order.id,
          tien_hoa_hong: commissionAmount,
          cap_do: 1,
          ty_le_pham_ram: 10,
          trang_thai: "da_tra",
        });
        info.reason = `created (ctv_id=${ctv.id}, amount=${commissionAmount})`;
        created++;
      } else {
        info.reason = "amount_zero";
        skipped++;
      }
      details.push(info);
    }

    res.json({
      success: true,
      message: `Đã tạo ${created} hoa hồng, bỏ qua ${skipped} đơn`,
      data: { created, skipped, details },
    });
  } catch (error) {
    console.error("Backfill commissions error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/books/orders/tra-cuu - Tra cứu đơn hàng (không cần đăng nhập)
const traCuuDonHang = async (req, res) => {
  try {
    const { ma_don_hang, sdt } = req.query;
    if (!ma_don_hang || !sdt) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã đơn hàng và số điện thoại" });
    }
    const order = await DonHang.findOne({
      where: { ma_don_hang },
      include: [
        { model: NguoiDung, as: "nguoiMua", attributes: ["id", "ho_ten", "email", "sdt"] },
        { model: ChiTietDonHang, as: "chiTiets", include: [{ model: Sach, as: "sach", attributes: ["id", "ten_sach", "gia_ban", "hinh_anh"] }] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    const sdt_nguoi_mua = order.nguoiMua?.sdt || "";
    const dia_chi_giao = order.dia_chi_giao || "";
    if (!sdt_nguoi_mua.includes(sdt) && !dia_chi_giao.includes(sdt)) {
      return res.status(403).json({ success: false, message: "Số điện thoại không khớp với đơn hàng" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Tra cuu don hang error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getCategories,
  getAllBooks,
  getTopProducts,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getOrderStats,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  traCuuDonHang,
  getCTVProfile,
  getAffiliateStats,
  getDownline,
  getCommissions,
  requestWithdraw,
  getWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalQR,
  registerAsCTV,
  registerAffiliate,
  generateAffiliateLink,
  getAffiliateProducts,
  getCTVByRefCode,
  backfillCommissions,
  fixCapDo,
  getAllCTVsWithDownline,
  updateCTVStatus,
  createCTV,
  updateCTV,
  deleteCTV,
};

// ==================== ADMIN: COMMISSION MANAGEMENT ====================

// GET /api/affiliate/admin/commissions
const getAdminCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, trang_thai, ctv_id } = req.query;
    const where = {};
    if (trang_thai && trang_thai !== "all") where.trang_thai = trang_thai;
    if (ctv_id) where.ctv_id = ctv_id;

    const { count, rows } = await HoaHong.findAndCountAll({
      where,
      include: [
        { model: CTV, as: "ctv", include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["id", "ho_ten", "email"] }] },
        { model: DonHang, as: "donHang", attributes: ["id", "ma_don_hang", "tong_tien"] },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ success: true, data: { commissions: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/affiliate/admin/commissions/:id/status
const updateAdminCommissionStatus = async (req, res) => {
  try {
    const hh = await HoaHong.findByPk(req.params.id);
    if (!hh) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await hh.update({ trang_thai: req.body.trang_thai });
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== ADMIN: COMMISSION PRODUCTS ====================

// GET /api/affiliate/admin/commission-products
const getCommissionProducts = async (req, res) => {
  try {
    const items = await CommissionProducts.findAll({
      include: [{ model: Sach, as: "sanPham", attributes: ["id", "ten_sach", "gia_ban"] }],
      order: [["id", "DESC"]],
    });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/affiliate/admin/commission-products
const createCommissionProduct = async (req, res) => {
  try {
    const item = await CommissionProducts.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/affiliate/admin/commission-products/:id
const updateCommissionProduct = async (req, res) => {
  try {
    const item = await CommissionProducts.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await item.update(req.body);
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/affiliate/admin/commission-products/:id
const deleteCommissionProduct = async (req, res) => {
  try {
    const item = await CommissionProducts.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    await item.destroy();
    res.json({ success: true, message: "Đã xóa" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== ADMIN: STATISTICS ====================

// GET /api/affiliate/admin/statistics
const getAdminStatistics = async (req, res) => {
  try {
    const { nam = new Date().getFullYear() } = req.query;
    const { ChiTietDonHang } = require("../models");

    // Doanh thu theo tháng (từ đơn đã thanh toán "da_tt")
    const doanhThuThang = [];
    for (let m = 1; m <= 12; m++) {
      const start = `${nam}-${String(m).padStart(2,"0")}-01`;
      const lastDay = new Date(nam, m, 0).getDate();
      const end = `${nam}-${String(m).padStart(2,"0")}-${lastDay}`;
      // Use "da_tt" for actual paid orders to get accurate revenue
      const tongTien = await DonHang.sum("tong_tien", {
        where: { 
          trang_thai: "da_tt",
          [Op.and]: sequelize.where(sequelize.col("created_at"), { [Op.between]: [start + " 00:00:00", end + " 23:59:59"] })
        }
      }) || 0;
      const soLuong = await DonHang.count({
        where: { 
          trang_thai: "da_tt",
          [Op.and]: sequelize.where(sequelize.col("created_at"), { [Op.between]: [start + " 00:00:00", end + " 23:59:59"] })
        }
      }) || 0;
      doanhThuThang.push({ thang: m, doanh_thu: tongTien, so_don: soLuong });
    }

    // Top sản phẩm bán chạy
    const topSanPham = await ChiTietDonHang.findAll({
      attributes: [
        "sach_id",
        [sequelize.fn("SUM", sequelize.col("so_luong")), "da_ban"],
        [sequelize.fn("SUM", sequelize.col("thanh_tien")), "doanh_thu"],
      ],
      include: [{ model: Sach, as: "sach", attributes: ["ten_sach", "gia_ban"] }],
      group: ["sach_id", "sach.id", "sach.ten_sach", "sach.gia_ban"],
      order: [[sequelize.fn("SUM", sequelize.col("so_luong")), "DESC"]],
      limit: 10,
    });

    // Top CTV
    const topCTV = await CTV.findAll({
      include: [{ model: NguoiDung, as: "nguoiDung", attributes: ["ho_ten", "email"] }],
      order: [["tong_hoa_hong", "DESC"]],
      limit: 10,
    });

    // Tổng quan - sử dụng "da_tt" cho doanh thu thực tế
    const tongDonHang = await DonHang.count();
    const tongDoanhThu = await DonHang.sum("tong_tien", { where: { trang_thai: "da_tt" } }) || 0;
    const tongCTV = await CTV.count();
    const tongHoaHong = await HoaHong.sum("tien_hoa_hong", { where: { trang_thai: "da_tra" } }) || 0;

    res.json({
      success: true,
      data: {
        tong_quan: { tong_don_hang: tongDonHang, tong_doanh_thu: tongDoanhThu, tong_ctv: tongCTV, tong_hoa_hong_da_tra: tongHoaHong },
        doanh_thu_thang: doanhThuThang,
        top_san_pham: topSanPham.map(sp => ({
          ten_sach: sp.sach?.ten_sach,
          gia_ban: sp.sach?.gia_ban,
          da_ban: parseInt(sp.dataValues.da_ban) || 0,
          doanh_thu: parseFloat(sp.dataValues.doanh_thu) || 0,
        })),
        top_ctv: topCTV.map(c => ({
          ho_ten: c.nguoiDung?.ho_ten,
          email: c.nguoiDung?.email,
          tong_hoa_hong: c.tong_hoa_hong,
          downline: c.tong_downline || 0,
        })),
      },
    });
  } catch (e) {
    console.error("Statistics error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  ...module.exports,
  getAdminCommissions, updateAdminCommissionStatus,
  getCommissionProducts, createCommissionProduct, updateCommissionProduct, deleteCommissionProduct,
  getAdminStatistics,
};
