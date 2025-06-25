// backend/database/mongodb_db/models/WaitTimeSubmission.js
import mongoose from 'mongoose';
import { estimateWaitTime } from '../../../services/estimateWaitTime';

const waitTimeSubmissionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthCareOrganization',  // matches the model name exactly
      required: true,
    },
    waitTime: { type: Number, required: true },
    submissionDateTimeStamp: { type: Date, default: Date.now },
    submittedBy: {
      type: String,
      enum: ['organization', 'user'],
      required: true,
    },
    ipAddress: { type: String, default: null },
  },
  {
    timestamps: false,
  }
);

// By adding this index, it will be extremely fast to return the latest wait time submission
waitTimeSubmissionSchema.index({ organizationId: 1, submittedBy: 1, submissionDateTimeStamp: -1 });


// Save hook
waitTimeSubmissionSchema.post('save', async function(doc) {
  try {
    const newEstimate = await estimateWaitTime(doc.organizationId, 20);
    await mongoose.model('HealthcareOrganization')
      .findByIdAndUpdate(doc.organizationId, { estimatedWaitTime: newEstimate });
  } catch (err) {
    console.error('Failed to update estimatedWaitTime:', err);
  }
})

const WaitTimeSubmission = mongoose.model(
  'WaitTimeSubmission',
  waitTimeSubmissionSchema,
  'wait_time_submissions'
);


export default WaitTimeSubmission;
