const User = require('../models/User');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const jobTitles = [
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer', 
  'Full Stack Developer',
  'Data Analyst',
  'UI/UX Designer',
  'DevOps Engineer',
  'Product Manager',
  'QA Engineer',
  'Data Scientist'
];

const locations = [
  'Bangalore',
  'Hyderabad', 
  'Mumbai',
  'Delhi',
  'Pune',
  'Chennai',
  'Remote',
  'Noida',
  'Gurugram',
  'Ahmedabad'
];

const skills = [
  'React', 'Node.js', 'MongoDB', 'Python', 'Java',
  'AWS', 'Docker', 'JavaScript', 'TypeScript', 'SQL',
  'Git', 'Agile', 'Figma', 'PostgreSQL', 'Redis'
];

const descriptions = [
  'Develop responsive web applications using modern frameworks.',
  'Build scalable backend services with Node.js and databases.',
  'Design intuitive user interfaces and user experiences.',
  'Analyze data to provide actionable business insights.',
  'Manage CI/CD pipelines and infrastructure as code.',
  'Lead product development and coordinate cross-functional teams.'
];

const experiences = ['fresher', '0-1', '1-3', '3-5', '5-10'];

const jobTypes = ['full-time', 'part-time', 'contract', 'remote', 'internship'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSalary = () => ({
  min: Math.floor(Math.random() * 20 + 3) * 100000, // 3L-23L
  max: Math.floor(Math.random() * 25 + 8) * 100000, // 8L-33L
  currency: 'INR'
});

const getRandomDate = () => {
  const days = Math.floor(Math.random() * 30);
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const createDefaultAdmin = async () => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('Default admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin123', 10);
  const admin = new User({
    name: 'Admin',
    email: 'admin@gmail.com',
    mobile: '9999999999',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('Default admin created: admin@gmail.com / Admin123');
};

const seedJobs = async () => {
  const jobCount = await Job.countDocuments();
  if (jobCount > 0) {
    console.log(`Database already has ${jobCount} jobs, skipping seed`);
    return;
  }

  console.log('Seeding jobs...');
  const jobs = [];

  for (let i = 0; i < 3000; i++) {
    const job = {
      title: getRandomElement(jobTitles),
      description: getRandomElement(descriptions),
      companyName: `Company ${Math.floor(Math.random() * 1000)}`,
      location: getRandomElement(locations),
      salary: getRandomSalary(),
      jobType: getRandomElement(jobTypes),
      experience: getRandomElement(experiences),
      skills: Array.from({ length: Math.floor(Math.random() * 4 + 2) }, () => getRandomElement(skills)),
      vacancies: Math.floor(Math.random() * 5 + 1),
      status: 'approved',
      featured: Math.random() > 0.95,
      source: 'internal',
      createdAt: getRandomDate(),
      updatedAt: getRandomDate()
    };

    jobs.push(job);
  }

  // Batch insert
  const batchSize = 500;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    await Job.insertMany(batch);
  }

  console.log(`Inserted ${jobs.length} jobs`);
};

const seedDatabase = async () => {
  try {
    await createDefaultAdmin();
    await seedJobs();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = { seedDatabase, createDefaultAdmin, seedJobs };

