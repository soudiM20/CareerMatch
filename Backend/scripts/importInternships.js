import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser"; // install this
import dotenv from "dotenv";
import Internship from "../models/Internship.js";

dotenv.config();

const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Expected format: DD-MM-YYYY
  const parts = dateStr.split("-").map(Number);
  const [day, month, year] = parts;

  // Check for valid numbers
  if (!day || !month || !year || parts.length !== 3) return null;

  // JS Date: months are 0-indexed
  const date = new Date(year, month - 1, day);

  // Fix (import-script audit): `new Date(year, month - 1, day)` silently
  // *rolls over* an invalid calendar date instead of producing an Invalid
  // Date — e.g. new Date(2025, 1, 31) (Feb 31) becomes March 3, 2025 rather
  // than failing. isNaN() alone never catches this. Reject the date unless
  // reading the day/month/year back off the constructed Date matches what
  // was actually parsed from the string.
  const isRealCalendarDate =
    !isNaN(date.valueOf()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealCalendarDate ? date : null;
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
          // Fix (import-idempotency audit): `insertMany()` throws a
          // duplicate-key error the moment it hits a row whose
          // `Internship_ID` already exists (the schema declares it unique),
          // which made re-running this script against the same dataset —
          // e.g. after a restart, or to refresh demo data — fail outright
          // instead of safely updating existing rows. `bulkWrite` with
          // per-row upserts makes re-imports idempotent: existing
          // internships are updated in place, new ones are inserted, and
          // one bad row no longer aborts the entire batch.
          const operations = results.map((doc) => ({
            updateOne: {
              filter: { Internship_ID: doc.Internship_ID },
              update: { $set: doc },
              upsert: true,
            },
          }));
          const result = await Internship.bulkWrite(operations, { ordered: false });
          console.log(
            `✅ Internship CSV imported successfully! ` +
            `(matched: ${result.matchedCount}, upserted: ${result.upsertedCount}, modified: ${result.modifiedCount})`
          );
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
