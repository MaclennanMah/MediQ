import express from 'express';
import mongoose from 'mongoose';
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

/**
 * GET /submissions/latest/organization/orgID
 * --> This route returns all organization wait time submissions for
 *     a specific organization the Wait Time Submission collection in mongodb
 */
router.get('/latest/organization/:orgID', async (req, res) => {
    // Get the org ID
    const {orgID} = req.params;

    // First check if the org id is valid
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({error: 'Error! An invalid organization id was entered'})
    }
    
    try {

        const latestOrganizationWaitTimeSubmission = await WaitTimeSubmission
        .findOne({
            organizationId: orgID,
            submittedBy: 'organization'
        })
        .sort({submissionDate: -1})
        .lean();


        // If nothing was found
        if (!latestOrganizationWaitTimeSubmission) {
            return res.status(404).json({message: `The latest organization wait time submission for ${orgID} could not be found!`})
        }

        return res.json(latestOrganizationWaitTimeSubmission)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch wait time submissions'})
    }
})

/**
 * GET /submissions/latest/patient/orgID
 * --> This route returns all organization wait time submissions for
 *     a specific organization the Wait Time Submission collection in mongodb
 */
router.get('/latest/patient/:orgID', async (req, res) => {
     // Get the org ID
    const {orgID} = req.params;

    // First check if the org id is valid
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({error: 'Error! An invalid organization id was entered'})
    }
    
    try {
        
        const latestOrganizationWaitTimeSubmission = await WaitTimeSubmission
        .findOne({
            organizationId: orgID,
            submittedBy: 'patient'
        })
        .sort({submissionDate: -1})
        .lean();


        // If nothing was found
        if (!latestOrganizationWaitTimeSubmission) {
            return res.status(404).json({message: `The latest organization wait time submission for ${orgID} could not be found!`})
        }

        return res.json(latestOrganizationWaitTimeSubmission)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch wait time submissions'})
    }
})



export default router;