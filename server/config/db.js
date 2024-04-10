const mongoose = require('mongoose')

const connectToDB = async () => {
    mongoose.set('strictQuery', false)
    return mongoose.connect(process.env.MONGODB_URI)
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

module.exports = connectToDB
