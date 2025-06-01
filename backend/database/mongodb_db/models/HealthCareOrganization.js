// backend/database/mongodb_db/models/HealthCareOrganization.js
import mongoose from 'mongoose';

const healthcareOrganizationSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    address:           { type: String, required: true, trim: true },
    phoneNumber:       { type: String, default: null },
    latestWaitTimeSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaitTimeSubmission',
      default: null,
    },
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
