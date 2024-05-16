require('dotenv').config()
const visitorRouter = require('./server/routes/main')
const adminRouter = require('./server/routes/admin')
const getRouteClass = require('./server/helper/routeHelper')

const express = require('express')
const expressLayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')
const csrf = require('csurf');

const connectToDB = require('./server/config/db')

const app = express()

// Connect to mongodb
connectToDB()

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Make getRouteClass available to templates
app.use((request, response, next) => {
    response.locals.getRouteClass = getRouteClass;
    next()
})

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
}));

app.use(methodOverride('_method'))

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Parse application/json
app.use(express.json())

// CSRF token middleware
app.use(csrf({ cookie: true }));
app.use((request, response, next) => {
    if (request.method !== 'GET') {
        response.locals.csrfToken = request.csrfToken();
    }
    next();
});

app.use((error, request, response, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
        response.status(403).send({ error: 'CSRF token validation failed.' });
    } else {
        next(error);
    }
});

app.get('*', (request, response, next) => {
    response.locals.currRoute = request.path;
    next();
});

app.use('/', visitorRouter)
app.use('/', adminRouter)

const port = 3000 || process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})
