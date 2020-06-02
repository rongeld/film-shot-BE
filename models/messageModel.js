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
      // required: [true, 'Message must have a recipient']
    },
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
      // required: [true, 'Message must belong to User']
    },
    body: {
      type: String,
      required: [true, 'Message can not be empty']
    }
  },
  { timestamps: true }
);

// messageModel.pre(/^find/, function() {
//   this.populate({
//     path: 'sender',
//     select: 'firstName lastName photo'
//   });
// });

const Message = mongoose.model('message', messageModel);

module.exports = Message;
