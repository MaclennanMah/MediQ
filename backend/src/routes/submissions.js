import express from 'express';
import mongoose from 'mongoose';
import WaitTimeSubmission from '../../database/mongodb_db/models/WaitTimeSubmission.js';
import HealthcareOrganization from '../../database/mongodb_db/models/HealthCareOrganization.js';

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
 * GET /submissions/latest/organization/orgID
 * --> This route returns the latest organization wait time submissions for
 *     a specific organization.
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
 * --> This route returns the latest patient wait time submissions for
 *     a specific organization.
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


/**
 * POST /submissions/organization/orgID
 * --> This route adds a wait time submission submitted by the organization itself.
 */
router.post('/organization/:orgID', async (req, res) => {
     // Get the org ID
    const {orgID} = req.params;

    // Get the wait time
    const {waitTime} = req.body;

    // First check if the org id is valid
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({error: 'Error! An invalid organization id was entered'})
    }

    // Now check if the organization ID even exists
    const validOrganizationID = await HealthcareOrganization.findById(orgID).lean()

    if (!validOrganizationID) {
        return res.status(404).json({error: `Organization ID ${orgID} not found. Could not add wait time submission.`})
    }

    // Validate the wait time
    if (typeof waitTime !== 'number' || waitTime < 0){
        return res.status(400).json({error: 'The wait time must be a non-negative number!'})
    }

    try {
        
        // Add the instance to mongo
        const submission = await WaitTimeSubmission.create({
            organizationId: orgID,
            waitTime: waitTime,
            submittedBy: 'organization',
            ipAddress: req.ip
        })

        return res.status(201).json({message: `Successfully added the wait time submission: ${submission}`})

    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not add organization wait time submissions'})
    }
})


/**
 * POST /submissions/patient/orgID
 * --> This route adds a wait time submission submitted by a patient.
 */
router.post('/patient/:orgID', async (req, res) => {
     // Get the org ID
    const {orgID} = req.params;

    // Get the wait time
    const {waitTime} = req.body;

    // First check if the org id is valid
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({error: 'Error! An invalid organization id was entered'})
    }

    // Now check if the organization ID even exists
    const validOrganizationID = await HealthcareOrganization.findById(orgID).lean()

    if (!validOrganizationID) {
        return res.status(404).json({error: `Organization ID ${orgID} not found. Could not add wait time submission.`})
    }

    // Validate the wait time
    if (typeof waitTime !== 'number' || waitTime < 0){
        return res.status(400).json({error: 'The wait time must be a non-negative number!'})
    }

    try {
        
        // Add the instance to mongo
        const submission = await WaitTimeSubmission.create({
            organizationId: orgID,
            waitTime: waitTime,
            submittedBy: 'patient',
            ipAddress: req.ip
        })

        return res.status(201).json({message: `Successfully added the patient wait time submission: ${submission}`})

    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not add patient wait time submissions'})
    }
})

export default router;