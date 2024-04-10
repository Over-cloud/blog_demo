const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const Post = require('../models/post')

// function testInsert() {
//     Post.insertMany([
//         {
//             title: 'First blog post',
//             body: 'Body of first blog post.',
//         },
//         {
//             title: 'Dos blog post',
//             body: 'Body of dos blog post.',
//         },
//     ])
//     console.log("test insertMany with dummy data")
// }
//
// testInsert()

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
        const sortCriteria = { createdAt: -1 }
        const posts = await Post.getByPage(pageNum, postPerPage, sortCriteria)

        const postCnt = await Post.count()
        const nextPageNum = (pageNum + 1) * postPerPage < postCnt ? (pageNum + 1) : -1

        response.render('index', {
            locals,
            posts,
            nextPageNum,
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
    response.render('about', { locals })
})

// GET
// CONTACT PAGE
router.get('/contact', (request, response) => {
    const locals = {
        title: "Contact",
        description: "Contact page",
    }
    response.render('contact', { locals })
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
