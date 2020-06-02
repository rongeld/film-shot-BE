const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      unique: false,
      maxLength: [40, 'First name must have less than 40 characters'],
      minLegnth: [1, 'First name must have more than 1 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      unique: false,
      maxLength: [40, 'Last name must have less than 40 characters'],
      minLegnth: [1, 'Last name must have more than 1 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Email address is required'],
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    about: String,
    camera: String,
    interests: String,
    gender: {
      type: String,
      enum: ['man', 'woman'],
      required: [true, 'Gender is required']
    },
    photo: {
      type: String,
      default: 'default-user-pic.jpg'
    },
    profileCover: {
      type: String,
      default: 'profile-banner.jpg'
    },
    age: {
      type: String,
      enum: ['kid', 'adult'],
      required: [true, 'Age is required']
    },
    country: {
      type: String,
      enum: ['PL', 'UA'],
      required: [true, 'Country is required']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLegnth: 8,
      select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    timestamps: { createdAt: true, updatedAt: true }
  }
);

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'author',
  localField: '_id'
});

userSchema.pre('save', async function() {
  // Only run this function ifpassword was acually modified
  if (!this.isModified('password')) return;

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delere passwordconfirm field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function() {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
