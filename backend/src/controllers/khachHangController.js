const { KhachHang } = require("../models");
const { Op } = require("sequelize");

// Generate next ma_khach_hang
async function generateMaKH() {
  const last = await KhachHang.findOne({ order: [["id", "DESC"]] });
  const num = last ? parseInt(last.ma_khach_hang.replace("KH", "")) + 1 : 1;
  return `KH${num.toString().padStart(3, "0")}`;
}

// GET /api/customers - Get all customers
async function getAllCustomers(req, res) {
  try {
    const { page = 1, limit = 20, search = "", trang_thai } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { ten_khach_hang: { [Op.like]: `%${search}%` } },
        { so_dien_thoai: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { ma_khach_hang: { [Op.like]: `%${search}%` } },
      ];
    }
    if (trang_thai) {
      where.trang_thai = trang_thai;
    }

    const { count, rows } = await KhachHang.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["id", "DESC"]],
      include: [
        { model: require("../models").NguoiDung, as: "nhanVien", attributes: ["id", "ho_ten"] }
      ],
    });

    res.json({
      success: true,
      data: {
        customers: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("getAllCustomers error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/customers/:id - Get customer by ID
async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await KhachHang.findByPk(id, {
      include: [
        { model: require("../models").NguoiDung, as: "nhanVien", attributes: ["id", "ho_ten"] }
      ],
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("getCustomerById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/customers - Create customer
async function createCustomer(req, res) {
  try {
    const { ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi, nguon_khach, trang_thai, nhan_vien_id, ghi_chu } = req.body;

    if (!ten_khach_hang || !so_dien_thoai) {
      return res.status(400).json({ success: false, message: "Tên khách hàng và SĐT là bắt buộc" });
    }

    const newMaKH = ma_khach_hang || await generateMaKH();

    const customer = await KhachHang.create({
      ma_khach_hang: newMaKH,
      ten_khach_hang,
      so_dien_thoai,
      email,
      dia_chi,
      nguon_khach: nguon_khach || "landing_page",
      trang_thai: trang_thai || "moi",
      nhan_vien_id,
      ghi_chu,
    });

    res.status(201).json({ success: true, data: customer, message: "Thêm khách hàng thành công" });
  } catch (error) {
    console.error("createCustomer error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/customers/:id - Update customer
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { ten_khach_hang, so_dien_thoai, email, dia_chi, nguon_khach, trang_thai, nhan_vien_id, ghi_chu } = req.body;

    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    await customer.update({
      ten_khach_hang: ten_khach_hang || customer.ten_khach_hang,
      so_dien_thoai: so_dien_thoai || customer.so_dien_thoai,
      email: email !== undefined ? email : customer.email,
      dia_chi: dia_chi !== undefined ? dia_chi : customer.dia_chi,
      nguon_khach: nguon_khach || customer.nguon_khach,
      trang_thai: trang_thai || customer.trang_thai,
      nhan_vien_id: nhan_vien_id !== undefined ? nhan_vien_id : customer.nhan_vien_id,
      ghi_chu: ghi_chu !== undefined ? ghi_chu : customer.ghi_chu,
    });

    res.json({ success: true, data: customer, message: "Cập nhật khách hàng thành công" });
  } catch (error) {
    console.error("updateCustomer error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/customers/:id - Delete customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = await KhachHang.findByPk(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    await customer.destroy();

    res.json({ success: true, message: "Xóa khách hàng thành công" });
  } catch (error) {
    console.error("deleteCustomer error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/customers/stats - Get customer statistics
async function getCustomerStats(req, res) {
  try {
    const total = await KhachHang.count();
    const moi = await KhachHang.count({ where: { trang_thai: "moi" } });
    const cho_xac_nhan = await KhachHang.count({ where: { trang_thai: "cho_xac_nhan" } });
    const da_mua = await KhachHang.count({ where: { trang_thai: "da_mua" } });
    const huy = await KhachHang.count({ where: { trang_thai: "huy" } });

    res.json({
      success: true,
      data: {
        total,
        moi,
        cho_xac_nhan,
        da_mua,
        huy,
      },
    });
  } catch (error) {
    console.error("getCustomerStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
};