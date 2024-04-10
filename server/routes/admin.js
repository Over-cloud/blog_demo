const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const Post = require('../models/post')
const User = require('../models/user')

const adminLayout = '../views/layouts/admin'

const jwtSecret = process.env.JWT_SECRET

// middleware - check login
const authGuard = (request, response, next) => {
    const token = request.cookies.token
    if (!token) {
        return response.status(401).json({ error: 'Unauthorized.' })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        request.userId = decoded.userId
        next()
    } catch(error) {
        if (error.name === 'TokenExpiredError') {
            return response.status(401).json({ error: 'Session expired.' });
        } else {
            return response.status(401).json({ error: 'Unauthorized.' });
        }
    }
}

// GET
// ADMIN
router.get('/admin', async (request, response) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin page.",
        }

        response.render('admin/index', {
            locals,
            layout: adminLayout,
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// ADMIN - dashboard
router.get('/dashboard', authGuard, async (request, response) => {
    response.render('admin/dashboard')
    // try {
    //     const locals = {
    //         title: "Admin",
    //         description: "Admin page.",
    //     }
    //
    //     response.render('admin/dashboard', {
    //         locals,
    //         layout: adminLayout,
    //     })
    //
    // } catch (error) {
    //     console.log(error)
    // }
})

// POST
// Login
router.post('/login', async (request, response) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin page.",
        }

        const { username, password } = request.body
        const user = await User.findOne({ username })
        if (!user) {
            response.status(401).json({ error: 'Invalid username or password.' })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            response.status(401).json({ error: 'Invalid username or password.' })
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' })
        response.cookie('token', token, { httpOnly: true })

        response.redirect('/dashboard')

    } catch (error) {
        console.log(error)
        response.status(500).json({ error: 'Internal server error.' })
    }
})

// POST
// ADMIN - register
router.post('/register', async (request, response) => {
    try {
        const { username, password } = request.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            password: hashedPassword,
        })
        await newUser.save()

        response.status(201).json({ message: 'Register success.' })

    } catch(error) {
        if (error.code === 11000) {
            response.status(409).json({ error: 'User exists.' })
        } else {
            response.status(500).json({ error: 'Internal server error.' })
        }
    }
})


module.exports = router
