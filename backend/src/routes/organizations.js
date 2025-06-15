import express from 'express';
import mongoose from 'mongoose';
import HealthcareOrganization from '../../database/mongodb_db/models/HealthCareOrganization.js';

// Set router
const router = express.Router();

/**
 * GET /submissions
 * --> This route returns all wait time submissions in the Wait Time Submission collection in mongodb
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


export default router;