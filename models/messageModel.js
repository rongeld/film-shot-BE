const mongoose = require('mongoose');

const messageModel = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation'
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    body: {
      type: String,
      required: [true, 'Message can not be empty']
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model('message', messageModel);

module.exports = Message;
