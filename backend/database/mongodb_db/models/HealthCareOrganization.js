// backend/database/mongodb_db/models/HealthCareOrganization.js
import mongoose from 'mongoose';

const healthcareOrganizationSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    address:           { type: String, required: true, trim: true },
    phoneNumber:       { type: String, default: null },
    organizationType: {
      type: String,
      required: true,
      enum: ["Hospital", "Walk-In Clinic"], 
      trim: true
    },
    // New field for the live estimate (in minutes)
    estimatedWaitTime: { type: Number, default: null }
  },
  {
    timestamps: true,
  }
);

// Third argument ('healthcare_organizations') forces the collection name in MongoDB.
const HealthcareOrganization = mongoose.model(
  'HealthcareOrganization',
  healthcareOrganizationSchema,
  'healthcare_organizations'
);

export default HealthcareOrganization;
