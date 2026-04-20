const cron = require("node-cron");
const { HoaHong, DonHang } = require("../models");
const { Op } = require("sequelize");

// Chạy mỗi ngày lúc 00:00
// Tự động xác nhận hoa hồng sau 3 ngày nếu đơn hàng đã hoàn tất (da_giao)
const checkCommissionApproval = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running commission approval check...");

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Tìm hoa hồng pending > 3 ngày từ đơn đã giao
    const pendingCommissions = await HoaHong.findAll({
      where: {
        trang_thai: "cho_xac_nhan",
        created_at: { [Op.lte]: threeDaysAgo },
      },
      include: [{
        model: DonHang,
        as: "donHang",
        where: { trang_thai: { [Op.in]: ["da_giao", "da_tt"] } },
        required: true,
      }],
    });

    console.log(`Found ${pendingCommissions.length} commissions to approve`);

    for (const commission of pendingCommissions) {
      await commission.update({ trang_thai: "da_tra" });
      console.log(`Approved commission ID: ${commission.id}`);
    }

    console.log("Commission approval check completed");
  } catch (error) {
    console.error("Commission approval check error:", error);
  }
});

module.exports = { checkCommissionApproval };
