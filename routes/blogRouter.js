const express = require('express');
const { postBlog, getBlogs, getBlogById, deleteBlog } = require('../controllers/blogController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', postBlog);

router.get('/', getBlogs);

router.get('/:id', getBlogById);

router.delete('/delete/:id', deleteBlog)

module.exports = router;
