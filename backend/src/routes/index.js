// Export all routes
const authRoutes = require("./auth");
const userRoutes = require("./users");
const courseRoutes = require("./courses");
const bookRoutes = require("./books");
const affiliateRoutes = require("./affiliate");
const leadRoutes = require("./leads");
const reviewRoutes = require("./reviews");
const khuyenMaiRoutes = require("./khuyenMai");
const paymentRoutes = require("./payment");
const lmsRoutes = require("./lms");
const testRoutes = require("./test");
const customerRoutes = require("./customers");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/affiliate", affiliateRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/khuyen-mai", khuyenMaiRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/lms", lmsRoutes);
  app.use("/api/test", testRoutes);
  app.use("/api/exam", require("./exam"));
  app.use("/api/online-exam", require("./onlineExam"));
  app.use("/api/customers", customerRoutes);
};