const mongoose = require('mongoose')

const connectToDBByFactory = async (connectionFactory = mongoose.connect) => {
    mongoose.set('strictQuery', false)
    return connectionFactory(process.env.MONGODB_URI)
        .then(conn => {
            const host = conn.connection.host
            const port = conn.connection.port
            const dbName = conn.connection.db.databaseName
            console.log(`Host: ${host}, port: ${port}, db: ${dbName}`)
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err)
        });
}

// Mocked connection function for testing
const mockConnect = () => {
    return Promise.reject(new Error('Mocked connection error'));
}

const connectToDB = () => connectToDBByFactory();

module.exports = connectToDB
