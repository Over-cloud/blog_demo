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
// Login-Register
router.get('/admin', async (request, response) => {
    try {
        const locals = {
            title: "Login-Register",
            description: "Admin page.",
        }

        response.render('admin/login-register', {
            locals,
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// ADMIN - dashboard
router.get('/dashboard', authGuard, async (request, response) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin page.",
        }

        const postPerPage = 5

        const pageNum = request.query.page || 0
        const { posts, postCnt } = await Post.getByPage({ pageNum, postPerPage })
        const hasNextPage = (pageNum + 1) * postPerPage < postCnt

        const deletedPageNum = request.query.deletedPage || 0
        const {posts: deletedPosts, postCnt: deletedPostCnt} = await Post.getDeletedByPage({ pageNum: deletedPageNum, postPerPage })
        const hasNextDeletedPage = (pageNum + 1) * postPerPage < deletedPostCnt

        response.render('admin/dashboard', {
            locals,
            posts,
            pageNum,
            hasNextPage,
            deletedPosts,
            deletedPageNum,
            hasNextDeletedPage,
            layout: adminLayout,
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// DASHBOARD - ADD POST
router.get('/add-post', authGuard, async (request, response) => {
    const locals = {
        title: "Add Post",
        description: "Create a new post.",
    }

    response.render('admin/add-post', {
        locals,
        layout: adminLayout,
    })
})

// GET
// DASHBOARD - EDIT POST
router.get('/edit-post/:id', authGuard, async (request, response) => {
    const locals = {
        title: "Edit Post",
        description: "Edit an existing post.",
    }

    const postId = request.params.id

    try {
        const post = await Post.findById(postId)

        if (!post) {
            throw new Error('Post not found.');
        }

        response.render('admin/edit-post', {
            locals,
            layout: adminLayout,
            post,
        })
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
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

// POST
// DASHBOARD - ADD POST
router.post('/add-post', authGuard, async (request, response) => {
    const data = request.body
    try {
        const newPost = new Post({
            title: data.title,
            body: data.body,
        })

        await newPost.save()

        response.redirect('/dashboard')
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
})

// PUT
// DASHBOARD - EDIT POST
router.put('/edit-post/:id', authGuard, async (request, response) => {
    const postId = request.params.id
    const data = request.body

    try {
        const updatedPost = await Post.findByIdAndUpdate(postId, {
            title: data.title,
            body: data.body,
            updatedAt: Date.now()
        }, { new: true });

        if (!updatedPost) {
            throw new Error('Post not found.');
        }

        response.redirect(`/edit-post/${postId}`)
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
})

// PUT
// DASHBOARD - DELETE POST
router.put('/delete-post/:id', authGuard, async (request, response) => {
    const postId = request.params.id

    try {
        const toDelete = await Post.findByIdAndUpdate(postId, {
            isDeleted: true,
            updatedAt: Date.now()
        }, { new: true });

        if (!toDelete) {
            throw new Error('Post not found.');
        }

        response.redirect('/dashboard')
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
})

// PUT
// DASHBOARD - RESTORE POST
router.put('/restore-post/:id', authGuard, async (request, response) => {
    const postId = request.params.id

    try {
        const toRestore = await Post.findByIdAndUpdate(postId, {
            isDeleted: false,
            updatedAt: Date.now()
        }, { new: true });

        if (!toRestore) {
            throw new Error('Post not found.');
        }

        response.redirect('/dashboard')
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
})


module.exports = router
