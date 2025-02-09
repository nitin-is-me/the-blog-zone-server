const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Blogger = require("./Blogger");

const BlogPost = sequelize.define("BlogPost", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

// Associations
Blogger.hasMany(BlogPost, { foreignKey: "authorId", onDelete: "CASCADE" });
BlogPost.belongsTo(Blogger, { foreignKey: "authorId" });

module.exports = BlogPost;