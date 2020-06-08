const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      trim: true,
      required: [true, 'Review cannot be empty'],
      maxLength: [100, 'Review must have less than 100 characters']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'Comment must belong to the post']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to the user']
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

commentSchema.pre(/^(find|create)/, function() {
  this.populate({
    path: 'user',
    select: 'firstName lastName photo'
  });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
