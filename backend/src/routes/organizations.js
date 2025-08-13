import express from 'express';
import mongoose from 'mongoose';
import HealthcareOrganization from '../../database/mongodb_db/models/HealthCareOrganization.js';
import geo from '../../services/geocoder.js';

// Set router
const router = express.Router();

// Import dotenv
import dotenv from "dotenv";
dotenv.config();

// Get the auth header
const authToken = process.env.AUTHORIZATION_TOKEN

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
 * GET /organizations/search/near?lat=XXX&lng=ZZZ
 * --> Finds the organizations nearby based on latitude and longitude. If the 'max' key is not
 *     inputted, it automatically is set to 10000 (which means 10 km). 
 */
router.get('/search/near', async (req, res) => {
  const { lat, lng, max = 10000 } = req.query;
  const latitude  = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid lat or lng' });
  }

  // parse and validate maxDistance
  const maxDistanceMeters = parseInt(max, 10) || 10000;
  if (isNaN(maxDistanceMeters) || maxDistanceMeters <= 0) {
    return res.status(400).json({ error: 'maxDistance must be a positive integer (in meters)' });
  }

  const nearby = await HealthcareOrganization.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceMeters  // in meters
      }
    }
  }).lean();

  res.json(nearby);
});

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

    // First get the authorization header
    const authorization = req.headers.authorization
    
    // Check if request included auth header
    if (!authorization) {
        return res.status(401).json({message: 'Authorization header is missing'})
    }

    // Expecting format: "Bearer token"
    const token = authorization.split(' ')[1];

    // Validate auth header
    if (!token || token != authToken) {
        return res.status(401).json({message: 'Invalid Authorization token'})
    }
    
    const { organizationName, address, phoneNumber, organizationType } = req.body || {};
    if (!organizationName?.trim() || !address?.trim() || !organizationType) {
        return res
        .status(400)
        .json({ message: 'organizationName, address and organizationType are required' });
    }
    console.log('Now moving onto geo coder')
    try {
        // Here we geo code
        const [geoRes] = await geo.geocode(address)
        console.log(geoRes)

        if (!geoRes || typeof geoRes.latitude !== 'number') {
            return res.status(400).json({message: 'Unable to geocode address. Invalid address.'})
        }

        // Create new organization
        const newOrganization = await HealthcareOrganization.create({
            organizationName: organizationName.trim(),
            address: address.trim(),
            phoneNumber: phoneNumber || null,
            organizationType,
            location: {
                type: 'Point',
                coordinates: [geoRes.latitude, geoRes.longitude]
            }
        })

        return res.status(201).json({message: `Successfully created new organization. ${newOrganization}`})
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' + error});
    }   
})

/**
 * PUT /organizations/:orgID
 * --> This route updates an organization using its orgID
 */
router.put('/:orgID', async (req, res) => {
    // Get the orgID from request
    const { orgID } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(orgID)) {
        return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Check for Authorization header
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    // Extract and validate token
    const token = authorization.split(' ')[1];
    if (!token || token !== authToken) {
        return res.status(401).json({ message: 'Invalid Authorization token' });
    }

    try {
        // Try to update the organization
        const updatedOrganization = await HealthcareOrganization.findByIdAndUpdate(
            orgID,
            req.body,
            { new: true, runValidators: true } // return updated doc and validate input
        ).lean();

        // If the org was not found
        if (!updatedOrganization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        
        return res.status(200).json({
            message: 'Organization successfully updated',
            data: updatedOrganization
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;