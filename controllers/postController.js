const fs = require('fs');
const Post = require('../models/postModel');
const APIfunctionality = require('../utils/APIfunctionality');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const { deleteOne, updateOne } = require('./handlerFactory');

const getAllPosts = catchAsync(async (req, res, next) => {
  const postAPI = new APIfunctionality(Post.find(), req.query)
    .filter()
    .sort()
    .fields();
  // .pagination();
  const posts = await postAPI.query;

  res.status(200).json({
    status: 'success',
    totalElements: posts.length,
    data: posts
  });
});

const createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newPost
  });
});

// const updateTour = updateOne(Tour);
// const updateTour = catchAsync(async (req, res, next) => {
//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!updatedTour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: updatedTour
//     }
//   });
// });

const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  const imagePath = post.photo;

  if (req.user.role !== 'admin' && req.user.id !== post.author.id) {
    return next(new AppError('You can not delete this post', 403));
  }

  fs.unlink(imagePath, err => console.log(err));

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  res.status(202).json({
    status: 'success',
    data: 'Post deleted'
  });
});

module.exports = {
  getAllPosts,
  createPost,
  deletePost
};
