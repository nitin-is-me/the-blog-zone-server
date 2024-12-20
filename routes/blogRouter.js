const express = require('express');
const { postBlog, getBlogs, getBlogById, deleteBlog, postComment, deleteComment } = require('../controllers/blogController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', postBlog);

router.get('/', getBlogs);

router.get('/:id', getBlogById);

router.delete('/delete/:id', deleteBlog);

router.post("/:postId/comments", postComment);

router.delete("/comment/:commentId", deleteComment);

module.exports = router;
