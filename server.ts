import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { INITIAL_USER, INITIAL_JOBS, INITIAL_NOTIFICATIONS, INITIAL_EARNINGS_SUMMARY } from './src/data/mockData';
import { Job, UserProfile, Application, AppNotification, EarningsSummary, EarningRecord } from './src/types';
import { matchJobsWithWorkerProfile } from './src/services/geminiMatcher';

dotenv.config();

// In-memory data store with live state synchronization
let currentUser: UserProfile = { ...INITIAL_USER };
let jobsStore: Job[] = [...INITIAL_JOBS];
let applicationsStore: Application[] = [];
let notificationsStore: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let earningsSummaryStore: EarningsSummary = { ...INITIAL_EARNINGS_SUMMARY };

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // API ROUTE 1: GET /api/jobs/nearby
  // Accepts: lat, lng, radius_km, category, query, urgentOnly
  // Returns: List of jobs sorted by proximity
  // =========================================================================
  app.get('/api/jobs/nearby', (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || currentUser.lat || 13.0827;
      const lng = parseFloat(req.query.lng as string) || currentUser.lng || 80.2707;
      const radiusKm = parseFloat(req.query.radius_km as string) || 10;
      const category = (req.query.category as string) || 'All';
      const search = ((req.query.search as string) || '').toLowerCase().trim();
      const urgentOnly = req.query.urgent === 'true';

      let filtered = jobsStore.map((job) => {
        const dist = calculateHaversineDistanceKm(lat, lng, job.location_lat, job.location_lng);
        return {
          ...job,
          distance_km: dist,
        };
      });

      // Filter by radius (unless Remote)
      filtered = filtered.filter((job) => {
        if (category === 'Remote Part-Time' || job.tags.includes('Remote')) return true;
        return (job.distance_km ?? 0) <= radiusKm;
      });

      // Filter by category
      if (category && category !== 'All') {
        filtered = filtered.filter((j) => j.category.toLowerCase() === category.toLowerCase());
      }

      // Filter by urgency
      if (urgentOnly) {
        filtered = filtered.filter((j) => j.is_urgent);
      }

      // Filter by search query
      if (search) {
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(search) ||
            j.description.toLowerCase().includes(search) ||
            j.category.toLowerCase().includes(search) ||
            j.tags.some((t) => t.toLowerCase().includes(search)) ||
            j.employer_name.toLowerCase().includes(search)
        );
      }

      // Sort by proximity ascending
      filtered.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

      res.json({
        success: true,
        count: filtered.length,
        radius_km: radiusKm,
        user_coords: { lat, lng },
        jobs: filtered,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 2: POST /api/jobs/create
  // Endpoint for employers to post jobs with auto-geolocation
  // =========================================================================
  app.post('/api/jobs/create', (req, res) => {
    try {
      const {
        title,
        category,
        description,
        pay_amount,
        pay_type,
        location_lat,
        location_lng,
        location_address,
        is_urgent,
        hours_per_day,
        duration,
        requirements,
        tags,
      } = req.body;

      if (!title || !category || !pay_amount || !location_address) {
        return res.status(400).json({ success: false, error: 'Title, category, pay amount and location are required.' });
      }

      const payAmountNum = Number(pay_amount);
      const payDisplay =
        pay_type === 'hourly'
          ? `₹${payAmountNum}/hr`
          : pay_type === 'daily'
          ? `₹${payAmountNum}/day`
          : `₹${payAmountNum} fixed`;

      const newJob: Job = {
        id: `job_${Date.now()}`,
        employer_id: currentUser.id,
        employer_name: currentUser.name || 'Verified Employer',
        employer_rating: 4.8,
        title,
        category,
        description: description || 'No detailed description provided.',
        requirements: requirements || ['Punctual', 'Verified ID'],
        pay_amount: payAmountNum,
        pay_type: pay_type || 'daily',
        pay_display: payDisplay,
        location_lat: parseFloat(location_lat) || currentUser.lat,
        location_lng: parseFloat(location_lng) || currentUser.lng,
        location_address,
        distance_km: 0.5,
        is_urgent: Boolean(is_urgent),
        status: 'open',
        hours_per_day: hours_per_day || '4-6 hrs',
        duration: duration || 'Flexible',
        emoji: category === 'Delivery' ? '🛵' : category === 'Tutoring' ? '📚' : category === 'Restaurant Helper' ? '🍽️' : category === 'Data Entry' ? '💻' : '💼',
        logo_bg: '#1a3a1a',
        tags: tags || ['New Posting', 'Fast Response'],
        created_at: new Date().toISOString(),
      };

      jobsStore.unshift(newJob);

      // Trigger notification to worker community
      notificationsStore.unshift({
        id: `notif_${Date.now()}`,
        user_id: currentUser.id,
        title: 'New Job Posted Near You',
        message: `New ${newJob.category} opportunity: "${newJob.title}" (${newJob.pay_display}) at ${newJob.location_address}`,
        type: 'job_alert',
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: '#jobs',
      });

      res.status(201).json({
        success: true,
        message: 'Job posted successfully!',
        job: newJob,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 3: POST /api/applications/apply
  // Creates job application + triggers notification to employer and worker
  // =========================================================================
  app.post('/api/applications/apply', (req, res) => {
    try {
      const { job_id, message } = req.body;
      const job = jobsStore.find((j) => j.id === job_id);

      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found.' });
      }

      // Check if already applied
      const existing = applicationsStore.find((a) => a.job_id === job_id && a.worker_id === currentUser.id);
      if (existing) {
        return res.status(400).json({ success: false, error: 'You have already applied for this job.' });
      }

      const newApplication: Application = {
        id: `app_${Date.now()}`,
        job_id: job.id,
        job_title: job.title,
        job_category: job.category,
        worker_id: currentUser.id,
        worker_name: currentUser.name,
        worker_phone: currentUser.phone,
        worker_rating: currentUser.rating,
        status: 'applied',
        applied_at: new Date().toISOString(),
        message: message || 'I am ready to start immediately with relevant experience.',
        pay_amount: job.pay_amount,
        pay_type: job.pay_type,
      };

      applicationsStore.unshift(newApplication);

      // Trigger in-app notification
      notificationsStore.unshift({
        id: `notif_${Date.now()}`,
        user_id: currentUser.id,
        title: 'Application Submitted',
        message: `Your application for "${job.title}" at ${job.employer_name} was sent. Expected response within 2 hours.`,
        type: 'application_update',
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: '#applications',
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        application: newApplication,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 4: GET /api/earnings/summary
  // Aggregates completed job pay for earnings tracker chart and metrics
  // =========================================================================
  app.get('/api/earnings/summary', (_req, res) => {
    try {
      res.json({
        success: true,
        summary: earningsSummaryStore,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 5: POST /api/payments/payout
  // Integration boilerplate for Razorpay / UPI Instant Payouts
  // =========================================================================
  app.post('/api/payments/payout', (req, res) => {
    try {
      const { amount, upi_id, payment_method } = req.body;
      const payoutAmount = Number(amount) || 1200;
      const method = payment_method || 'UPI';
      const destination = upi_id || 'ravi@oksbi';

      const transactionRef = `UPI/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}/${Math.floor(100000000 + Math.random() * 900000000)}`;

      const newPayout: EarningRecord = {
        id: `pay_${Date.now()}`,
        worker_id: currentUser.id,
        job_id: 'job_recent_payout',
        job_title: 'Instant Balance Withdrawal',
        category: 'Delivery',
        amount: payoutAmount,
        payout_status: 'processed',
        payout_date: new Date().toISOString(),
        payment_method: `${method} (${destination})`,
        transaction_ref: transactionRef,
      };

      earningsSummaryStore.recentPayouts.unshift(newPayout);
      earningsSummaryStore.totalEarned += payoutAmount;
      earningsSummaryStore.currentMonthEarned += payoutAmount;

      // Notify user
      notificationsStore.unshift({
        id: `notif_${Date.now()}`,
        user_id: currentUser.id,
        title: 'Instant Payout Transferred',
        message: `₹${payoutAmount} credited to ${destination}. Ref ID: ${transactionRef}`,
        type: 'payout',
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: '#earnings',
      });

      res.json({
        success: true,
        message: `Instant payout of ₹${payoutAmount} sent to ${destination}`,
        payout: newPayout,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 6: POST /api/ai/match
  // Gemini AI Match Engine evaluating worker profile vs active jobs
  // =========================================================================
  app.post('/api/ai/match', async (req, res) => {
    try {
      const workerData: UserProfile = req.body.worker || currentUser;
      const matchResults = await matchJobsWithWorkerProfile(workerData, jobsStore);

      // Attach AI scores to in-memory jobs store for quick UI rendering
      matchResults.topMatches.forEach((match) => {
        const job = jobsStore.find((j) => j.id === match.jobId);
        if (job) {
          job.aiMatchScore = match.matchScore;
          job.aiMatchReason = match.fitSummary;
        }
      });

      res.json({
        success: true,
        matchData: matchResults,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // API ROUTE 7: GET & POST /api/notifications
  // =========================================================================
  app.get('/api/notifications', (_req, res) => {
    res.json({
      success: true,
      unreadCount: notificationsStore.filter((n) => !n.is_read).length,
      notifications: notificationsStore,
    });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { notificationId } = req.body;
    if (notificationId === 'all') {
      notificationsStore.forEach((n) => (n.is_read = true));
    } else if (notificationId) {
      const notif = notificationsStore.find((n) => n.id === notificationId);
      if (notif) notif.is_read = true;
    }
    res.json({ success: true, unreadCount: notificationsStore.filter((n) => !n.is_read).length });
  });

  // =========================================================================
  // API ROUTE 8: GET & PUT /api/user/profile
  // =========================================================================
  app.get('/api/user/profile', (_req, res) => {
    res.json({ success: true, user: currentUser });
  });

  app.put('/api/user/profile', (req, res) => {
    currentUser = { ...currentUser, ...req.body };
    res.json({ success: true, user: currentUser });
  });

  // =========================================================================
  // Vite Integration for Dev & Static serving for Production
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Money Maker Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
