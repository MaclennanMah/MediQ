import express from "express"
const router = express.Router()

// The route we want
router.get("/", async (req, res) => {
    
    const connection = req.body;
    if (!connection) {
        return res.status(500).json({error: 'MySQL connection not found on req.db'})
    }

    // Query
    connection.query('SELECT * FROM HealthcareOrganization', (err, results) => {
        if(err) {
            console.error('Error querying MySQL: ', err);
            return res.status(500).json({error: err.message})
        }

        // Return
        return res.json(results)
    })
})
    

export default router;