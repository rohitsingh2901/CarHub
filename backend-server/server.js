const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const userRoutes = require('./userRoute');
const dealershipRoutes = require('./dealershipRoute');
const authRoutes = require('./authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/carhub';

app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(MONGO_URI);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        // Access collections after connecting
        const db = client.db();
        adminCollection = db.collection('admin');
        userCollection = db.collection('user');
        dealershipCollection = db.collection('dealership');
        dealCollection = db.collection('deal');
        carsCollection = db.collection('cars');
        soldVehiclesCollection = db.collection('sold_vehicles');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectToDatabase();

// Define MongoDB collections
let adminCollection, userCollection, dealershipCollection, dealCollection, carsCollection, soldVehiclesCollection;

//API routes

// Use route files
app.use('/api', userRoutes);
app.use('/api', dealershipRoutes);

// Use authentication routes
app.use('/api/auth', authRoutes);



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
