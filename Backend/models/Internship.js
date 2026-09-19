import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  Internship_ID: { type: String, required: true, unique: true }, // From dataset
  Company_Name: { type: String },
  Sector: { type: String },
  Area_Field: { type: String },
  Internship_Title: { type: String },
  Internship_State: { type: String },
  Internship_District: { type: String },
  Benefits: { type: String },
  Mode: { type: String }, // Remote, On-site, Hybrid
  Duration_Months: { type: Number },
  Stipend_Amount: { type: Number },
  Required_Skills: [{ type: String }], // Will store skills as array
  Application_Deadline: { type: Date },
  Company_Description: { type: String },
  Stipend_Type: { type: String },
  Requirement_Contact: { type: String },
  Eligibility_Education: { type: String },
  Eligibility_Experience: { type: String },
  Eligibility_Description: { type: String },
  Hiring_Workflow: { type: String },
}, { timestamps: true });

export default mongoose.model("Internship", internshipSchema);
