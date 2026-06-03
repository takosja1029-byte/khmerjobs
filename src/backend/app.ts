import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// In-memory data definitions (at the top)
const mockSavedJobs: any[] = [];
const initialCompanies = [
  {
    id: 'aba',
    name: 'ABA Bank',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ABA_Bank_Logo.svg/512px-ABA_Bank_Logo.svg.png',
    industry: 'Banking & Finance',
    website: 'https://www.ababank.com',
    size: '5,000+ employees',
    founded: '1996',
    location: 'Phnom Penh, Cambodia',
    description: 'ABA Bank is Cambodia\'s leading private commercial bank with the largest network of branches and self-service kiosks. We are committed to providing the best digital banking experience to all Cambodians.',
    benefits: ['Competitive Salary', 'Performance Bonus', 'Health Insurance', 'Retirement Plan', 'Professional Development'],
  },
  {
    id: 'grab',
    name: 'Grab',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Grab_logo.svg/512px-Grab_logo.svg.png',
    industry: 'Technology / Super-app',
    website: 'https://www.grab.com',
    size: '10,000+ employees',
    founded: '2012',
    location: 'Southeast Asia',
    description: 'Grab is Southeast Asia\'s leading super-app that provides everyday services such as ride-hailing, food delivery, and digital payments to millions of users across the region.',
    benefits: ['Flexible Working', 'Stunning Offices', 'Grab Credits', 'Medical Coverage', 'Stock Options'],
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png',
    industry: 'Fast Moving Consumer Goods (FMCG)',
    website: 'https://www.coca-cola.com',
    size: '700,000+ employees (Global)',
    founded: '1886',
    location: 'Global',
    description: 'The Coca-Cola Company is a total beverage company, offering over 500 brands in more than 200 countries and territories. In Cambodia, we are a major employer and distribution leader.',
    benefits: ['Global Career Paths', 'Wellness Programs', 'Corporate Discounts', 'Training and Mentorship', 'Social Events'],
  },
  {
    id: 'prudential',
    name: 'Prudential',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Prudential_PLC_logo.svg/512px-Prudential_PLC_logo.svg.png',
    industry: 'Insurance & Financial Services',
    website: 'https://www.prudential.com.kh',
    size: '1,000+ employees (Local)',
    founded: '1848',
    location: 'Phnom Penh, Cambodia',
    description: 'Prudential Cambodia is part of Prudential plc, providing life insurance and financial solutions. We help people get the most out of life by protecting their health and wealth.',
    benefits: ['Performance Incentive', 'Staff Insurance', 'Annual Leave', 'Team Building', 'Modern Workspace'],
  },
  {
    id: 'soma-software',
    name: 'Soma Software',
    logo: 'https://logo.clearbit.com/soma.com.kh?size=200',
    industry: 'Technology',
    website: 'https://www.soma.com.kh',
    size: '50-200 employees',
    founded: '2015',
    location: 'Phnom Penh, Cambodia',
    description: 'Soma Software is a leading tech firm in Cambodia specializing in digital transformation and custom software development for enterprises.',
    benefits: ['Growth Opportunities', 'Tech Allowance', 'Free Lunch', 'Annual Retreat'],
  },
  {
    id: 'vattanac-bank',
    name: 'Vattanac Bank',
    logo: 'https://logo.clearbit.com/vattanacbank.com?size=200',
    industry: 'Banking',
    website: 'https://www.vattanacbank.com',
    size: '1,000+ employees',
    founded: '2002',
    location: 'Phnom Penh, Cambodia',
    description: 'Vattanac Bank is a leading local bank in Cambodia known for its service excellence and commitment to the community.',
    benefits: ['Bonus Program', 'Insurance Coverage', 'Training'],
  },
  {
    id: 'smart-axiata',
    name: 'Smart Axiata',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Smart_Axiata_Logo.svg/512px-Smart_Axiata_Logo.svg.png',
    industry: 'Telecommunications',
    website: 'https://www.smart.com.kh',
    size: '1,000+ employees',
    founded: '2008',
    location: 'Phnom Penh, Cambodia',
    description: 'Smart Axiata Co., Ltd., Cambodia\'s leading mobile telecommunications operator, currently serves 8 mobile subscribers under the "Smart" brand.',
    benefits: ['Performance Incentive', 'Wellness Program', 'Global Opportunities'],
  },
  {
    id: 'cellcard',
    name: 'Cellcard',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Cellcard_logo.png/512px-Cellcard_logo.png',
    industry: 'Telecommunications',
    website: 'https://www.cellcard.com.kh',
    size: '500-1,000 employees',
    founded: '1997',
    location: 'Phnom Penh, Cambodia',
    description: 'Cellcard is the only 100% Cambodian-owned mobile network operator and has been a cornerstone of the country\'s communications for over two decades.',
    benefits: ['Employee Discounts', 'Health Plans', 'Annual Party'],
  },
  {
    id: 'sabay-digital',
    name: 'Sabay Digital',
    logo: 'https://logo.clearbit.com/sabay.com.kh?size=200',
    industry: 'Digital Media & Entertainment',
    website: 'https://www.sabay.com.kh',
    size: '100-250 employees',
    founded: '2007',
    location: 'Phnom Penh, Cambodia',
    description: 'Sabay Digital is a tech-focused media company in Cambodia, providing news, entertainment, and e-sports content to millions of fans.',
    benefits: ['Creative Workspace', 'Flexible Hours', 'Fun Team Events'],
  },
  {
    id: 'nham24',
    name: 'Nham24',
    logo: 'https://logo.clearbit.com/nham24.com?size=200',
    industry: 'On-demand Delivery',
    website: 'https://www.nham24.com',
    size: '500+ employees',
    founded: '2016',
    location: 'Phnom Penh, Cambodia',
    description: 'Nham24 is Cambodia\'s first and largest super-app for food delivery, grocery shopping, and express shipping.',
    benefits: ['Dynamic Environment', 'Meal Vouchers', 'Transport Support'],
  }
];

const initialJobs = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Soma Software',
    companyId: 'soma-software',
    location: 'Phnom Penh, CM',
    salary: '$2,500 - $4,500',
    type: 'Full-time',
    logo: 'https://logo.clearbit.com/soma.com.kh?size=200',
    category: 'Development',
    postedAt: '2h ago',
    urgent: true,
    description: 'We are looking for a rockstar Frontend Engineer to join our core team. You will be responsible for building smooth user experiences using React and Framer Motion.',
    companySize: '50-200 employees',
    approved: true,
  },
  {
    id: '2',
    title: 'Product Designer (UI/UX)',
    company: 'Vattanac Bank',
    companyId: 'vattanac-bank',
    location: 'Remote (Cambodia)',
    salary: '$1,800 - $3,200',
    type: 'Remote',
    logo: 'https://logo.clearbit.com/vattanacbank.com?size=200',
    category: 'Design',
    postedAt: '5h ago',
    urgent: false,
    description: 'Help us redefine banking in Cambodia. Join our design team to create the most intuitive financial tools in the region.',
    approved: true,
  },
  {
    id: '3',
    title: 'Marketing Manager',
    company: 'Smart Axiata',
    companyId: 'smart-axiata',
    location: 'Phnom Penh',
    salary: '$1,500 - $2,500',
    type: 'Full-time',
    category: 'Marketing',
    postedAt: '1h ago',
    urgent: true,
    description: 'Lead our next-generation marketing campaigns for mobile connectivity. Strong background in digital strategy required.',
    approved: true,
  },
  {
    id: '4',
    title: 'Sales & Distribution Manager',
    company: 'Coca-Cola',
    companyId: 'coca-cola',
    location: 'Phnom Penh',
    salary: '$1,500 - $2,800',
    type: 'Full-time',
    category: 'Sales',
    postedAt: '12h ago',
    urgent: false,
    description: 'Join the world\'s leading beverage company. We are looking for an experienced Sales Manager to lead our distribution network in the Greater Phnom Penh area.',
    companySize: '700,000+ employees (Global)',
    approved: true,
  },
  {
    id: '5',
    title: 'Customer Support Lead',
    company: 'Grab',
    companyId: 'grab',
    location: 'Phnom Penh',
    salary: '$1,200 - $2,000',
    type: 'Full-time',
    category: 'Customer Service',
    postedAt: '1 day ago',
    urgent: false,
    description: 'Love helping people? Join our customer excellence team at Grab. You will be at the forefront of supporting our drivers and passengers.',
    approved: true,
  }
];

// Initialize Firebase Admin
let discoveryLog: string[] = [];
const log = (msg: string) => {
  console.log(msg);
  discoveryLog.push(msg);
};

const configProject = firebaseConfig.projectId;
const envProject = process.env.GOOGLE_CLOUD_PROJECT;

log(`[Firebase] Booting. Config Project: ${configProject}, Env Project: ${envProject}`);

// Strategy: Initialize apps for all potential projects
const initApp = (projectId?: string, name?: string) => {
  try {
    const appName = name || (projectId ? `app-${projectId}` : '[DEFAULT]');
    const existing = admin.apps.find(a => a?.name === appName);
    if (existing) return existing;

    const options: admin.AppOptions = projectId ? { projectId } : {};
    const app = admin.initializeApp(options, appName === '[DEFAULT]' ? undefined : appName);
    log(`[Firebase] Initialized App: ${app.name} (Project: ${app.options.projectId || 'ADC-detected'})`);
    return app;
  } catch (err) {
    log(`[Firebase] Init failure for ${projectId || 'default'}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
};

// Start discovery with fresh state
if (admin.apps.length) {
  for (const app of [...admin.apps!]) {
     try { await app.delete(); } catch(e) {}
  }
}

const defaultApp = initApp(); // Default ADC
if (configProject) initApp(configProject);
if (envProject && envProject !== configProject) initApp(envProject);

const adminApp = admin.app();
const detectedProjectId = adminApp.options.projectId || process.env.GOOGLE_CLOUD_PROJECT;

// Tracking variables for the active database state
// PRIORITIZE configProject if available, as it's more likely to have Firestore enabled
let activeProjectId = configProject || detectedProjectId || 'unknown';
let activeDatabaseId = firebaseConfig.firestoreDatabaseId || '(default)';
let isDbConnected = false;

log(`[Firebase] Initial target: ${activeProjectId}/${activeDatabaseId}`);
// Use default adminApp initially to avoid crashes if named app doesn't exist yet
export let db = getFirestore(adminApp, activeDatabaseId === '(default)' ? undefined : activeDatabaseId);

// Dedicated app for Token Verification
const authAdminApp = admin.apps.find(a => a?.name === 'auth-verify') || 
  admin.initializeApp({
    projectId: firebaseConfig.projectId || adminApp.options.projectId,
  }, 'auth-verify');

// Middleware to ensure DB is ready before handling requests
const ensureDbReady = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await dbInitPromise;
    next();
  } catch (err) {
    log(`[Firebase] DB Initialization block error: ${err}`);
    next(); 
  }
};

// Discovery logic to find the working database at startup
const dbInitPromise = (async () => {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
  
  const pingDatabase = async (dbId: string, projId: string) => {
    try {
      const normalizedDbId = dbId === '(default)' ? undefined : dbId;
      log(`[Firebase] Pinging: ${projId}/${dbId}...`);
      
      const appName = `ping-${projId}-${dbId}`.replace(/[^a-zA-Z0-9]/g, '-');
      const targetApp = admin.apps.find(a => a?.name === appName) || 
        admin.initializeApp({ projectId: projId }, appName);
      
      const testDb = getFirestore(targetApp, normalizedDbId);

      // 1. Read Test
      await Promise.race([
        testDb.collection('jobs').limit(1).get(),
        timeout(4000)
      ]);
      
      // 2. Write Test
      const testDoc = testDb.collection('_health_check').doc('ping');
      await Promise.race([
        testDoc.set({ 
          time: admin.firestore.FieldValue.serverTimestamp(), 
          projId, 
          dbId,
          timestamp: new Date().toISOString()
        }),
        timeout(4000)
      ]);
      await testDoc.delete();

      return { ok: true, instance: testDb };
    } catch (err: any) {
      const msg = err.message || String(err);
      log(`[Firebase] Ping failed for ${projId}/${dbId}: ${msg} (Code: ${err.code})`);
      return { ok: false, error: err.code === 7 ? 'PERMISSION_DENIED' : msg.includes('disabled') ? 'API_DISABLED' : msg };
    }
  };

  log(`[Firebase] Discovery process running...`);

  const candidates: { p: string | undefined, d: string | undefined, name: string }[] = [];
  
  // 0. The exact config from firebase-applet-config.json
  if (configProject && firebaseConfig.firestoreDatabaseId) {
    candidates.push({ p: configProject, d: firebaseConfig.firestoreDatabaseId, name: 'Config Project / Config DB' });
  }

  // 1. Config project / (default)
  if (configProject) {
    candidates.push({ p: configProject, d: '(default)', name: 'Config Project / (default) DB' });
  }

  // 2. Detected ADC project + (default) DB (usually the most reliable in AI Studio)
  if (detectedProjectId && detectedProjectId !== configProject) {
    candidates.push({ p: detectedProjectId, d: '(default)', name: 'ADC Project / (default) DB' });
    candidates.push({ p: detectedProjectId, d: firebaseConfig.firestoreDatabaseId, name: 'ADC Project / Config DB' });
  }

  // 3. Env project + (default) database
  if (envProject && envProject !== configProject && envProject !== detectedProjectId) {
    candidates.push({ p: envProject, d: '(default)', name: 'Env Project / (default) DB' });
  }

  log(`[Firebase] Testing ${candidates.length} connection candidates...`);

  for (const c of candidates) {
    if (!c.p) continue;
    log(`[Firebase] Checking candidate: ${c.name} (${c.p}/${c.d})...`);
    const result = await pingDatabase(c.d!, c.p);
    if (result.ok) {
      db = result.instance!;
      activeProjectId = c.p;
      activeDatabaseId = c.d!;
      isDbConnected = true;
      log(`[Firebase] SUCCESS: Stable connection found via ${c.name} at ${c.p}/${c.d}`);
      
      // Seed initial data if empty
      try {
        const jobsSnap = await db.collection('jobs').limit(1).get();
        if (jobsSnap.empty) {
          log('[Firebase] Database empty. Seeding initial data (jobs & companies)...');
          const batch = db.batch();
          for (const company of initialCompanies) {
            batch.set(db.collection('companies').doc(company.id), company);
          }
          for (const job of initialJobs) {
            batch.set(db.collection('jobs').doc(job.id), {
              ...job,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          await batch.commit();
          log('[Firebase] Database seeded successfully');
        }
      } catch (seedErr) {
        log(`[Firebase] Seeding failed (non-critical): ${seedErr instanceof Error ? seedErr.message : String(seedErr)}`);
      }
      return;
    }
  }

  log('[Firebase] WARNING: Discovery could not find a writable database. Falling back to mock-only mode.');
})();



console.log(`[Firebase] Initialized. Awaiting discovery completion...`);


console.log(`[Firebase] Main app project: ${activeProjectId}`);
console.log(`[Firebase] Auth verify app project: ${firebaseConfig.projectId}`);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  userEmail?: string | null;
  databaseId: string;
  projectId: string;
  discoveryLog: string[];
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null, userEmail?: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    userEmail,
    databaseId: activeDatabaseId,
    projectId: activeProjectId,
    discoveryLog
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
  return errInfo;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const ADMIN_EMAIL = 'takosja1029@gmail.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Email Transporter (Lazy)
let mailTransporter: any = null;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;
  if (!process.env.SMTP_HOST) return null;
  
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return mailTransporter;
}

async function sendEmailApplication(job: any, fullName: string, email: string, file?: Express.Multer.File) {
  const transporter = getMailTransporter();
  const toEmail = `hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com.kh`;

  if (!transporter) {
    console.log('\n--- SIMULATED EMAIL NOTIFICATION ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: New Application for ${job.title}`);
    console.log(`Applicant: ${fullName} <${email}>`);
    if (file) console.log(`Attached CV: ${file.originalname} (${file.size} bytes)`);
    console.log('-------------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"JobConnect Cambodia" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[Job Application] ${job.title} - ${fullName}`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background-color: #e0f2fe; border-radius: 16px; margin-bottom: 16px; text-align: center;">
              <span style="font-size: 28px; line-height: 56px;">💼</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.02em;">New Application Received</h1>
            <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 500;">A candidate has applied to your job listing via KhmerJobs</p>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
            <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #94a3b8; margin: 0 0 16px 0;">Role Details</h2>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 11px; font-weight: 600; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase;">Job Position</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${escapeHtml(job.title)}</p>
            </div>
            <div>
              <p style="font-size: 11px; font-weight: 600; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase;">Company</p>
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${escapeHtml(job.company)}</p>
            </div>
          </div>

          <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
            <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; tracking: 0.1em; color: #94a3b8; margin: 0 0 16px 0;">Candidate Profile</h2>
            <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #64748b; width: 40%;">Full Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">${escapeHtml(fullName)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #64748b;">Email Address</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #3b82f6;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(email)}</a></td>
              </tr>
              ${file ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #64748b;">CV Document</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #10b981;">📄 ${escapeHtml(file.originalname)}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0 0 4px 0;">This notification was triggered via KhmerJobs Platform.</p>
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0; font-weight: 600;">© 2026 KhmerJobs Cambodia. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: file ? [
        {
          filename: file.originalname,
          content: file.buffer,
        }
      ] : []
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, simulated: false };
  }
}

async function sendEmailStatusChange(application: any, job: any, status: string) {
  const transporter = getMailTransporter();
  const toEmail = application.email;

  if (!toEmail) {
    console.log('[Email Simulation] Cannot send status change email: Candidate email is missing.');
    return { success: false, error: 'Candidate email is missing' };
  }

  // Visual configuration based on status
  let themeColor = '#2563eb'; // Default royal blue
  let statusText = 'Updated';
  let icon = '📋';
  let message = `We are keeping you updated on your application status for the position of <strong>${escapeHtml(job.title)}</strong>.`;

  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('review')) {
    themeColor = '#3b82f6';
    statusText = 'Under Review';
    icon = '🔍';
    message = `The recruiting team at <strong>${escapeHtml(job.company)}</strong> is currently reviewing your profile for the <strong>${escapeHtml(job.title)}</strong> position. We will update you as soon as they reach their verdict on the shortlisting phase.`;
  } else if (lowerStatus.includes('shortlist') || lowerStatus.includes('interview')) {
    themeColor = '#7c3aed'; // Lavender/Violet
    statusText = 'Shortlisted';
    icon = '🎉';
    message = `Amazing news! Your application for <strong>${escapeHtml(job.title)}</strong> at <strong>${escapeHtml(job.company)}</strong> has been shortlisted. The hiring manager is eager to schedule an interview with you, and will get in touch shortly with coordinating times.`;
  } else if (lowerStatus.includes('offer') || lowerStatus.includes('accept')) {
    themeColor = '#10b981'; // Green
    statusText = 'Offer Extended';
    icon = '🏆';
    message = `Congratulations! <strong>${escapeHtml(job.company)}</strong> has decided to extend a formal offer to you for the <strong>${escapeHtml(job.title)}</strong> role! Please check your communication channels, as the hiring team will be sending over the details and paperwork.`;
  } else if (lowerStatus.includes('reject') || lowerStatus.includes('decline')) {
    themeColor = '#64748b'; // Slate neutral
    statusText = 'Decided';
    icon = '✉️';
    message = `Thank you for taking the time to apply and interview for the <strong>${escapeHtml(job.title)}</strong> role at <strong>${escapeHtml(job.company)}</strong>. Although your profile is highly impressive, the hiring team has decided to proceed with other candidates whose profiles align more closely with their immediately urgent needs. We sincerely appreciate your effort and wish you immense success in your future roles.`;
  }

  if (!transporter) {
    console.log('\n--- SIMULATED STATUS UPDATE EMAIL ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Application Status Update - ${job.title}`);
    console.log(`Status: ${statusText}`);
    console.log(`Body: Hello ${application.fullName}. ${message.replace(/<[^>]*>/g, '')}`);
    console.log('-------------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"JobConnect Cambodia" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[Application Updated] "${job.title}" at ${job.company}`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background-color: ${themeColor}15; border-radius: 20px; margin: 0 auto 16px auto; color: ${themeColor}; text-align: center;">
              <span style="font-size: 32px; line-height: 64px;">${icon}</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 12px 0 8px 0; letter-spacing: -0.02em;">Application Status Update</h1>
            <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 500;">Your application status at ${escapeHtml(job.company)} has been updated</p>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 20px; padding: 28px; margin-bottom: 24px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);">
            <p style="font-size: 15px; font-weight: 500; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">Hello ${escapeHtml(application.fullName)},</p>
            
            <p style="font-size: 14.5px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
              ${message}
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;">
              <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #94a3b8; padding-bottom: 6px;">COMPANY</td>
                  <td style="font-size: 12px; font-weight: 700; color: #94a3b8; padding-bottom: 6px; text-align: right;">NEW STATUS</td>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 750; color: #0f172a; border: none; padding: 0;">${escapeHtml(job.company)}</td>
                  <td style="text-align: right; border: none; padding: 0;">
                    <span style="display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; background-color: ${themeColor}12; color: ${themeColor}; letter-spacing: 0.05em;">
                      ${statusText}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div style="background-color: #f1f5f9; border-radius: 16px; padding: 16px 20px; text-align: center; margin-bottom: 12px;">
            <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0;">
              Best of luck with your professional journey!
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0 0 4px 0;">This email was sent by KhmerJobs on behalf of ${escapeHtml(job.company)}.</p>
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0; font-weight: 600;">© 2026 KhmerJobs Cambodia. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to send application status change email:', error);
    return { success: false, simulated: false };
  }
}

async function sendEmailJobApproved(job: any) {
  const transporter = getMailTransporter();
  const toEmail = job.postedBy;

  if (!toEmail) {
    console.log('[Email Simulation] Cannot send job approval email: Employer email (postedBy) is missing.');
    return { success: false, error: 'Employer email is missing' };
  }

  if (!transporter) {
    console.log('\n--- SIMULATED EMAIL NOTIFICATION ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Job Listing Approved - ${job.title}`);
    console.log(`Body: Congratulations! Your job listing for "${job.title}" at "${job.company}" has been approved and is now live.`);
    console.log('-------------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"JobConnect Cambodia" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[Job Listing Approved] "${job.title}" at ${job.company}`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 20px; margin: 0 auto 16px auto; text-align: center;">
              <span style="font-size: 32px; line-height: 64px;">✅</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #015f3a; margin: 12px 0 8px 0; letter-spacing: -0.02em;">Job Listing Published!</h1>
            <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 500;">Your position has successfully been approved by the admin team.</p>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 20px; padding: 28px; margin-bottom: 24px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);">
            <p style="font-size: 15px; font-weight: 500; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">Dear Employer,</p>
            
            <p style="font-size: 14.5px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
              We are pleased to inform you that your job listing for the position of <strong>${escapeHtml(job.title)}</strong> at <strong>${escapeHtml(job.company)}</strong> has been audited and approved.
            </p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="font-size: 13.5px; font-weight: 700; color: #16a54a; margin: 0 0 4px 0;">What happens next?</p>
              <p style="font-size: 13px; color: #14532d; margin: 0; line-height: 1.5;">
                Your listing is live on JobConnect Cambodia and visible in matching candidate search fields. You will receive applications directly to your designated inbox as they are submitted.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0 0 4px 0;">This email was sent by KhmerJobs. If you have any inquiries, contact our support.</p>
            <p style="font-size: 11.5px; color: #94a3b8; margin: 0; font-weight: 600;">© 2026 KhmerJobs Cambodia. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to send job approval email:', error);
    return { success: false, simulated: false };
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramApplication(
  message: string, 
  file?: Express.Multer.File
): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('\n--- SIMULATED TELEGRAM NOTIFICATION ---');
    console.log(message.replace(/<[^>]*>/g, '')); // Strip HTML for console
    if (file) {
      console.log(`[File Attachment]: ${file.originalname} (${file.size} bytes)`);
    }
    console.log('----------------------------------------\n');
    return { success: true, simulated: true };
  }

  const chatIDTip = "Tip: You can get your numeric User/Chat ID by messaging @userinfobot or @GetMyChatID_Bot in Telegram.";

  // Pre-flight checks
  const botIdFromToken = TELEGRAM_BOT_TOKEN.split(':')[0];
  const isBotToken = (id: string) => id.includes(':');
  const isNumeric = (id: string) => /^-?\d+$/.test(id);
  const isUsername = (id: string) => id.startsWith('@');

  console.log(`[Telegram] Sending application to Chat ID: ${TELEGRAM_CHAT_ID}`);

  if (isBotToken(TELEGRAM_CHAT_ID)) {
    return { 
      success: false, 
      simulated: false, 
      error: `Configuration Error: TELEGRAM_CHAT_ID looks like a Bot Token. Please provide your personal numeric User/Chat ID instead. ${chatIDTip}` 
    };
  }

  if (TELEGRAM_CHAT_ID === botIdFromToken) {
    return {
      success: false,
      simulated: false,
      error: `Configuration Error: You provided the Bot's own ID as the Chat ID. A bot cannot message itself. Please provide your personal numeric User/Chat ID. ${chatIDTip}`
    };
  }

  if (!isNumeric(TELEGRAM_CHAT_ID) && !isUsername(TELEGRAM_CHAT_ID)) {
    return {
      success: false,
      simulated: false,
      error: `Configuration Error: TELEGRAM_CHAT_ID must be a numeric ID (e.g., 123456789) or a @username. You provided "${TELEGRAM_CHAT_ID}". ${chatIDTip}`
    };
  }

  try {
    if (file) {
      // Send document with caption
      const form = new FormData();
      form.append('chat_id', TELEGRAM_CHAT_ID);
      form.append('document', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      form.append('caption', message);
      form.append('parse_mode', 'HTML');

      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
        form,
        { headers: form.getHeaders() }
      );
    } else {
      // Just send message
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      });
    }
    return { success: true, simulated: false };
  } catch (error: any) {
    const telegramError = error.response?.data?.description || error.message;
    console.error('Telegram API Error:', telegramError);
    
    let userFriendlyError = telegramError;
    const lowError = telegramError.toLowerCase();
    
    if (lowError.includes("can't send messages to the bot")) {
      userFriendlyError = `Invalid Chat ID: You provided a Bot ID or Token instead of a personal User ID. A bot cannot message itself. ${chatIDTip}`;
    } else if (lowError.includes("bot was blocked")) {
      userFriendlyError = "Blocked: Please 'Start' your bot in Telegram first.";
    } else if (lowError.includes("chat not found")) {
      userFriendlyError = `Chat Not Found: The Bot doesn't know you. ${chatIDTip}`;
    }
    
    return { success: false, simulated: false, error: userFriendlyError };
  }
}

const app = express();

app.use(cors({
  origin: true, // Allow all origins in dev for ease of use with previews
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Ensure Firebase is ready before API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await dbInitPromise;
  }
  next();
});

// Debug/Health endpoint
app.get('/api/health', async (req, res) => {
  let testResult = 'not attempted';
  let testError = null;
  let testCode = null;
  
  if (isDbConnected) {
    try {
      await db.collection('jobs').limit(1).get();
      testResult = 'success';
    } catch (err: any) {
      testResult = 'failed';
      testError = err.message;
      testCode = err.code;
    }
  } else {
    testResult = 'skipped (database not connected)';
  }

  res.json({
    status: 'ok',
    firebase: {
      activeProjectId,
      activeDatabaseId,
      isDbConnected,
      envProject: process.env.GOOGLE_CLOUD_PROJECT || 'not set',
      apps: admin.apps.map(a => ({ name: a?.name || 'default', project: a?.options.projectId })),
      discoveryLog,
      test: {
        result: testResult,
        error: testError,
        code: testCode,
        targeting: `projects/${activeProjectId}/databases/${activeDatabaseId}`
      }
    }
  });
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (e) {
    // Invalid token
  }
  next();
};

// Firebase Auth Sync
app.post('/api/auth/firebase-sync', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'No token provided' });

  try {
    const decodedToken = await authAdminApp.auth().verifyIdToken(idToken);
    const { name, email, picture } = decodedToken;

    const token = jwt.sign({ name: name || 'User', email, picture }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`Auth sync successful for ${email}. Custom JWT issued.`);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.json({ success: true, user: { name, email, picture } });
  } catch (error: any) {
    console.error('Firebase token verification failed:', error.message);
    if (error.code === 'auth/argument-error') {
      console.error('Token/Project ID mismatch. Token audience:', jwt.decode(req.body.idToken));
    }
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/profile', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, picture } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const updatedUser = {
    ...req.user,
    name: name.trim(),
    picture: picture || req.user.picture
  };

  const { iat, exp, ...jwtPayload } = updatedUser;

  try {
    // Sign and set a new auth_token with the updated profile name and picture
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    if (isDbConnected) {
      await db.collection('users').doc(req.user.email).set({
        name: name.trim(),
        picture: picture || null
      }, { merge: true });
    }
    
    res.json({ 
      success: true, 
      user: { 
        name: updatedUser.name, 
        email: updatedUser.email, 
        picture: updatedUser.picture 
      } 
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/jobs/saved', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to view saved jobs' });
  }
  try {
    if (!isDbConnected) {
      log('[Firebase] Saved jobs: Retrieving from in-memory mock Saved Jobs');
      const savedJobIds = mockSavedJobs
        .filter(sj => sj.userEmail === req.user.email)
        .map(sj => sj.jobId);
      const savedJobsList = [...mockJobs, ...initialJobs]
        .filter(j => savedJobIds.includes(j.id));
      return res.json(savedJobsList);
    }
    const savedJobsSnap = await db.collection('saved_jobs')
      .where('userEmail', '==', req.user.email)
      .get();
    
    const savedJobIds = savedJobsSnap.docs.map(doc => doc.data().jobId);
    if (savedJobIds.length === 0) return res.json([]);

    const jobsSnap = await db.collection('jobs')
      .get(); // Since we have few jobs, fetch all and filter in memory or chunk if needed. 
               // Firestore 'in' query limited to 30 items.
    
    const savedJobsList = jobsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((job: any) => savedJobIds.includes(job.id));
    
    res.json(savedJobsList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

app.post('/api/jobs/:id/save', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to save jobs' });
  }
  const { id } = req.params;
  const userEmail = req.user.email;

  if (!isDbConnected) {
    const exists = mockSavedJobs.some(sj => sj.userEmail === userEmail && sj.jobId === id);
    if (!exists) {
      mockSavedJobs.push({ userEmail, jobId: id });
    }
    const savedIds = mockSavedJobs
      .filter(sj => sj.userEmail === userEmail)
      .map(sj => sj.jobId);
    return res.status(200).json({ success: true, savedIds });
  }
  
  try {
    const docId = `${userEmail}_${id}`.replace(/[^a-zA-Z0-9]/g, '_');
    await db.collection('saved_jobs').doc(docId).set({
      userEmail,
      jobId: id,
      createdAt: FieldValue.serverTimestamp()
    });
    
    const savedJobsSnap = await db.collection('saved_jobs')
      .where('userEmail', '==', userEmail)
      .get();
    const savedIds = savedJobsSnap.docs.map(doc => doc.data().jobId);
    
    res.json({ success: true, savedIds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.post('/api/jobs/:id/unsave', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to unsave jobs' });
  }
  const { id } = req.params;
  const userEmail = req.user.email;
  
  if (!isDbConnected) {
    const idx = mockSavedJobs.findIndex(sj => sj.userEmail === userEmail && sj.jobId === id);
    if (idx !== -1) {
      mockSavedJobs.splice(idx, 1);
    }
    const savedIds = mockSavedJobs
      .filter(sj => sj.userEmail === userEmail)
      .map(sj => sj.jobId);
    return res.status(200).json({ success: true, savedIds });
  }

  try {
    const docId = `${userEmail}_${id}`.replace(/[^a-zA-Z0-9]/g, '_');
    await db.collection('saved_jobs').doc(docId).delete();
    
    const savedJobsSnap = await db.collection('saved_jobs')
      .where('userEmail', '==', userEmail)
      .get();
    const savedIds = savedJobsSnap.docs.map(doc => doc.data().jobId);
    
    res.json({ success: true, savedIds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsave job' });
  }
});

app.get('/api/alerts', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;
  
  if (!isDbConnected) {
    log('[Firebase] Alerts: Falling back to empty (mock mode)');
    return res.json([]);
  }

  try {
    const alertsSnap = await db.collection('job_alerts')
      .where('userEmail', '==', userEmail)
      .get();
    
    const alerts = alertsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // For matchCount, we'd ideally run queries or have a worker.
    // For demo, we fetch all jobs and count.
    const jobsSnap = await db.collection('jobs').get();
    const allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    const enrichedAlerts = alerts.map((alert: any) => {
      const matches = allJobs.filter(job => {
        const f = alert.filters;
        const matchesCategory = f.category === 'All' || job.category === f.category;
        const matchesSearch = !f.searchTerm || 
          job.title.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(f.searchTerm.toLowerCase());
        const matchesType = f.types.length === 0 || f.types.includes(job.type);
        
        let matchesSalary = true;
        if (f.salaryRange !== 'Any Salary') {
          const salaryVal = parseInt(job.salary.replace(/[^0-9]/g, ''));
          if (f.salaryRange === '$500 - $1,000') matchesSalary = salaryVal >= 500 && salaryVal <= 1000;
          else if (f.salaryRange === '$1,000 - $2,000') matchesSalary = salaryVal >= 1000 && salaryVal <= 2000;
          else if (f.salaryRange === '$2,000 - $3,000') matchesSalary = salaryVal >= 2000 && salaryVal <= 3000;
          else if (f.salaryRange === '$3,000+') matchesSalary = salaryVal >= 3000;
        }

        return matchesCategory && matchesSearch && matchesType && matchesSalary;
      });

      return {
        ...alert,
        matchCount: matches.length
      };
    });

    res.json(enrichedAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.post('/api/alerts', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, filters } = req.body;
  const userEmail = req.user.email;
  
  const id = Math.random().toString(36).substr(2, 9);
  const newAlert = {
    id,
    userEmail,
    name: name || 'Job Alert',
    filters,
    createdAt: new Date().toISOString(),
    lastChecked: new Date().toISOString()
  };

  if (!isDbConnected) {
    log('[Firebase] POST /api/alerts: Simulating success (mock mode)');
    return res.json(newAlert);
  }

  try {
    await db.collection('job_alerts').doc(id).set(newAlert);
    res.json(newAlert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

app.put('/api/alerts/:id', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { name, filters } = req.body;
  const userEmail = req.user.email;
  
  if (!isDbConnected) {
    return res.json({ success: true, id, name, filters });
  }

  try {
    const alertRef = db.collection('job_alerts').doc(id);
    const alertDoc = await alertRef.get();
    
    if (!alertDoc.exists || alertDoc.data()?.userEmail !== userEmail) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    if (name) updates.name = name;
    if (filters) updates.filters = filters;

    await alertRef.update(updates);
    res.json({ ...alertDoc.data(), ...updates, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

app.delete('/api/alerts/:id', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const userEmail = req.user.email;
  
  if (!isDbConnected) {
    return res.json({ success: true });
  }

  try {
    const alertRef = db.collection('job_alerts').doc(id);
    const alertDoc = await alertRef.get();
    
    if (!alertDoc.exists || alertDoc.data()?.userEmail !== userEmail) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alertRef.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

app.get('/api/jobs', authenticate, ensureDbReady, async (req: any, res) => {
  try {
    const isAdminUser = req.user && req.user.email === ADMIN_EMAIL;

    if (!isDbConnected) {
      log('[Firebase] Falling back to mock data for jobs listing');
      const finalJobs = [...mockJobs, ...initialJobs];
      const filtered = isAdminUser 
        ? finalJobs 
        : finalJobs.filter(job => job.approved === true);
      return res.json(filtered);
    }

    const jobsSnap = await db.collection('jobs').orderBy('createdAt', 'desc').get();
    const jobsList = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    const finalJobs = jobsList.length > 0 ? jobsList : [...mockJobs, ...initialJobs];
    
    // Admin sees all, non-admin sees only approved
    const filtered = isAdminUser 
      ? finalJobs 
      : finalJobs.filter(job => job.approved === true);

    res.json(filtered);
  } catch (error) {
    log(`[Firebase] Fetch error, falling back to mock: ${error}`);
    const isAdminUser = req.user && req.user.email === ADMIN_EMAIL;
    const finalJobs = [...mockJobs, ...initialJobs];
    const filtered = isAdminUser 
      ? finalJobs 
      : finalJobs.filter(job => job.approved === true);
    res.json(filtered);
  }
});

app.get('/api/companies/:id', ensureDbReady, async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConnected) {
      const company = initialCompanies.find(c => c.id === id);
      if (company) return res.json(company);
      return res.status(404).json({ error: 'Company not found (mock mode)' });
    }
    const companyDoc = await db.collection('companies').doc(id).get();
    if (companyDoc.exists) {
      return res.json({ id: companyDoc.id, ...companyDoc.data() });
    }
    
    // Search by name if ID not found directly (legacy support)
    const companySnap = await db.collection('companies').where('name', '==', id).get();
    if (!companySnap.empty) {
      const doc = companySnap.docs[0];
      return res.json({ id: doc.id, ...doc.data() });
    }

    const mockCompany = initialCompanies.find(c => c.id === id);
    if (mockCompany) return res.json(mockCompany);

    res.status(404).json({ error: 'Company not found' });
  } catch (error) {
    const mockCompany = initialCompanies.find(c => c.id === id);
    if (mockCompany) return res.json(mockCompany);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.get('/api/companies/mine', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;

  if (!isDbConnected) {
    const profile = mockUserCompanies[userEmail] || null;
    return res.json(profile);
  }

  try {
    const docId = `owner-${userEmail}`;
    const companyDoc = await db.collection('companies').doc(docId).get();
    if (companyDoc.exists) {
      return res.json({ id: companyDoc.id, ...companyDoc.data() });
    }
    return res.json(null);
  } catch (err) {
    console.error('Failed to fetch personal company profile', err);
    res.status(500).json({ error: 'Failed to fetch personal company profile' });
  }
});

app.post('/api/companies/mine', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;
  const { name, logo, industry, website, size, founded, location, description, benefits } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Company Name is required' });
  }

  const generatedId = `company-${userEmail.split('@')[0]}`;
  const companyData = {
    id: req.body.id || generatedId,
    name: name.trim(),
    logo: logo || '',
    industry: industry || '',
    website: website || '',
    size: size || '',
    founded: founded || '',
    location: location || '',
    description: description || '',
    benefits: Array.isArray(benefits) ? benefits : [],
    ownerEmail: userEmail,
    updatedAt: new Date().toISOString()
  };

  if (!isDbConnected) {
    mockUserCompanies[userEmail] = companyData;
    return res.json({ success: true, company: companyData });
  }

  try {
    const docId = `owner-${userEmail}`;
    await db.collection('companies').doc(docId).set(companyData, { merge: true });
    res.json({ success: true, company: companyData });
  } catch (err) {
    console.error('Failed to save company profile', err);
    res.status(500).json({ error: 'Failed to save company profile' });
  }
});

app.post('/api/jobs', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to post a job' });
  }

  const isPostedByAdmin = req.user.email === ADMIN_EMAIL;

  // Handle mock mode
  if (!isDbConnected) {
    log('[Firebase] POST /api/jobs: Database not connected. Simulating success with mock data.');
    const id = 'mock-' + Math.random().toString(36).substr(2, 9);
    const mockJob = {
      ...req.body,
      id,
      postedBy: req.user.email,
      postedAt: 'Just now',
      createdAt: new Date().toISOString(),
      companyId: req.body.companyId || (req.body.company ? req.body.company.toLowerCase().replace(/\s+/g, '-') : 'unknown'),
      approved: isPostedByAdmin, // Approved if admin, false otherwise
    };
    mockJobs.push(mockJob);
    return res.status(201).json(mockJob);
  }

  // Safety check: ensure we use the most up-to-date db instance
  const currentDb = db;
  
  try {
    const id = Math.random().toString(36).substr(2, 9);
    
    console.log(`[Firestore] Attempting POST /api/jobs`);
    console.log(`[Firestore] Active Project ID: ${activeProjectId}`);
    console.log(`[Firestore] Active Database ID: ${activeDatabaseId}`);
    
    const jobData = {
      ...req.body,
      id,
      postedBy: req.user.email,
      postedAt: 'Just now',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      companyId: req.body.companyId || (req.body.company ? req.body.company.toLowerCase().replace(/\s+/g, '-') : 'unknown'),
      approved: isPostedByAdmin, // Approved if admin, false otherwise
    };

    console.log(`[Firestore] Payload ready. Targeting: projects/${activeProjectId}/databases/${activeDatabaseId}/documents/jobs/${id}`);
    await currentDb.collection('jobs').doc(id).set(jobData);
    console.log(`[Firestore] Job ${id} posted successfully`);
    res.status(201).json(jobData);
  } catch (error) {
    const errorDetails = handleFirestoreError(error, OperationType.WRITE, `jobs`, req.user?.email);
    console.error(`[Firestore] POST /api/jobs failed:`, error);
    res.status(500).json({ 
      error: 'Failed to post job listing to database',
      details: errorDetails
    });
  }
});

// Edit Job Listing API
app.put('/api/jobs/:id', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to edit a job' });
  }

  const { id } = req.params;
  const isUserAdmin = req.user.email === ADMIN_EMAIL;

  try {
    let job: any = null;
    if (!isDbConnected) {
      job = mockJobs.find(j => j.id === id) || initialJobs.find(j => j.id === id);
    } else {
      const doc = await db.collection('jobs').doc(id).get();
      if (doc.exists) {
        job = doc.data();
      } else {
        job = initialJobs.find(j => j.id === id);
      }
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.postedBy === req.user.email;
    const isApprovedAndOwner = isOwner && job.approved === true;

    if (!isUserAdmin && !isApprovedAndOwner) {
      return res.status(403).json({ error: 'You are not authorized to edit this job. Employers can only edit after approval.' });
    }

    const updatedFields = {
      title: req.body.title || job.title,
      company: req.body.company || job.company,
      location: req.body.location || job.location,
      type: req.body.type || job.type,
      salary: req.body.salary || job.salary,
      category: req.body.category || job.category,
      description: req.body.description || job.description,
      logo: req.body.logo !== undefined ? req.body.logo : job.logo,
      urgent: req.body.urgent !== undefined ? req.body.urgent : job.urgent,
      updatedAt: isDbConnected ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (!isDbConnected) {
      const mockIdx = mockJobs.findIndex(j => j.id === id);
      if (mockIdx !== -1) {
        mockJobs[mockIdx] = { ...mockJobs[mockIdx], ...updatedFields };
      }
      const initialIdx = initialJobs.findIndex(j => j.id === id);
      if (initialIdx !== -1) {
        initialJobs[initialIdx] = { ...initialJobs[initialIdx], ...updatedFields };
      }
    } else {
      await db.collection('jobs').doc(id).set({
        ...job,
        ...updatedFields
      }, { merge: true });
    }

    res.json({ success: true, message: 'Job updated successfully', job: { ...job, ...updatedFields } });
  } catch (error) {
    console.error('Failed to edit job:', error);
    res.status(500).json({ error: 'Internal server error while editing job' });
  }
});

// Delete Job Listing API
app.delete('/api/jobs/:id', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to delete a job' });
  }

  const { id } = req.params;
  const isUserAdmin = req.user.email === ADMIN_EMAIL;

  try {
    let job: any = null;
    if (!isDbConnected) {
      job = mockJobs.find(j => j.id === id) || initialJobs.find(j => j.id === id);
    } else {
      const doc = await db.collection('jobs').doc(id).get();
      if (doc.exists) {
        job = doc.data();
      } else {
        job = initialJobs.find(j => j.id === id);
      }
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.postedBy === req.user.email;
    const isApprovedAndOwner = isOwner && job.approved === true;

    if (!isUserAdmin && !isApprovedAndOwner) {
      return res.status(403).json({ error: 'You are not authorized to delete this job. Employers can only delete after approval.' });
    }

    const mockIdx = mockJobs.findIndex(j => j.id === id);
    if (mockIdx !== -1) mockJobs.splice(mockIdx, 1);

    const seedIdx = initialJobs.findIndex(j => j.id === id);
    if (seedIdx !== -1) initialJobs.splice(seedIdx, 1);

    if (isDbConnected) {
      await db.collection('jobs').doc(id).delete();
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Failed to delete job:', error);
    res.status(500).json({ error: 'Internal server error while deleting job' });
  }
});


// In-memory array for documents in mock mode
const mockDocuments: any[] = [];
const mockApplications: any[] = [];
const mockJobs: any[] = [];
const mockUserCompanies: Record<string, any> = {};

app.get('/api/documents', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;
  
  if (!isDbConnected) {
    log('[Firebase] Documents: Falling back to in-memory mock mode');
    const userDocs = mockDocuments.filter(d => d.userEmail === userEmail);
    // Return document metadata list without the heavy binary content field
    return res.json(userDocs.map(({ content, ...meta }) => meta));
  }

  try {
    const docsSnap = await db.collection('documents')
      .where('userEmail', '==', userEmail)
      .get();
    
    // Return document metadata list without the heavy raw content buffer
    const docs = docsSnap.docs.map(doc => {
      const { content, ...meta } = doc.data();
      return { id: doc.id, ...meta };
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', authenticate, ensureDbReady, (req: any, res: any, next: any) => {
  upload.single('cv')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file provided' });

  const id = Math.random().toString(36).substr(2, 9);
  const createdAt = new Date().toISOString();

  if (!isDbConnected) {
    const newMockDoc = {
      id,
      userEmail,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      content: file.buffer,
      createdAt
    };
    mockDocuments.push(newMockDoc);
    return res.status(201).json({
      id,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      createdAt
    });
  }

  try {
    const docData = {
      id,
      userEmail,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      content: file.buffer, // Store as buffer
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('documents').doc(id).set(docData);
    res.status(201).json({
      id,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save document' });
  }
});

app.delete('/api/documents/:id', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  
  if (!isDbConnected) {
    const index = mockDocuments.findIndex(d => d.id === id && d.userEmail === req.user.email);
    if (index !== -1) {
      mockDocuments.splice(index, 1);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const docRef = db.collection('documents').doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists && docSnap.data()?.userEmail === req.user.email) {
      await docRef.delete();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

app.post('/api/jobs/:id/apply', authenticate, ensureDbReady, (req: any, res: any, next: any) => {
  // If cvId is present, we don't need a file upload
  if (req.body.cvId) {
    return next();
  }
  upload.single('cv')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to apply for this job' });
  }

  try {
    const { id } = req.params;
    const { fullName, email, cvId, saveCv } = req.body;
    let cvFile = req.file;

    // Use saved CV if ID provided
    if (cvId && !cvFile) {
      if (isDbConnected) {
        const docSnap = await db.collection('documents').doc(cvId).get();
        if (docSnap.exists && docSnap.data()?.userEmail === req.user.email) {
          const data = docSnap.data();
          cvFile = {
            buffer: data?.content,
            originalname: data?.name,
            mimetype: data?.mimetype,
            size: data?.size
          } as any;
        }
      } else {
        const mockDoc = mockDocuments.find(d => d.id === cvId && d.userEmail === req.user.email);
        if (mockDoc) {
          cvFile = {
            buffer: mockDoc.content,
            originalname: mockDoc.name,
            mimetype: mockDoc.mimetype,
            size: mockDoc.size
          } as any;
        }
      }
    }

    // Save CV for future use if requested
    if (saveCv === 'true' && cvFile && !cvId) {
      const docId = Math.random().toString(36).substr(2, 9);
      if (isDbConnected) {
        try {
          await db.collection('documents').doc(docId).set({
            id: docId,
            userEmail: req.user.email,
            name: cvFile.originalname,
            size: cvFile.size,
            mimetype: cvFile.mimetype,
            content: cvFile.buffer,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          log(`[Firebase] Saved new CV to documents: ${docId}`);
        } catch (saveErr) {
          console.error('Failed to save CV to documents', saveErr);
        }
      } else {
        mockDocuments.push({
          id: docId,
          userEmail: req.user.email,
          name: cvFile.originalname,
          size: cvFile.size,
          mimetype: cvFile.mimetype,
          content: cvFile.buffer,
          createdAt: new Date().toISOString()
        });
        log(`[Firebase] Saved new CV to in-memory documents: ${docId}`);
      }
    }

    let job: any = null;
    if (isDbConnected) {
      const jobDoc = await db.collection('jobs').doc(id).get();
      if (!jobDoc.exists) {
        return res.status(404).json({ error: 'Job not found' });
      }
      job = jobDoc.data();
    } else {
      job = mockJobs.find(j => j.id === id) || initialJobs.find(j => j.id === id);
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full Name and Email are required.' });
    }

    if (!cvFile) {
      return res.status(400).json({ error: 'Please upload your CV in PDF format.' });
    }

    const emailResult = await sendEmailApplication(job, fullName, email, cvFile);
    const message = `
<b>🚀 New Job Application!</b>

<b>Job:</b> ${escapeHtml(job.title)}
<b>Company:</b> ${escapeHtml(job.company)}

<b>Applicant Details:</b>
<b>Name:</b> ${escapeHtml(fullName)}
<b>Email:</b> ${escapeHtml(email)}
<b>File:</b> ${escapeHtml(cvFile.originalname)}

<i>Sent from JobConnect Cambodia</i>
  `;

    const telegramResult = await sendTelegramApplication(message, cvFile);
    const isSimulated = emailResult.simulated && telegramResult.simulated;
    let isSuccess = false;
    if (isSimulated) {
      isSuccess = true;
    } else {
      const telegramOk = telegramResult.simulated || telegramResult.success;
      const emailOk = emailResult.simulated || emailResult.success;
      isSuccess = telegramOk && emailOk;
    }

    let statusMessage = 'Application processed!';
    if (isSimulated) {
      statusMessage = 'Application Simulated! Set API keys in Settings to go live.';
    } else if (!isSuccess) {
      const parts = [];
      if (!emailResult.simulated && !emailResult.success) parts.push('Email failed');
      if (!telegramResult.simulated && !telegramResult.success) {
        parts.push(`Telegram Error: ${telegramResult.error || 'Unknown'}`);
      }
      statusMessage = parts.join(' & ') || 'Application delivery failed.';
    } else {
      const active = [];
      if (!emailResult.simulated) active.push('Email');
      if (!telegramResult.simulated) active.push('Telegram');
      statusMessage = `Application sent via ${active.join(' & ')}!`;
    }

    // Save application to Firestore
    if (isDbConnected) {
      try {
        await db.collection('applications').add({
          jobId: id,
          fullName,
          email,
          cvName: cvFile.originalname,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          delivered: {
            email: emailResult.success || emailResult.simulated,
            telegram: telegramResult.success || telegramResult.simulated
          }
        });
      } catch (dbErr) {
        log(`[Firebase] Failed to save application record: ${dbErr}`);
      }
    } else {
      log('[Firebase] Application processed (mock mode). Saving in-memory.');
      mockApplications.push({
        id: 'mock-app-' + Math.random().toString(36).substr(2, 9),
        jobId: id,
        fullName,
        email, // This is matching the applicant's email
        cvName: cvFile.originalname,
        status: 'pending',
        createdAt: new Date().toISOString(),
        delivered: {
          email: emailResult.success || emailResult.simulated,
          telegram: telegramResult.success || telegramResult.simulated
        }
      });
    }

    res.status(isSuccess ? 200 : 500).json({ 
      success: isSuccess, 
      simulated: isSimulated,
      message: statusMessage
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Internal server error processing application' });
  }
});

app.post('/api/auth/signup', ensureDbReady, async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!isDbConnected) {
    log(`[Firebase] Signup: Simulating signup for ${email} (mock mode)`);
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.status(201).json({ user: { name, email } });
  }

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (userDoc.exists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    await db.collection('users').doc(email).set({
      name,
      email,
      password, // In a real app, hash this!
      createdAt: FieldValue.serverTimestamp()
    });
    
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(201).json({ user: { name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/signin', ensureDbReady, async (req, res) => {
  const { email, password } = req.body;

  if (!isDbConnected) {
    log(`[Firebase] Signin: Simulating success for ${email} (mock mode)`);
    const token = jwt.sign({ name: email.split('@')[0], email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json({ user: { name: email.split('@')[0], email } });
  }

  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Account not found. Please sign up first.' });
    }
    
    const user = userDoc.data();
    if (user?.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    
    const token = jwt.sign({ name: user?.name, email: user?.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ user: { name: user?.name, email: user?.email } });
  } catch (error) {
    res.status(500).json({ error: 'Signin failed' });
  }
});

app.get('/api/auth/google/url', (req, res) => {
  const redirectUri = `${APP_URL}/auth/google/callback`.replace('http://localhost:3000', req.headers.origin || 'http://localhost:3000');
  
  if (!GOOGLE_CLIENT_ID) {
     return res.json({ 
       url: `/auth/demo-callback?name=Demo%20User&email=demo@example.com` 
     });
  }

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    redirect_uri: redirectUri,
    prompt: 'select_account',
  });
  res.json({ url });
});

app.get(['/auth/google/callback', '/auth/google/callback/'], async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${APP_URL}/auth/google/callback`.replace('http://localhost:3000', req.headers.origin || 'http://localhost:3000');

  try {
    const { tokens } = await client.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const user = {
      name: payload?.name,
      email: payload?.email,
      picture: payload?.picture,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Auth error', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/auth/demo-callback', (req, res) => {
  const user = {
    name: req.query.name as string || 'Demo User',
    email: req.query.email as string || 'demo@example.com',
    picture: 'https://i.pravatar.cc/150?u=demo',
  };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.send(`
    <html>
      <body>
        <script>
          window.opener.postMessage({ type: 'AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
          window.close();
        </script>
      </body>
    </html>
  `);
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Dashboard Endpoints
app.get('/api/applications', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;

  if (!isDbConnected) {
    const apps = mockApplications.filter(a => a.email === userEmail);
    const enriched = apps.map(app => ({
      ...app,
      job: mockJobs.find(j => j.id === app.jobId) || initialJobs.find(j => j.id === app.jobId)
    }));
    return res.json(enriched);
  }

  try {
    const applicationsSnap = await db.collection('applications')
      .where('email', '==', userEmail)
      .get();
    
    const apps = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Enrich with job data
    const jobsSnap = await db.collection('jobs').get();
    const allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const enrichedApps = apps.map((app: any) => ({
      ...app,
      job: allJobs.find((j: any) => j.id === app.jobId) || initialJobs.find(j => j.id === app.jobId)
    }));

    res.json(enrichedApps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/jobs/posted', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;

  if (!isDbConnected) {
    const userJobs = mockJobs.filter(j => j.postedBy === userEmail);
    return res.json(userJobs);
  }

  try {
    const jobsSnap = await db.collection('jobs')
      .where('postedBy', '==', userEmail)
      .get();
    
    const jobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posted jobs' });
  }
});

app.get('/api/applications/received', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userEmail = req.user.email;

  if (!isDbConnected) {
    const userJobIds = mockJobs.filter(j => j.postedBy === userEmail).map(j => j.id);
    const apps = mockApplications.filter(a => userJobIds.includes(a.jobId));
    const enriched = apps.map(app => ({
      ...app,
      job: mockJobs.find(j => j.id === app.jobId) || initialJobs.find(j => j.id === app.jobId)
    }));
    return res.json(enriched);
  }

  try {
    // 1. Get user's jobs
    const jobsSnap = await db.collection('jobs')
      .where('postedBy', '==', userEmail)
      .get();
    
    const jobIds = jobsSnap.docs.map(doc => doc.id);
    if (jobIds.length === 0) return res.json([]);

    // 2. Get applications for these jobs
    // Note: 'in' query supports up to 30 items. 
    const applicationsSnap = await db.collection('applications')
      .where('jobId', 'in', jobIds.slice(0, 30)) 
      .get();
    
    const apps = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const enrichedApps = apps.map((app: any) => ({
      ...app,
      job: allJobs.find((j: any) => j.id === app.jobId)
    }));

    res.json(enrichedApps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch received applications' });
  }
});

app.patch('/api/applications/:id/status', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status } = req.body;

  if (!isDbConnected) {
    const mockApp = mockApplications.find(a => a.id === id);
    if (mockApp) {
      mockApp.status = status;
      const job = mockJobs.find(j => j.id === mockApp.jobId) || initialJobs.find(j => j.id === mockApp.jobId);
      if (job) {
        await sendEmailStatusChange(mockApp, job, status);
      }
    }
    return res.json({ success: true, id, status });
  }

  try {
    const appRef = db.collection('applications').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const jobDoc = await db.collection('jobs').doc(appDoc.data()?.jobId).get();
    if (!jobDoc.exists || jobDoc.data()?.postedBy !== req.user.email) {
      return res.status(403).json({ error: 'You are not authorized to update this application status' });
    }

    await appRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const jobData = jobDoc.data();
    const appData = appDoc.data();
    if (appData && jobData) {
      const appWithApplicant = {
        fullName: appData.fullName || appData.applicantName || 'Applicant',
        email: appData.email || appData.applicantEmail || ''
      };
      await sendEmailStatusChange(appWithApplicant, jobData, status);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Admin Jobs Operations (Approvals & Rejections)
app.post('/api/admin/jobs/:id/approve', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }

  const { id } = req.params;

  try {
    if (!isDbConnected) {
      const job = mockJobs.find(j => j.id === id) || initialJobs.find(j => j.id === id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      job.approved = true;
      await sendEmailJobApproved(job);
      return res.json({ success: true, message: 'Job approved successfully in mock mode' });
    }

    const jobRef = db.collection('jobs').doc(id);
    const doc = await jobRef.get();

    if (!doc.exists) {
      // If it exists in initial jobs seed but not yet written to Firestore, we write it now
      const seedJob = initialJobs.find(j => j.id === id);
      if (seedJob) {
        await jobRef.set({
          ...seedJob,
          approved: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await sendEmailJobApproved({ ...seedJob, approved: true });
        return res.json({ success: true, message: 'Seed job written and approved in Firestore' });
      }
      return res.status(404).json({ error: 'Job not found in database' });
    }

    await jobRef.update({ approved: true });
    const updatedJob = doc.data();
    await sendEmailJobApproved({ ...updatedJob, id, approved: true });
    res.json({ success: true, message: 'Job approved successfully' });
  } catch (error) {
    console.error('Failed to approve job:', error);
    res.status(500).json({ error: 'Internal server error while approving job' });
  }
});

app.delete('/api/admin/jobs/:id/reject', authenticate, ensureDbReady, async (req: any, res) => {
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }

  const { id } = req.params;

  try {
    // Sync memory lists
    const mockIdx = mockJobs.findIndex(j => j.id === id);
    if (mockIdx !== -1) mockJobs.splice(mockIdx, 1);

    const seedIdx = initialJobs.findIndex(j => j.id === id);
    if (seedIdx !== -1) initialJobs.splice(seedIdx, 1);

    if (!isDbConnected) {
      return res.json({ success: true, message: 'Job listings rejected and removed in mock mode' });
    }

    const jobRef = db.collection('jobs').doc(id);
    await jobRef.delete();
    res.json({ success: true, message: 'Job listing deleted/rejected' });
  } catch (error) {
    console.error('Failed to reject/delete job:', error);
    res.status(500).json({ error: 'Internal server error while rejecting job' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ success: true });
});

export default app;
