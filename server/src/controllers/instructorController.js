import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Instructor } from '../models/Instructor.js';

// Login input must contain two ordinary strings.
// Objects containing MongoDB operators are rejected.
const loginSchema = Joi.object({
  username: Joi.string().trim().min(1).max(100).required(),
  password: Joi.string().min(1).max(128).required()
}).unknown(false);

// Only the name parameter is allowed in instructor search.
// Parameters such as role[$ne] and $where are not accepted.
const searchSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100)
}).unknown(true);

// Only return information intended to be public.
function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role
  };
}

// POST /api/instructors/login
export async function loginInstructor(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      convert: false
    });

    if (error) {
      return res.status(400).json({
        message: 'Invalid login input'
      });
    }

    const { username, password } = value;

    // Password is normally hidden, so explicitly select it here.
    const instructor = await Instructor.findOne({
      username
    }).select('+password');

    if (!instructor) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Compare the submitted password with its bcrypt hash.
    const passwordMatches = await bcrypt.compare(
      password,
      instructor.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    return res.json({
      instructor: publicProfile(instructor)
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/instructors
export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();

    return res.json({ instructors });
  } catch (err) {
    next(err);
  }
}

// GET /api/instructors/search
export async function searchInstructors(req, res, next) {
  try {
    const { error, value } = searchSchema.validate(req.query, {
      abortEarly: false,
      convert: false
    });

    if (error) {
      return res.status(400).json({
        message: 'Invalid search parameters'
      });
    }

    // Only the approved name field can affect the database query.
    const filter = {};

    if (value.name) {
      const safeName = value.name.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.name = {
        $regex: safeName,
        $options: 'i'
      };
    }

    const instructors = await Instructor.find(filter)
      .select('name department role')
      .sort({ name: 1 })
      .lean();

    return res.json({
      count: instructors.length,
      instructors
    });
  } catch (err) {
    next(err);
  }
}