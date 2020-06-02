const express = require('express');
const {
  getConversations,
  getMessagesFromConversation,
  postPrivateMessage
} = require('../controllers/messageController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Get conversations list
router.route('/').post(protect, postPrivateMessage);
router.route('/conversations').get(protect, getConversations);
router.route('/conversations/query').get(protect, getMessagesFromConversation);

module.exports = router;
