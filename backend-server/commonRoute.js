const express = require('express');
const router = express.Router();

// Import MongoDB collections
const { carsCollection, dealCollection } = require('./database');

// Route for fetching all cars
router.get('/cars', async (req, res) => {
    try {
        const cars = await carsCollection.find().toArray();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching a specific car by ID
router.get('/cars/:id', async (req, res) => {
    try {
        const carId = req.params.id;
        const car = await carsCollection.findOne({ _id: carId });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for adding a new vehicle
router.post('/vehicles', async (req, res) => {
    try {
        const newVehicle = req.body;
        // Add logic to insert the new vehicle to user/dealership's list of owned/sold vehicles
        res.json({ message: 'Vehicle added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for viewing all deals from a certain dealership
router.get('/dealerships/:id/deals', async (req, res) => {
    try {
        const dealershipId = req.params.id;
        const deals = await dealCollection.find({ dealership_id: dealershipId }).toArray();
        res.json(deals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
