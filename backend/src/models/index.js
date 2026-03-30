// Export all models
const UserModels = require("./UserModels");
const CourseModels = require("./CourseModels");
const OrderModels = require("./OrderModels");
const TuVanLeadModels = require("./TuVanLeadModels");

module.exports = {
  ...UserModels,
  ...CourseModels,
  ...OrderModels,
  TuVanLead: TuVanLeadModels.TuVanLead,
};