const cron = require("node-cron");
const { HoaHong, DonHang } = require("../models");
const { Op } = require("sequelize");

// Run every day at 00:00
const checkCommissionApproval = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running commission approval check...");

    // Find commissions that are pending for more than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingCommissions = await HoaHong.findAll({
      where: {
        trang_thai: "cho_xac_nhan",
        created_at: {
          [Op.lte]: sevenDaysAgo,
        },
      },
    });

    console.log(`Found ${pendingCommissions.length} commissions to approve`);

    // Update status to approved
    for (const commission of pendingCommissions) {
      await commission.update({
        trang_thai: "da_tra",
        ngay_tra: new Date(),
      });

      console.log(`Approved commission ID: ${commission.id}`);
    }

    console.log("Commission approval check completed");
  } catch (error) {
    console.error("Commission approval check error:", error);
  }
});

// Start the cron job
checkCommissionApproval.start();

module.exports = checkCommissionApproval;
