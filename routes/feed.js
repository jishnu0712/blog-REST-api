const express = require('express');

const feedController = require('../controller/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPost);

// POST /feed/post
router.post('/post', feedController.createPost);

module.exports = router;