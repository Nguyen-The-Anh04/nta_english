const { TuVanLead, NguoiDung } = require("../models");

// POST /api/leads - Tạo lead mới (từ form đăng ký)
const createLead = async (req, res) => {
  try {
    const { name, phone, email, course, message } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền họ tên và số điện thoại",
      });
    }

    // Map course từ form sang muc_tieu
    const courseMapping = {
      "ielts-foundation": "IELTS Foundation (5.0-6.5)",
      "ielts-advanced": "IELTS Advanced (7.0+)",
      "ielts-junior": "IELTS Junior (12-17 tuổi)",
      "cambridge": "Cambridge (KET/PET)",
      "toeic": "TOEIC Master",
      "giao-tiep": "Giao Tiếp Cơ Bản",
    };

    // Create lead
    const now = new Date().toLocaleString('vi-VN');
    const lead = await TuVanLead.create({
      ho_ten: name,
      sdt: phone,
      email: email || null,
      muc_tieu: courseMapping[course] || course || null,
      ghi_chu: message || null,
      nguon_lead: "landing_page",
      trang_thai: "moi",
      trung_tam: "NTA_English",
      tu_van_vien: "NGUYỄN THẾ ANH",
      khoi_tao: `NGUYỄN THẾ ANH ${now}`,
      cap_nhat_gan_nhat: `NGUYỄN THẾ ANH ${now}`,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký tư vấn thành công!",
      data: lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// GET /api/leads - Lấy danh sách leads (cho dashboard)
const getLeads = async (req, res) => {
  try {
    const { status, search, nguon, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    
    // Filter by status
    if (status && status !== "all") {
      whereClause.trang_thai = status;
    }
    
    // Filter by source
    if (nguon && nguon !== "all") {
      whereClause.nguon_lead = nguon;
    }
    
    // Search by name, phone, email
    if (search) {
      const { Op } = require("sequelize");
      whereClause[Op.or] = [
        { ho_ten: { [Op.like]: `%${search}%` } },
        { sdt: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: leads } = await TuVanLead.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: "nguoiPhanCong",
          attributes: ["id", "ho_ten", "email"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// GET /api/leads/:id - Lấy chi tiết lead
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await TuVanLead.findByPk(id, {
      include: [
        {
          model: NguoiDung,
          as: "nguoiPhanCong",
          attributes: ["id", "ho_ten", "email"],
          required: false,
        },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lead",
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get lead error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// PUT /api/leads/:id - Cập nhật lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await TuVanLead.findByPk(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lead",
      });
    }

    // Auto update cap_nhat_gan_nhat with current user and time
    const now = new Date().toLocaleString('vi-VN');
    const currentUser = updateData.tu_van_vien || "NGUYỄN THẾ ANH";
    updateData.cap_nhat_gan_nhat = `${currentUser} ${now}`;

    await lead.update(updateData);

    // Fetch lại với include
    const updatedLead = await TuVanLead.findByPk(id, {
      include: [
        {
          model: NguoiDung,
          as: "nguoiPhanCong",
          attributes: ["id", "ho_ten", "email"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// DELETE /api/leads/:id - Xóa lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await TuVanLead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lead",
      });
    }

    await lead.destroy();

    res.json({
      success: true,
      message: "Xóa thành công",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// GET /api/leads/stats - Thống kê leads
const getLeadStats = async (req, res) => {
  try {
    const { fn, col } = require("sequelize");
    
    const statsByStatus = await TuVanLead.findAll({
      attributes: [
        "trang_thai",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["trang_thai"],
    });

    const statsBySource = await TuVanLead.findAll({
      attributes: [
        "nguon_lead",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["nguon_lead"],
    });

    const total = await TuVanLead.count();

    res.json({
      success: true,
      data: {
        total,
        byStatus: statsByStatus,
        bySource: statsBySource,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
};
