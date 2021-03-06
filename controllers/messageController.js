const mongoose = require('mongoose');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const socketsObj = require('../app');

// Get conversations list
const getConversations = catchAsync(async (req, res, next) => {
  const from = mongoose.Types.ObjectId(req.user.id);
  const conversations = await Conversation.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'recipients',
        foreignField: '_id',
        as: 'recipientObj'
      }
    },

    { $sort: { updatedAt: -1 } }
  ])
    .match({ recipients: { $all: [{ $elemMatch: { $eq: from } }] } })
    .project({
      'recipientObj.password': 0,
      'recipientObj.__v': 0,
      'recipientObj.date': 0
    });

  res.status(200).json({
    status: 'success',
    data: conversations
  });
});

const getMessagesFromConversation = catchAsync(async (req, res, next) => {
  const user1 = mongoose.Types.ObjectId(req.user.id);
  const user2 = mongoose.Types.ObjectId(req.query.userId);
  let matchObj;

  if (req.query.messages) {
    matchObj = {
      $and: [{ isRead: false }, { to: user1 }]
    };
  } else {
    matchObj = {
      $or: [
        { $and: [{ to: user1 }, { from: user2 }] },
        { $and: [{ to: user2 }, { from: user1 }] }
      ]
    };
  }
  if (req.query.userId) {
    await Message.updateMany({ to: user1 }, { isRead: true });
  }

  const messages = await Message.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'to',
        foreignField: '_id',
        as: 'toObj'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'from',
        foreignField: '_id',
        as: 'senderInfo'
      }
    }
  ])
    .match(matchObj)
    .project({
      'toObj.password': 0,
      'toObj.__v': 0,
      'toObj.date': 0,
      'fromObj.password': 0,
      'fromObj.__v': 0,
      'fromObj.date': 0
    });

  res.status(200).json({
    status: 'success',
    data: messages
  });
});

const postPrivateMessage = catchAsync(async (req, res, next) => {
  const from = mongoose.Types.ObjectId(req.user.id);
  const to = mongoose.Types.ObjectId(req.body.to);
  Conversation.findOneAndUpdate(
    {
      recipients: {
        $all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }]
      }
    },
    {
      recipients: [from, to],
      lastMessage: req.body.body,
      date: Date.now()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
    async function(err, conversation) {
      if (err) {
        return next(new AppError('Error', 400));
      }
      const message = new Message({
        conversation: conversation._id,
        to,
        from,
        body: req.body.body,
        isRead: false
      });
      const messageData = {
        conversation: message.conversation,
        to: message.to,
        from: message.from,
        body: message.body,
        senderInfo: {
          photo: req.user.photo,
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      };
      req.io.to(req.socketsObj[req.body.to]).emit('messages', messageData);
      req.io.to(req.socketsObj[req.user.id]).emit('messages', messageData);

      await message.save();

      res.status(200).json({
        status: 'success',
        data: conversation._id
      });
    }
  );
});

module.exports = {
  getConversations,
  getMessagesFromConversation,
  postPrivateMessage
};
