const express = require('express');
const {
  getAllComments,
  getComment,
  createComment,
  deleteComment,
  updateComment
} = require('../controllers/commentsController');

const { protect } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getAllComments)
  .post(protect, createComment);

router
  .route('/:id')
  .get(protect, getComment)
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
