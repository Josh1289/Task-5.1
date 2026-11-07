import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB } from '../config/db.js';
import { Instructor } from '../models/Instructor.js';

// Instructor seed data.
// Passwords are hashed before they are stored in MongoDB.
const instructors = [
  {
    name: 'Prof. Alice Smith',
    username: 'prof.smith',
    password: 'password123',
    department: 'CS',
    role: 'instructor',
    privateEmail: 'alice.smith@university.edu',
    privatePhone: '+1-555-0101'
  },
  {
    name: 'Prof. Brian Jones',
    username: 'prof.jones',
    password: 'mathRules!',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'brian.jones@university.edu',
    privatePhone: '+1-555-0102'
  },
  {
    name: 'Prof. Chen Lee',
    username: 'prof.lee',
    password: 'linalg2024',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'chen.lee@university.edu',
    privatePhone: '+1-555-0103'
  },
  {
    name: 'Portal Administrator',
    username: 'admin',
    password: 'S3cr3t-Admin-Pw!',
    department: 'IT',
    role: 'superadmin',
    apiKey: 'REPLACE_WITH_A_NEW_SECRET_API_KEY',
    privateEmail: 'root@university.edu',
    privatePhone: '+1-555-0000'
  }
];

async function run() {
  try {
    await connectDB();

    // Remove existing instructor records.
    await Instructor.deleteMany({});

    // Hash every password before inserting the records.
    const instructorsWithHashedPasswords = await Promise.all(
      instructors.map(async (instructor) => ({
        ...instructor,
        password: await bcrypt.hash(instructor.password, 12)
      }))
    );

    const created = await Instructor.insertMany(
      instructorsWithHashedPasswords
    );

    console.log(`Seeded ${created.length} instructor(s):`);

    for (const instructor of created) {
      console.log(`- ${instructor.username} (${instructor.role})`);
    }

    console.log('Instructor seeding completed.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();