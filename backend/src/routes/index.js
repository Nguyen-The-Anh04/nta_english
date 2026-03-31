// Export all routes
const authRoutes = require("./auth");
const userRoutes = require("./users");
const courseRoutes = require("./courses");
const bookRoutes = require("./books");
const affiliateRoutes = require("./affiliate");
const leadRoutes = require("./leads");
const reviewRoutes = require("./reviews");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/affiliate", affiliateRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/reviews", reviewRoutes);
};