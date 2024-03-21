const express = require('express');
const router = express.Router();

// Import MongoDB collections
const { userCollection } = require('./database');

// Example route for fetching all users
router.get('/users', async (req, res) => {
    try {
        const users = await userCollection.find().toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching a specific user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Example route for creating a new user
router.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.json(result.ops[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for updating a user by ID
router.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUser = req.body;
        const result = await userCollection.updateOne({ _id: userId }, { $set: updatedUser });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for deleting a user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await userCollection.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for changing user password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // Find user by userId
        const user = await userCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password in the database
        await userCollection.updateOne({ _id: userId }, { $set: { password: hashedPassword } });

        // Invalidate existing JWT token by setting a short expiration time
        const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1s' });
        res.json({ message: 'Password changed successfully', token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching dealerships with a certain car
router.get('/dealerships/cars', async (req, res) => {
    try {
        const { carModel } = req.query;

        // Find dealerships with the specified car in their inventory
        const dealerships = await dealershipCollection.find({ 'cars.model': carModel }).toArray();
        
        if (!dealerships || dealerships.length === 0) {
            return res.status(404).json({ error: 'No dealerships found with the specified car' });
        }

        res.json(dealerships);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching all vehicles owned by user along with dealer info
router.get('/users/:userId/vehicles', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find user by userId
        const user = await userCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch vehicles owned by the user
        const vehicles = await dealershipCollection.aggregate([
            { $match: { _id: { $in: user.vehicles } } },
            { $lookup: { from: 'cars', localField: 'cars', foreignField: '_id', as: 'cars' } }
        ]).toArray();

        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for fetching all deals on a certain car
router.get('/cars/:carId/deals', async (req, res) => {
    try {
        const carId = req.params.carId;

        // Find deals with the specified carId
        const deals = await dealCollection.find({ car_id: carId }).toArray();

        res.json(deals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
