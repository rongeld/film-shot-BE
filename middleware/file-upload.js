const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadPhoto = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'profileCover', maxCount: 1 }
]);

const resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.files.photo && !req.files.profileCover) return next();

  if (req.files.photo) {
    req.body.photo = `${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.files.photo[0].buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 70 })
      .toFile(`uploads/images/${req.body.photo}`);
  }

  if (req.files.profileCover) {
    req.body.profileCover = `${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.files.profileCover[0].buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(`uploads/images/${req.body.profileCover}`);
  }

  next();
});

module.exports = {
  uploadPhoto,
  resizePhoto
};
