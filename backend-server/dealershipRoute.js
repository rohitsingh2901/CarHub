const express = require('express');
const router = express.Router();

// Import MongoDB collections
const { dealershipCollection } = require('./database');

// Route for fetching all dealerships
router.get('/dealerships', async (req, res) => {
    try {
        const dealerships = await dealershipCollection.find().toArray();
        res.json(dealerships);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for creating a new dealership
router.post('/dealerships', async (req, res) => {
    try {
        const newDealership = req.body;
        const result = await dealershipCollection.insertOne(newDealership);
        res.json(result.ops[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching a specific dealership by ID
router.get('/dealerships/:id', async (req, res) => {
    try {
        const dealershipId = req.params.id;
        const dealership = await dealershipCollection.findOne({ _id: dealershipId });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }
        res.json(dealership);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for updating a dealership by ID
router.put('/dealerships/:id', async (req, res) => {
    try {
        const dealershipId = req.params.id;
        const updatedDealership = req.body;
        const result = await dealershipCollection.updateOne({ _id: dealershipId }, { $set: updatedDealership });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Dealership not found' });
        }
        res.json({ message: 'Dealership updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for deleting a dealership by ID
router.delete('/dealerships/:id', async (req, res) => {
    try {
        const dealershipId = req.params.id;
        const result = await dealershipCollection.deleteOne({ _id: dealershipId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Dealership not found' });
        }
        res.json({ message: 'Dealership deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for adding cars to dealership
router.post('/dealerships/:id/cars', async (req, res) => {
    try {
        const { id } = req.params;
        const { carId } = req.body;

        // Check if dealership exists
        const dealership = await dealershipCollection.findOne({ _id: id });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }

        // Check if car exists
        const car = await carsCollection.findOne({ _id: carId });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        // Add car to dealership's inventory
        await dealershipCollection.updateOne({ _id: id }, { $addToSet: { cars: carId } });

        res.json({ message: 'Car added to dealership inventory successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for adding deals to dealership
router.post('/dealerships/:id/deals', async (req, res) => {
    try {
        const { id } = req.params;
        const { carId, dealInfo } = req.body;

        // Check if dealership exists
        const dealership = await dealershipCollection.findOne({ _id: id });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }

        // Check if car exists
        const car = await carsCollection.findOne({ _id: carId });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        // Create deal
        const deal = await dealCollection.insertOne({ car_id: carId, deal_info: dealInfo });

        // Add deal to dealership's deals
        await dealershipCollection.updateOne({ _id: id }, { $addToSet: { deals: deal.insertedId } });

        res.json({ message: 'Deal added to dealership successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching all vehicles dealership has sold along with owner info
router.get('/dealerships/:id/sold-vehicles', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if dealership exists
        const dealership = await dealershipCollection.findOne({ _id: id });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }

        // Find all sold vehicles of the dealership
        const soldVehicles = await soldVehiclesCollection.find({ dealership_id: id }).toArray();

        // Get owner info for each sold vehicle
        const soldVehiclesWithOwners = await Promise.all(soldVehicles.map(async (soldVehicle) => {
            const owner = await userCollection.findOne({ _id: soldVehicle.owner_id });
            return { ...soldVehicle, owner_info: owner };
        }));

        res.json(soldVehiclesWithOwners);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to fetch all cars in a certain dealership
router.get('/dealerships/:id/cars', async (req, res) => {
    try {
        const { id } = req.params;

        // Find dealership by ID
        const dealership = await dealershipCollection.findOne({ _id: id });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }

        // Fetch all cars associated with the dealership
        const cars = await carsCollection.find({ _id: { $in: dealership.cars } }).toArray();

        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to fetch all deals from a certain dealership
router.get('/dealerships/:id/deals', async (req, res) => {
    try {
        const { id } = req.params;

        // Find dealership by ID
        const dealership = await dealershipCollection.findOne({ _id: id });
        if (!dealership) {
            return res.status(404).json({ error: 'Dealership not found' });
        }

        // Fetch all deals associated with the dealership
        const deals = await dealCollection.find({ dealership_id: id }).toArray();

        res.json(deals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

