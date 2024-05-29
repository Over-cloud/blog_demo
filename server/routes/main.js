const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()

const loginSignupLayout = '../views/layouts/login-signup-layout'

// Data Schema
const Post = require('../models/post')
const InvitationCode = require('../models/invitation-code')

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
        let posts, postCnt, connSucc = true;

        try {
            // Attempt to retrieve posts from the database
            const result = await Post.getByPage({ pageNum, postPerPage });
            posts = result.posts;
            postCnt = result.postCnt;
        } catch (error) {
            console.error("Error connecting to the database:", error);
            connSucc = false;
            posts = []; // Set posts to an empty array
            postCnt = 0;
        }

        const hasNextPage = (pageNum + 1) * postPerPage < postCnt

        response.render('index', {
            locals,
            connSucc,
            posts,
            pageNum,
            hasNextPage,
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
    })
})

// GET
// Login
router.get('/login', async (request, response) => {
    try {
        const locals = {
            title: "Login",
            description: "Admin page.",
            csrfToken: request.csrfToken(),
            message: request.query.message,
        }

        response.render('auth/login', {
            locals,
            layout: loginSignupLayout,
        })

    } catch (error) {
        console.log(error)
    }
})

// GET
// Signup
router.get('/signup', async (request, response) => {
    try {
        const locals = {
            title: "Signup",
            description: "Admin page.",
            csrfToken: request.csrfToken(),
        }

        response.render('auth/signup', {
            locals,
            layout: loginSignupLayout,
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

router.post('/verify-invitation-code', async (request, response) => {
    try {
        const {
            'invitation-code-1': code1,
            'invitation-code-2': code2,
            'invitation-code-3': code3,
            'invitation-code-4': code4,
        } = request.body;

        if (![code1, code2, code3, code4].every(code => /^\d{1}$/.test(code))) {
            return response.status(400).json({ error: "Must be a 4-digit code." });
        }

        const code = `${code1}${code2}${code3}${code4}`;

        const existingCode = await InvitationCode.findOne({ code });
        if (!existingCode) {
            return response.status(400).json({ error: 'Invitation code is invalid.' });
        }

        response.status(201).json({ message: 'Invitation code is valid.' });

    } catch (error) {
        console.log(error)
    }
})

module.exports = router
