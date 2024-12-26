const BlogPost = require('../models/BlogPost');
const jwt = require("jsonwebtoken");
const Comment = require('../models/Comment');
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
    const newPost = new BlogPost({
      title,
      content,
      author: authorId,
      private
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
    const blogs = await BlogPost.find({private: false})
      .populate('author', 'username name') // Populate author with username and name
      .sort({ createdAt: -1 }); // Sort by latest posts

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

exports.getPrivateBlogs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a post.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const privatePosts = await BlogPost.find({ author: userId, private: true })
    .populate('author', 'username name')
    .sort({ createdAt: -1 });
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

    // Fetching the blog post along with its populated comments (content, author, etc.)
    const blog = await BlogPost.findById(id)
      .populate('author', 'username name')
      .populate({
        path: 'comments', 
        select: 'content createdAt', 
        populate: { path: 'author', select: 'name username' } 
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

exports.postComment = async(req, res)=>{
  const {postId} = req.params;
  const {content} = req.body;

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to create a comment.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const authorId = decoded.id; // The user id, needed for creating comment (author is object id)
    const comment = await Comment.create({
      content,
      author: authorId,
      post: postId
    });

    await BlogPost.findByIdAndUpdate(postId,{
      $push:{comments: comment._id}
    });

    res.status(201).json(comment)
  } catch(error){
    res.status(500).json({ message: 'Failed to add comment', error });
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Delete the comment from the Comment collection
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the BlogPost collection to remove the deleted comment reference
    await BlogPost.updateOne(
      { comments: commentId }, // Find the blog post that contains this comment
      { $pull: { comments: commentId } } // Remove the comment ID from the blog post's comments array
    );

    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error deleting comment", error);
    res.status(500).send("Error deleting comment");
  }
};