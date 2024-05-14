const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

// Data Schema
const Post = require('../models/post')
const User = require('../models/user')
const InvitationCode = require('../models/invitation-code')

const adminLayout = '../views/layouts/admin-layout'

const jwtSecret = process.env.JWT_SECRET

/***************************** MIDDLEWARES *****************************/
// check if authentication is valid
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

// rate limiting
function customRateLimiter(retryTime, maxAttempts, errorMessage) {
    return rateLimit({
        windowMs: retryTime,
        max: maxAttempts,
        message: { error: errorMessage },
    });
}

/***************************** GET ROUTERS *****************************/
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

        const { codes, codeCnt } = await InvitationCode.get();

        response.render('admin/dashboard', {
            locals,
            posts,
            pageNum,
            hasNextPage,
            deletedPosts,
            deletedPageNum,
            hasNextDeletedPage,
            codes,
            codeCnt,
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
            post,
            isDeleted: post.isDeleted,
            layout: adminLayout,
        })
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
})

// POST
// Login
const loginRetryTime = 5 * 60 * 1000;
const loginMaxAttempts = 5;
const loginRLEMessage = `Too many login attempts, please try again in ${loginMaxAttempts} minutes.`
router.post('/login', customRateLimiter(loginRetryTime, loginMaxAttempts, loginRLEMessage), async (request, response) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin page.",
        }

        const { username, password } = request.body
        const sanitizedUsername = sanitizeHtml(username.trim());
        const sanitizedPassword = sanitizeHtml(password.trim());

        const user = await User.findOne({ username: sanitizedUsername });
        if (!user) {
            return response.status(401).json({ error: 'Invalid username or password.' })
        }

        const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password)
        if (!isPasswordValid) {
            return response.status(401).json({ error: 'Invalid username or password.' })
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '5h' }) // For development reason, change to 5h
        response.cookie('token', token, { httpOnly: true })

        response.status(201).json({ message: 'Login successfully.' })

    } catch (error) {
        return response.status(500).json({ error: 'Internal server error.' })
    }
});

// POST
// LOGOUT
router.post('/logout', async (request, response) => {
    try {
        response.clearCookie('token')
        response.redirect('/')
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

    let updateFields = {
        title: data.title,
        body: data.body,
        updatedAt: Date.now()
    }
    if (data.action === 'Update And Restore') {
        updateFields.isDeleted = false
    }

    try {

        const updatedPost = await Post.findByIdAndUpdate(postId, updateFields, { new: true });

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

router.post('/add-invitation-code', authGuard, async (request, response) => {
    try {
        const {
            'invitation-code-1': code1,
            'invitation-code-2': code2,
            'invitation-code-3': code3,
            'invitation-code-4': code4,
        } = request.body;

        const code = `${code1}${code2}${code3}${code4}`;

        // If the code exists, show warning
        const existingCode = await InvitationCode.findOne({ code });
        if (existingCode) {
            console.log('Find key' + code);
            return response.status(400).json({ error: 'Invitation code already exists.' });
        }

        // Otherwise, save the code
        const newCode = new InvitationCode({ code })
        await newCode.save()

        response.status(201).json({ message: 'Invitation code added successfully.' });

    } catch(error) {
        console.log(error);
        response.status(500).json({ error: 'Internal server error.' });
    }
})

router.delete('/delete-code/:id', authGuard, async (request, response) => {
    const codeId = request.params.id

    try {
        const deletedCode = await InvitationCode.findOneAndDelete({ _id: codeId });

        if (!deletedCode) {
            throw new Error('Code not found.');
        }

        response.status(201).json({ message: 'Invitation code deleted successfully.' });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error.' })
    }
});



module.exports = router
