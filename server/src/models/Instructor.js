import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Password hashes are stored, never plaintext passwords.
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
      default: 'instructor',
      enum: ['instructor', 'superadmin']
    },

    // Sensitive fields are excluded from normal queries.
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
  { timestamps: true }
);

export const Instructor = mongoose.model('Instructor', instructorSchema);