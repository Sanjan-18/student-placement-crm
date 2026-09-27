const { PrismaClient, Role, PlacementStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const students = [
  ['Aarav Sharma', 'aarav.sharma.demo@example.com', 'DEMO001', 'Computer Science and Engineering', 2027, 8.7],
  ['Ananya Rao', 'ananya.rao.demo@example.com', 'DEMO002', 'Information Science and Engineering', 2027, 8.9],
  ['Rohan Kumar', 'rohan.kumar.demo@example.com', 'DEMO003', 'Electronics and Communication Engineering', 2027, 8.1],
  ['Diya Nair', 'diya.nair.demo@example.com', 'DEMO004', 'Computer Science and Engineering', 2027, 9.1],
  ['Vivek Reddy', 'vivek.reddy.demo@example.com', 'DEMO005', 'Artificial Intelligence and Machine Learning', 2027, 8.4],
  ['Meera Iyer', 'meera.iyer.demo@example.com', 'DEMO006', 'Information Science and Engineering', 2027, 8.6],
  ['Arjun Menon', 'arjun.menon.demo@example.com', 'DEMO007', 'Mechanical Engineering', 2027, 7.8],
  ['Kavya Patel', 'kavya.patel.demo@example.com', 'DEMO008', 'Computer Science and Engineering', 2027, 9.0],
  ['Aditya Singh', 'aditya.singh.demo@example.com', 'DEMO009', 'Electronics and Communication Engineering', 2027, 8.2],
  ['Sneha Joshi', 'sneha.joshi.demo@example.com', 'DEMO010', 'Artificial Intelligence and Machine Learning', 2027, 8.8],
];

const companies = [
  ['TechNova Solutions', 'https://example.com/technova', 'Software & IT', 'Bengaluru', 'Campus hiring partner for software engineering roles.', 'Priya Menon', 'priya@technova.example.com'],
  ['CloudPeak Systems', 'https://example.com/cloudpeak', 'Cloud Computing', 'Hyderabad', 'Cloud infrastructure and platform engineering company.', 'Rahul Verma', 'rahul@cloudpeak.example.com'],
  ['DataSphere Analytics', 'https://example.com/datasphere', 'Data & Analytics', 'Bengaluru', 'Data engineering and analytics solutions.', 'Neha Kapoor', 'neha@datasphere.example.com'],
  ['FinEdge Technologies', 'https://example.com/finedge', 'FinTech', 'Pune', 'Technology products for financial services.', 'Amit Shah', 'amit@finedge.example.com'],
  ['NextGen Digital', 'https://example.com/nextgen', 'Digital Services', 'Chennai', 'Digital transformation and enterprise applications.', 'Divya Krishnan', 'divya@nextgen.example.com'],
  ['SecureStack Labs', 'https://example.com/securestack', 'Cybersecurity', 'Bengaluru', 'Application and cloud security solutions.', 'Karan Bhat', 'karan@securestack.example.com'],
  ['AutoCore Mobility', 'https://example.com/autocore', 'Automotive Technology', 'Chennai', 'Connected mobility and automotive software.', 'Sanjay Rao', 'sanjay@autocore.example.com'],
  ['HealthByte Technologies', 'https://example.com/healthbyte', 'HealthTech', 'Hyderabad', 'Healthcare software and data platforms.', 'Ishita Roy', 'ishita@healthbyte.example.com'],
  ['BrightWorks Consulting', 'https://example.com/brightworks', 'Consulting', 'Mumbai', 'Technology consulting and implementation services.', 'Manish Gupta', 'manish@brightworks.example.com'],
  ['PixelForge Innovations', 'https://example.com/pixelforge', 'Product Technology', 'Bengaluru', 'Consumer and enterprise product engineering.', 'Nikhil Das', 'nikhil@pixelforge.example.com'],
];

const drives = [
  ['Software Engineer', 'Full-stack product engineering role.', 9.5, 'Bengaluru', 7.5],
  ['Cloud Engineer', 'Cloud platform and DevOps role.', 8.0, 'Hyderabad', 7.0],
  ['Data Analyst', 'Analytics and business intelligence role.', 7.2, 'Bengaluru', 7.0],
  ['Backend Developer', 'API and distributed systems role.', 10.0, 'Pune', 7.5],
  ['Frontend Developer', 'React and modern web application role.', 7.5, 'Chennai', 7.0],
  ['Security Engineer', 'Application security and threat analysis role.', 8.5, 'Bengaluru', 7.2],
  ['Embedded Software Engineer', 'Embedded and automotive software role.', 7.8, 'Chennai', 7.0],
  ['Software Developer', 'Healthcare platform development role.', 6.8, 'Hyderabad', 6.8],
  ['Technology Consultant', 'Technology consulting graduate role.', 7.0, 'Mumbai', 7.0],
  ['Product Engineer', 'Product engineering and full-stack role.', 9.0, 'Bengaluru', 7.5],
];

async function upsertStudent([name, email, usn, department, graduationYear, cgpa]) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: Role.STUDENT },
    create: { name, email, role: Role.STUDENT },
  });

  await prisma.student.upsert({
    where: { userId: user.id },
    update: { usn, department, graduationYear, cgpa, placementStatus: PlacementStatus.NOT_PLACED },
    create: { userId: user.id, usn, department, graduationYear, cgpa, placementStatus: PlacementStatus.NOT_PLACED },
  });
}

async function upsertCompany([name, website, industry, location, description, recruiter, recruiterEmail]) {
  const existing = await prisma.company.findFirst({ where: { name } });
  const data = { name, website, industry, location, description, recruiter, recruiterEmail };
  if (existing) return prisma.company.update({ where: { id: existing.id }, data });
  return prisma.company.create({ data });
}

async function upsertDrive(company, [role, description, packageLpa, location, minCgpa]) {
  const existing = await prisma.placementDrive.findFirst({ where: { companyId: company.id, role } });
  const now = new Date();
  const data = {
    companyId: company.id,
    role,
    description,
    location,
    packageLpa,
    driveDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    applicationDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    minCgpa,
    allowedDepartments: 'Computer Science and Engineering,Information Science and Engineering,Electronics and Communication Engineering,Artificial Intelligence and Machine Learning,Mechanical Engineering',
    graduationYear: 2027,
    maxBacklogs: 0,
    status: 'ACTIVE',
  };
  if (existing) return prisma.placementDrive.update({ where: { id: existing.id }, data });
  return prisma.placementDrive.create({ data });
}

async function main() {
  for (const student of students) await upsertStudent(student);

  const createdCompanies = [];
  for (const company of companies) createdCompanies.push(await upsertCompany(company));

  for (let i = 0; i < drives.length; i++) await upsertDrive(createdCompanies[i], drives[i]);

  console.log('Seed complete: 10 students, 10 companies, 10 placement drives.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
