const mongoose = require('mongoose');

const postModel = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to User']
    },
    photo: String,
    description: {
      type: String,
      required: [true, 'Post must have a description'],
      maxLength: [40, 'Description must be less than 200 characters'],
      minLegnth: [5, 'Description must have more than 5 characters']
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    timestamps: { createdAt: true, updatedAt: true }
  }
);

postModel.pre(/^find/, function() {
  this.populate({
    path: 'author',
    select: 'firstName lastName photo'
  });
});

const Post = mongoose.model('Post', postModel);

module.exports = Post;
