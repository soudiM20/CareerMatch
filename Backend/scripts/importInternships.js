import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser"; // install this
import dotenv from "dotenv";
import Internship from "../models/Internship.js";

dotenv.config();

const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Expected format: DD-MM-YYYY
  const [day, month, year] = dateStr.split("-").map(Number);

  // Check for valid numbers
  if (!day || !month || !year) return null;

  // JS Date: months are 0-indexed
  const date = new Date(year, month - 1, day);

  // Validate the resulting date
  return isNaN(date.valueOf()) ? null : date;
};

const importData = async () => {
  try {
    // connect to DB
    await mongoose.connect(process.env.MONGO_URI);

    const results = [];

    fs.createReadStream("dataset_intern.csv") // path to your file
      .pipe(csv())
      .on("data", (row) => {
        const deadline = parseDate(row.Application_Deadline);

        if (!deadline && row.Application_Deadline) {
          console.warn(`Skipping invalid date: ${row.Application_Deadline}`);
        }

        results.push({
          Internship_ID: row.Internship_ID,
          Company_Name: row.Company_Name,
          Sector: row.Sector,
          Area_Field: row.Area_Field,
          Internship_Title: row.Internship_Title,
          Internship_State: row.Internship_State,
          Internship_District: row.Internship_District,
          Benefits: row.Benefits,
          Mode: row.Mode,
          Duration_Months: row.Duration_Months ? Number(row.Duration_Months) : null,
          Stipend_Amount: row.Stipend_Amount ? Number(row.Stipend_Amount) : null,
          Required_Skills: row.Required_Skills ? row.Required_Skills.split(";").map(s => s.trim()) : [],
          Application_Deadline: deadline,
          Company_Description: row.Company_Description,
          Stipend_Type: row.Stipend_Type,
          Requirement_Contact: row.Requirement_Contact,
          Eligibility_Education: row.Eligibility_Education,
          Eligibility_Experience: row.Eligibility_Experience,
          Eligibility_Description: row.Eligibility_Description,
          Hiring_Workflow: row.Hiring_Workflow,
        });
      })
      .on("end", async () => {
        try {
          await Internship.insertMany(results);
          console.log("✅ Internship CSV imported successfully!");
          mongoose.connection.close();
        } catch (err) {
          console.error("❌ Error inserting data:", err);
          mongoose.connection.close();
        }
      });
  } catch (error) {
    console.error("❌ Error connecting DB:", error);
    process.exit(1);
  }
};

importData();
