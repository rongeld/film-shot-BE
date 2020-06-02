const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().sort('-createdAt');

  res.status(200).json({
    status: 'success',
    totalElements: users.length,
    data: users
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('posts');

  res.status(200).json({
    status: 'success',
    data: user
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updatePassword',
        400
      )
    );
  }

  //2) updateuserDoc
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'age',
    'gender',
    'country',
    'photo',
    'profileCover',
    'camera',
    'interests',
    'about'
  ); // filter unwanted fields
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// DO NOT CHANGE PASSWORDS WITH THIS
// const deleteUser = deleteOne(User);
// const updateUser = updateOne(User);

module.exports = {
  getAllUsers,
  updateMe,
  deleteMe,
  // deleteUser,
  // updateUser,
  getUser
};
