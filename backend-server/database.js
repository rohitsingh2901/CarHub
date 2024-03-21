const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://127.0.0.1:27017/carhub';

const client = new MongoClient(MONGO_URI);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectToDatabase();

module.exports = {
    userCollection: client.db().collection('user'),
    dealershipCollection: client.db().collection('dealership'),
    // Add more collections as needed
};
