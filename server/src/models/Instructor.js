import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    department: {
      type: String
    },
    role: {
      type: String,
      enum: ['instructor', 'superadmin'],
      default: 'instructor'
    },
    apiKey: {
      type: String,
      select: false
    },
    privateEmail: {
      type: String,
      select: false
    },
    privatePhone: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent hashing an already-hashed password.
async function hashPassword(doc) {
  if (!doc.password) return;

  const alreadyHashed = /^\$2[aby]\$\d{2}\$/.test(doc.password);

  if (!alreadyHashed) {
    doc.password = await bcrypt.hash(doc.password, 12);
  }
}

// Hash passwords when using save() or create().
instructorSchema.pre('save', async function () {
  if (this.isModified('password')) {
    await hashPassword(this);
  }
});

// Also hash passwords when using insertMany().
instructorSchema.pre('insertMany', function (next, docs) {
  Promise.all(docs.map(hashPassword))
    .then(() => next())
    .catch(next);
});

export const Instructor = mongoose.model(
  'Instructor',
  instructorSchema
);