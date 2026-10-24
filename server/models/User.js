const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  globalRole: {
    type: String,
    enum: ['volunteer', 'organizer', 'sub-manager', 'admin'],
    default: 'volunteer'
  },
  avatarUrl: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isBlocked: { type: Boolean, default: false },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('name')
  .get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  })
  .set(function(fullName) {
    if (fullName) {
      const parts = fullName.trim().split(' ');
      this.firstName = parts[0] || '';
      this.lastName = parts.slice(1).join(' ') || parts[0];
    }
  });

userSchema.virtual('password')
  .set(function(pw) {
    this._plainPassword = pw;
  });

userSchema.virtual('isEmailVerified')
  .get(function() {
    return this.emailVerified;
  })
  .set(function(val) {
    this.emailVerified = val;
  });

userSchema.pre('validate', async function() {
  if (this._plainPassword) {
    this.passwordHash = await bcrypt.hash(this._plainPassword, 10);
  } else if (!this.passwordHash && this.password) {
    this.passwordHash = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
