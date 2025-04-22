const BlogPost = require('../models/BlogPost');
const jwt = require("jsonwebtoken");
const Comment = require('../models/Comment');
const Blogger = require('../models/Blogger');

// Create a new blog post
exports.postBlog = async (req, res) => {
  try {
    const { title, content, private } = req.body;

    // Extracting user info from the jwt
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a post.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id; // The user id, needed for creating post (author is object id)

    // Creating a new blog post with the author's ID
    const newPost = await BlogPost.create({
      title,
      content,
      authorId,
      private
    });

    res.status(201).json({
      message: 'Blog post created successfully!',
      blog: newPost,
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};

// Fetching all blog posts
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.findAll({
      where: { private: false },
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name'],
        },
        {
          model: Comment,
          attributes: ['content', 'createdAt'],
          include: {
            model: Blogger,
            attributes: ['name', 'username'],
          },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// Fetching private blogs for a specific user
exports.getPrivateBlogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to fetch private posts.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const privatePosts = await BlogPost.findAll({
      where: { authorId: userId, private: true },
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(privatePosts);
  } catch (error) {
    console.error("Error fetching private posts:", error);
    res.status(500).json({ error: "Failed to fetch private posts." });
  }
};

// Fetching a single blog post by its ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findByPk(id, {
      include: [
        {
          model: Blogger,
          attributes: ['username', 'name'],
        },
        {
          model: Comment,
          attributes: ['id', 'content', 'createdAt'],
          include: {
            model: Blogger,
            attributes: ['name', 'username'],
          },
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
};

// Delete a blog post
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      return res.status(401).json({ message: 'You must be logged in to delete a post.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const blog = await BlogPost.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blog.authorId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this post.' });
    }
    
    await blog.destroy();
    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// Post a comment on a blog post
exports.postComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a comment.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id;

    const comment = await Comment.create({
      content,
      authorId,
      postId
    });

    const blog = await BlogPost.findByPk(postId);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    await blog.addComment(comment);

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment", error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a comment.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id;
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId !== authorId){
      return res.status(401).json({ message: "You must be logged in to delete your comment});
    }

    // Delete the comment
    await comment.destroy();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};


// Edit an existing blog post
exports.editBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, private } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "You must be logged in to edit a post." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const blog = await BlogPost.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    if (blog.authorId !== userId) {
      return res.status(403).json({ message: "You are not authorized to edit this post." });
    }

    // Update the blog post
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.private = private !== undefined ? private : blog.private;

    const updatedBlog = await blog.save();
    res.status(200).json({ message: "Blog post updated successfully!", blog: updatedBlog });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Failed to update blog post" });
  }
};
