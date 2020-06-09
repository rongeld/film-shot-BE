const fs = require('fs');
const Post = require('../models/postModel');
const APIfunctionality = require('../utils/APIfunctionality');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const { deleteOne, updateOne } = require('./handlerFactory');

const getAllPosts = catchAsync(async (req, res, next) => {
  const postAPI = new APIfunctionality(
    Post.find().populate('comments'),
    req.query
  )
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

const likePost = catchAsync(async (req, res, next) => {
  const postToLike = await Post.findById(req.params.id);

  if (
    postToLike.likes.filter(like => like.user.toString() === req.user.id)
      .length > 0
  ) {
    return next(new AppError('User already liked this post', 400));
  }
  postToLike.likes.push({ user: req.user.id });

  const like = await postToLike.save();
  res.status(201).json({
    status: 'success',
    data: like
  });
});

const unLikePost = catchAsync(async (req, res, next) => {
  const postToLike = await Post.findById(req.params.id);

  if (
    postToLike.likes.filter(like => like.user.toString() === req.user.id)
      .length === 0
  ) {
    return next(new AppError('You have not yet liked this post', 400));
  }
  const removeIndex = postToLike.likes
    .map(item => item.user.toString())
    .indexOf(req.user.id);

  postToLike.likes.splice(removeIndex, 1);

  await postToLike.save();
  res.status(201).json({
    status: 'success',
    data: postToLike
  });
});

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
  deletePost,
  likePost,
  unLikePost
};
