const BlogPost = require('../models/BlogPost');
const jwt = require("jsonwebtoken");
// Create a new blog post
exports.postBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Extracting user info from the jwt
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a post.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id; // The user id, needed for creating post (author is object id)

    // Creating a new blog post with the author's ID
    const newPost = new BlogPost({
      title,
      content,
      author: authorId, 
    });

    const savedPost = await newPost.save();
    res.status(201).json({
      message: 'Blog post created successfully!',
      blog: savedPost,
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
};

// Fetching all blog posts
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .populate('author', 'username name') // Populate author with username and name
      .sort({ createdAt: -1 }); // Sort by latest posts

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// Fetching a single blog post by its ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await BlogPost.findById(id).populate('author', 'username name');
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
};

exports.deleteBlog = async (req, res) =>{
  try{
    const {id} = req.params;
    const blog = await BlogPost.findByIdAndDelete(id);
    res.status(200).send("Deleted successfully")
  } catch(error){
    console.error("Error deleting post:", error);
    res.status(500).json({message: "Failed to delete post"});
  }
}