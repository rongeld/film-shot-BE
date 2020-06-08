const Comment = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { deleteOne, updateOne } = require('./handlerFactory');

const getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find();

  res.status(200).json({
    status: 'success',
    totalElements: comments.length,
    data: comments
  });
});

const getComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: comment
  });
});

const createComment = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user.id;
  const newComment = await Comment.create(req.body);
  const populatedComment = await newComment
    .populate('user', 'firstName lastName photo')
    .execPopulate();
  res.status(201).json({
    status: 'success',
    data: populatedComment
  });
});

const deleteComment = deleteOne(Comment);
const updateComment = updateOne(Comment);

module.exports = {
  getAllComments,
  getComment,
  createComment,
  deleteComment,
  updateComment
};
