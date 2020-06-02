const express = require('express');
const {
  getAllPosts,
  createPost,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../controllers/authController');
const { uploadPhoto, resizePhoto } = require('../middleware/file-upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getAllPosts)
  .post(protect, uploadPhoto, resizePhoto, createPost);

router.route('/:id').delete(protect, deletePost);

module.exports = router;
