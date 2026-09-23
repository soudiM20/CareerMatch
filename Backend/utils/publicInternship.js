// Public catalog fields only. Mongo/Mongoose implementation metadata is never
// part of an internship API response.
export const publicInternship = (internship) => {
  if (!internship) return internship;
  const plain = typeof internship.toObject === "function" ? internship.toObject() : internship;
  const {
    _id, __v, createdAt, updatedAt, Requirement_Contact,
    ...publicFields
  } = plain;
  return publicFields;
};

// Stripped down version for list/search to prevent data exposure of sensitive or long fields not used in lists.
export const publicInternshipSummary = (internship) => {
  if (!internship) return internship;
  const plain = typeof internship.toObject === "function" ? internship.toObject() : internship;
  const { 
    _id, __v, createdAt, updatedAt, 
    Requirement_Contact, Eligibility_Education, Eligibility_Experience, Eligibility_Description, Hiring_Workflow, Company_Description,
    ...publicFields 
  } = plain;
  return publicFields;
};
