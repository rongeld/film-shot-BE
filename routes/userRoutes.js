const express = require('express');

const {
  getAllUsers,
  updateMe,
  deleteMe,
  getUser
} = require('../controllers/userController');
const { uploadPhoto, resizePhoto } = require('../middleware/file-upload');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  // updatePassword,
  protect
  // restrictedTo
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMe', protect, uploadPhoto, resizePhoto, updateMe);

// router.patch('/updateMyPassword', protect, updatePassword);

router.delete('/deleteMe', protect, deleteMe);

router.get('/', protect, getAllUsers);

router.route('/:id').get(protect, getUser);

module.exports = router;
