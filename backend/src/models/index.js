// Export all models
const UserModels = require("./UserModels");
const CourseModels = require("./CourseModels");
const OrderModels = require("./OrderModels");

module.exports = {
  ...UserModels,
  ...CourseModels,
  ...OrderModels,
};