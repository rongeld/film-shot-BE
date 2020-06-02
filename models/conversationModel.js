const mongoose = require('mongoose');

const conversationModel = new mongoose.Schema(
  {
    recipients: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: String
  },
  { timestamps: true }
);

const Conversation = mongoose.model('conversation', conversationModel);

module.exports = Conversation;
