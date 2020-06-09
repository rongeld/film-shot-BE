const express = require('express');
const {
  getAllPosts,
  createPost,
  deletePost,
  likePost,
  unLikePost
} = require('../controllers/postController');
const { protect } = require('../controllers/authController');
const { uploadPhoto, resizePhoto } = require('../middleware/file-upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getAllPosts)
  .post(protect, uploadPhoto, resizePhoto, createPost);

router.route('/like/:id').post(protect, likePost);
router.route('/unlike/:id').post(protect, unLikePost);

router.route('/:id').delete(protect, deletePost);

module.exports = router;
