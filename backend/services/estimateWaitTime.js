/**
 * This module provides the function that will calculate each wait time submission by including the 
 * last 20 submissions. These last 20 submissions wait times will be taken into account and we will
 * use the median as the value for an average
 * 
 */

// backend/services/estimateWaitTime.js

import WaitTimeSubmission from '../database/mongodb_db/models/WaitTimeSubmission.js';

/**
 * Compute the median wait time from the most recent submissions.
 * @param {mongoose.Types.ObjectId|string} orgID
 * @param {number} limit  How many past submissions to consider (default 20)
 * @returns {Promise<number|null>}  The median wait time (minutes), or null if no data
 */

export async function estimateWaitTime(orgID, limit = 20) {
    // Fetch the latest `limit` submissions for this organization
    const submissions = await WaitTimeSubmission
        .find({ organizationId: orgID })
        .sort({ submissionDateTimeStamp: -1 })
        .limit(limit)
        .lean();

    // Check if anything was returned
    if (!submissions.length) {
        return null;
    }

  // Get all the times from the submissions
  const times = submissions
    .map(s => s.waitTime)
    .sort((a, b) => a - b);

  // Calculate the median (middle value)
  const mid = Math.floor(times.length / 2);
  let median;


  if (times.length % 2 === 0) {
    // even count → average the two middle values
    median = (times[mid - 1] + times[mid]) / 2;
  } else {
    // odd count → take the middle value
    median = times[mid];
  }

  // 4) Round to nearest integer and return
  return Math.round(median);
}
