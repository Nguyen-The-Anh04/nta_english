// Export all models
const UserModels = require("./UserModels");
const CourseModels = require("./CourseModels");
const OrderModels = require("./OrderModels");
const TuVanLeadModels = require("./TuVanLeadModels");
const ReviewModels = require("./ReviewModels");

module.exports = {
  ...UserModels,
  ...CourseModels,
  ...OrderModels,
  TuVanLead: TuVanLeadModels.TuVanLead,
  DanhGia: ReviewModels.DanhGia,
};