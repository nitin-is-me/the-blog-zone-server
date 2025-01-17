const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Blogger = require("./Blogger");
const BlogPost = require("./BlogPost");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Associations
Blogger.hasMany(Comment, { foreignKey: "authorId", onDelete: "CASCADE" });
Comment.belongsTo(Blogger, { foreignKey: "authorId" });

BlogPost.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(BlogPost, { foreignKey: "postId" });

module.exports = Comment;