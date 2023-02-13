// user.js
const mongoose = require("mongoose")
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
})

postSchema.index({ title: 'text', content: 'text', author: 'text'});

const Post = mongoose.model("Post", postSchema)
module.exports = Post