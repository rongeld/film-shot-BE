const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

aws.config.update({
  secretAccessKey: process.env.AWS_ACCESS_KEY_ID,
  accessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'filmshot',
    key: function(req, file, cb) {
      cb(null, `${new Date().toISOString()}-${file.originalname}`);
    }
  }),
  fileFilter: multerFilter
});

const uploadPhoto = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'profileCover', maxCount: 1 }
]);

const resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.files.photo && !req.files.profileCover) return next();

  if (req.files.photo) {
    req.body.photo = req.files.photo[0].key;
  }

  if (req.files.profileCover) {
    req.body.profileCover = req.files.profileCover[0].key;
  }

  next();
});

module.exports = {
  uploadPhoto,
  resizePhoto
};
