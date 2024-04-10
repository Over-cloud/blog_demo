require('dotenv').config()
const visitorRouter = require('./server/routes/main')
const adminRouter = require('./server/routes/admin')

const express = require('express')
const expressLayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const connectToDB = require('./server/config/db')

const app = express()

// Connect to mongodb
connectToDB()

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Serve font files from the 'fonts' directory
app.use('/fonts', express.static('fonts'));

// templating engine
app.use(expressLayout)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

app.use(cookieParser())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
        maxAge: new Date(Date.now() + (3600000))
    }
}))

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Parse application/json
app.use(express.json())

app.use('/', visitorRouter)
app.use('/', adminRouter)

const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})
