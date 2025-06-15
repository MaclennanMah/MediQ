import express from 'express';
import mongoose from 'mongoose';
import HealthcareOrganization from '../../database/mongodb_db/models/HealthCareOrganization.js';

// Set router
const router = express.Router();

/**
 * GET /organizations
 * --> This route returns all healthcare organizations in the healthcare_organization collection in mongodb
 */
router.get('/', async (req, res) => {
    try {
        const allHealthcareOrganizations = await HealthcareOrganization.find().lean();
        res.json(allHealthcareOrganizations)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch healthcare organizational data'})
    }
})

/**
 * GET /organizations/orgID
 * --> This route returns the data of a healthcare organization using its id
 */
router.get('/:orgID', async (req, res) => {
    // Get organization ID
    const {orgID} = req.params;

    // First check if the org id is valid
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({error: 'Error! An invalid organization id was entered'})
    }

    try {

        // Now get the data using the organization ID
        const healthcareOrganization = await HealthcareOrganization.find({_id: orgID}).lean();

         // If nothing was found
        if (!healthcareOrganization) {
            return res.status(404).json({message: `No organization found`})
        }

        res.json(healthcareOrganization)

    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Could not fetch healthcare organizational data'})
    }
})

/**
 * POST /organizations/
 * --> This route adds a single organization to the database
 */

router.post('/', async (req, res) => {
    
    try {
         // Get the data from the req.json
        const newOrganization = await HealthcareOrganization.create(req.body)
        res.status(201).json({message: 'Successfully created new organization'})
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }   
})

export default router;