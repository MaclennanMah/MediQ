import express from 'express';
import WaitTimeSubmission from '../../database/mongodb_db/models/WaitTimeSubmission.js';

// Set router
const router = express.Router();

/**
 * GET /submissions
 * --> This route returns all wait time submissions in the Wait Time Submission collection in mongodb
 */
router.get('/', async (req, res) => {
    try {
        const allWaitTimeSubmissions = await WaitTimeSubmission.find().lean();
        res.json(allWaitTimeSubmissions)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch wait time submissions'})
    }
})

/**
 * GET /submissions/patient
 * --> This route returns all wait time submissions submitted by a patient in the Wait Time Submission collection in mongodb
 */
router.get('/patient', async (req, res) => {
    try {
        const allWaitTimeSubmissions = await WaitTimeSubmission.find({submittedBy: 'patient'})
        .lean();
        res.json(allWaitTimeSubmissions)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch wait time submissions'})
    }
})

/**
 * GET /submissions/organization
 * --> This route returns all wait time submissions submitted by an organization in the Wait Time Submission collection in mongodb
 */
router.get('/organization', async (req, res) => {
    try {
        const allWaitTimeSubmissions = await WaitTimeSubmission.find({submittedBy: 'organization'})
        .lean();
        res.json(allWaitTimeSubmissions)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch wait time submissions'})
    }
})


export default router;