const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const Post = require('../models/post')

// GET
// HOME
router.get('', async (request, response) => {
    try {
        const locals = {
            title: "Blog",
            description: "Simple blog",
        }

        const pageNum = request.query.page || 0
        const postPerPage = 5
        const {posts, postCnt} = await Post.getByPage({ pageNum, postPerPage })
        const hasNextPage = (pageNum + 1) * postPerPage < postCnt

        response.render('index', {
            locals,
            posts,
            pageNum,
            hasNextPage,
            currRoute: '/',
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// POST BY ID
router.get('/post/:id', async (request, response) => {
    try {

        const id = request.params.id
        const post = await Post.findById(id)

        const locals = {
            title: post.title,
            description: "Blog content",
        }

        response.render('post', {
            locals,
            post,
            currRoute: `/post/${id}`,
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// ABOUT PAGE
router.get('/about', (request, response) => {
    const locals = {
        title: "About",
        description: "About page",
    }
    response.render('about', {
        locals,
        currRoute: '/about',
    })
})

// GET
// CONTACT PAGE
router.get('/contact', (request, response) => {
    const locals = {
        title: "Contact",
        description: "Contact page",
    }
    response.render('contact', {
        locals,
        currRoute: '/contact',
    })
})

// GET
// Login-Register
router.get('/admin', async (request, response) => {
    try {
        const locals = {
            title: "Login-Register",
            description: "Admin page.",
        }

        response.render('login-register', {
            locals,
            currRoute: '/admin', // Unused
        })

    } catch (error) {
        console.log(error)
    }
})


// POST
// SEARCH
router.post('/search', [
    // Validate and sanitize the searchTerm field
    body('searchTerm').trim().escape(),
], async (request, response) => {
    try {
        // Check for validation errors
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const searchTerm = request.body.searchTerm
        const locals = {
            title: `Search for ${searchTerm}`,
            description: "Results of searching.",
        }

        // Find documents where either the title or body contains the searchTerm
        const posts = await Post.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in title
                { body: { $regex: searchTerm, $options: 'i' } }   // Case-insensitive search in body
            ]
        })

        response.render('search-results', {
            locals,
            posts,
        })

    } catch (error) {
        console.log(error)
    }
})


module.exports = router
