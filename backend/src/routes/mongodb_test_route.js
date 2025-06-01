import express from "express"
import HealthcareOrganization from "../../database/mongodb_db/models/HealthCareOrganization.js"
const router = express.Router()

// The route we want
router.get("/", async (req, res) => {
    try {
        const allOrgs = await HealthcareOrganization.find().lean();
        return res.json(allOrgs);
    } catch (error) {
        console.log('Error fetching all Healthcare organization data')
        return res.status(500).json({
            message: `Error: ${error}`
        })
    }
})
    

export default router;