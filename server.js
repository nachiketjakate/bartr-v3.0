import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Tester coupon — stored server-side only, never sent to the client
const TESTER_COUPON = process.env.TESTER_COUPON || 'TESTER2024';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Log env var status on startup (no secret values exposed)
console.log('ENV CHECK:', {
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
  EMAIL_USER: !!process.env.EMAIL_USER,
  PORT: process.env.PORT || 3001,
});

// Supabase admin client (service role — bypasses RLS)
// Guard against missing env vars to prevent crash on startup
let supabaseAdmin = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} else {
  console.error('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set! Coupon routes will fail.');
}

const app = express();

// CORS: restrict to known production origins.
// Allows localhost for local development and the Railway domain for production.
const allowedOrigins = [
  'https://bartr-v30-production.up.railway.app',
  'https://bartr.in',
  'http://localhost:5173',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin '${origin}' not allowed.`));
  },
  credentials: true,
}));

app.use(express.json());

// Health check endpoint — used by Railway to verify the server started correctly
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase: !!supabaseAdmin,
    razorpay: !!process.env.RAZORPAY_KEY_ID,
    email: !!process.env.EMAIL_USER,
  });
});

// ---------------------------------------------------------------------------
// OTP Store — Supabase-backed with in-memory fallback
// ---------------------------------------------------------------------------
// OTPs are stored in the `otp_store` Supabase table so they survive server
// restarts and Railway deploys. Falls back to in-memory if Supabase is
// unavailable (development mode).
//
// Required Supabase table (run in SQL Editor):
//   CREATE TABLE IF NOT EXISTS otp_store (
//     email TEXT PRIMARY KEY,
//     otp TEXT NOT NULL,
//     expires_at TIMESTAMPTZ NOT NULL
//   );
//   ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;
//   -- Service role bypasses RLS, so no policies needed for server-side access.
// ---------------------------------------------------------------------------
const otpMemory = {}; // fallback for dev / when Supabase is unavailable

const otpSet = async (email, otp, expiresAt) => {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('otp_store')
      .upsert({ email: email.toLowerCase(), otp, expires_at: new Date(expiresAt).toISOString() });
    if (error) console.error('OTP upsert error, falling back to memory:', error.message);
    else return;
  }
  otpMemory[email] = { otp, expiresAt };
};

const otpGet = async (email) => {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('otp_store')
      .select('otp, expires_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (error) console.error('OTP fetch error, falling back to memory:', error.message);
    else if (data) return { otp: data.otp, expiresAt: new Date(data.expires_at).getTime() };
  }
  return otpMemory[email] || null;
};

const otpDelete = async (email) => {
  if (supabaseAdmin) {
    await supabaseAdmin.from('otp_store').delete().eq('email', email.toLowerCase());
  }
  delete otpMemory[email];
};

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

// ---------------------------------------------------------------------------
// Helper: activate a subscription for a user via Supabase service-role admin
// This runs server-side only — the client never calls updateUser directly.
// ---------------------------------------------------------------------------
async function activateSubscription(userId, plan, extraMeta = {}) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not available.');
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      is_subscribed: true,
      subscription_plan: plan.name,
      subscription_expiry: expiryDate.toISOString(),
      ...extraMeta,
    },
  });
  if (error) throw error;
  console.log(`Subscription activated: user=${userId} plan=${plan.name} expiry=${expiryDate.toISOString()}`);
}

// Create Razorpay Order
app.post('/create-order', async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }

  // Amount is ₹1200, which is 120000 paise
  const options = {
    amount: 1200 * 100, // amount in paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify Razorpay Payment Signature
app.post('/verify-payment', (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing payment details for verification' });
  }

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Shared webmail hosts often have self-signed certificates, this bypasses the Node rejection
    rejectUnauthorized: false
  }
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email required' });

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry to exactly 2 minutes from now
  const expiresAt = Date.now() + 2 * 60 * 1000;
  await otpSet(email, otp, expiresAt);

  console.log(`Sending OTP ${otp} to ${email}...`);

  // If no credentials, log the OTP in console and mock success for safety
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("WARNING: EMAIL_USER or EMAIL_PASS not set in .env! Skipping actual email dispatch. The generated OTP is: " + otp);
    return res.json({ success: true, message: 'MOCK MODE: OTP generated but not emailed (Check server console).' });
  }

  const mailOptions = {
    from: `"Bartr App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Bartr Verification PIN',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Pitch Fire Verification</h2>
        <p>Your one-time password is:</p>
        <h1 style="background: #fef08a; display: inline-block; padding: 10px 20px; border: 2px dashed black; letter-spacing: 5px;">${otp}</h1>
        <p><strong>This OTP is valid for exactly 2 minutes.</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'SMTP Error: ' + error.message, stack: error.stack });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const record = await otpGet(email);
  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this email. Try sending again.' });
  }

  // Check Expiry (2 minute limit)
  if (Date.now() > record.expiresAt) {
    await otpDelete(email); // Clean up immediately
    return res.status(400).json({ success: false, error: 'OTP has expired (2 minute limit). Please request a new one.' });
  }

  // Check Match
  if (record.otp === otp) {
    await otpDelete(email); // Clean up on success
    return res.json({ success: true, message: 'OTP verified successfully' });
  }

  return res.status(400).json({ success: false, error: 'Invalid OTP entered.' });
});

app.post('/send-ticket', async (req, res) => {
  const { email, ticketId, teamName } = req.body;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("WARNING: Skipping ticket email due to missing .env credentials.");
    return res.json({ success: true, message: 'MOCK MODE: Ticket generated.' });
  }

  const mailOptions = {
    from: `"Bartr App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔥 TICKET: May 9th at Aromas Cafe & Bistro',
    html: `
      <div style="font-family: Arial, sans-serif; color: black; padding: 20px; border: 2px solid black;">
        <h2 style="text-transform: uppercase;">Your Founders Arena Ticket</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">Hi Founder, your registration is confirmed!</p>
        
        <div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>📅 DATE:</strong> May 9th, 2026</p>
          <p style="margin: 5px 0;"><strong>⏰ TIME:</strong> 9:30 AM to 1:30 PM</p>
          <p style="margin: 5px 0;"><strong>📍 VENUE:</strong> Aromas Cafe & Bistro, Nagpur</p>
          <p style="margin: 10px 0 0;"><a href="https://www.google.com/maps/place/Aromas+Cafe+%26+Bistro/@21.1171149,79.0565725,17z/data=!4m14!1m7!3m6!1s0x3bd4bf005003a015:0xb8ee2420eea3ba55!2sAromas+Cafe+%26+Bistro!8m2!3d21.1171149!4d79.0565725!16s%2Fg%2F11vx4lx8tc!3m5!1s0x3bd4bf005003a015:0xb8ee2420eea3ba55!8m2!3d21.1171149!4d79.0565725!16s%2Fg%2F11vx4lx8tc?entry=ttu&g_ep=EgoyMDI2MDQxOS4wIKXMDSoASAFQAw%3D%3D" style="color: blue; text-decoration: underline;">Open in Google Maps</a></p>
        </div>

        <p><strong>TEAM NAME:</strong> ${teamName}</p>
        <p><strong>TICKET ID:</strong> <span style="font-size: 20px; color: #10b981; font-weight: bold;">${ticketId}</span></p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">Please bring this Ticket ID with you to the venue.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Ticket mail sent' });
  } catch (error) {
    console.error('Error sending ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to send ticket.' });
  }
});

const SUBSCRIPTION_PLANS = {
  '3months': { name: '3 Months Pro', durationMonths: 3, originalPrice: 199, discountedPrice: 59 },
  '6months': { name: '6 Months Pro', durationMonths: 6, originalPrice: 299, discountedPrice: 149 },
  '1year': { name: '1 Year Pro', durationMonths: 12, originalPrice: 999, discountedPrice: 499 },
};

// Free coupons — 3 months free, single use per email (persisted in Supabase)
const FREE_COUPONS = ['LEMON', 'ADVVIDARBHA'];

// Validate free coupon (does NOT consume it — only checks)
app.post('/validate-coupon', async (req, res) => {
  const { email, coupon } = req.body;
  if (!email || !coupon) return res.status(400).json({ success: false, error: 'Email and coupon required.' });
  const code = coupon.toUpperCase();
  if (!FREE_COUPONS.includes(code)) {
    return res.status(400).json({ success: false, error: 'Invalid coupon code.' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ success: false, error: 'Server configuration error: Supabase not connected.' });
  }
  const { data, error } = await supabaseAdmin
    .from('coupon_redemptions')
    .select('id')
    .eq('coupon_code', code)
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error('Supabase validate-coupon error:', error);
    return res.status(500).json({ success: false, error: 'Server error validating coupon.' });
  }
  if (data) {
    return res.json({ success: false, error: `Coupon ${code} has already been used on this account.` });
  }
  return res.json({ success: true });
});

// Redeem free coupon — activates 3-month free subscription server-side
app.post('/redeem-coupon', async (req, res) => {
  const { email, coupon, userId } = req.body;
  if (!email || !coupon) return res.status(400).json({ success: false, error: 'Email and coupon required.' });
  if (!userId) return res.status(400).json({ success: false, error: 'userId required.' });
  const code = coupon.toUpperCase();
  if (!FREE_COUPONS.includes(code)) {
    return res.status(400).json({ success: false, error: 'Invalid coupon code.' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ success: false, error: 'Server configuration error: Supabase not connected.' });
  }
  const key = email.toLowerCase();
  const { error } = await supabaseAdmin
    .from('coupon_redemptions')
    .insert({ coupon_code: code, email: key });
  if (error) {
    // Unique constraint violation = already used
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: `Coupon ${code} has already been used on this account.` });
    }
    console.error('Supabase redeem-coupon error:', error);
    return res.status(500).json({ success: false, error: 'Server error redeeming coupon.' });
  }
  // Activate subscription server-side
  const freePlan = { name: `3 Months Pro (${code})`, durationMonths: 3 };
  try {
    await activateSubscription(userId, freePlan, { coupon_used: code });
  } catch (activationErr) {
    console.error('Coupon activation error:', activationErr);
    return res.status(500).json({ success: false, error: 'Coupon recorded but subscription activation failed. Contact support.' });
  }
  console.log(`Coupon ${code} redeemed by ${key}`);
  return res.json({ success: true, message: `${code} redeemed — 3 months free subscription activated.` });
});

// Validate tester coupon — never exposes the code to the client
app.post('/validate-tester-coupon', (req, res) => {
  const { coupon } = req.body;
  if (!coupon) return res.status(400).json({ success: false, error: 'Coupon required.' });
  if (coupon.toUpperCase() === TESTER_COUPON) {
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false, error: 'Invalid coupon code.' });
});

// Activate tester subscription — server-side only, requires valid coupon
app.post('/activate-tester-subscription', async (req, res) => {
  const { coupon, userId, planId } = req.body;
  if (!coupon || !userId || !planId) {
    return res.status(400).json({ success: false, error: 'coupon, userId, and planId are required.' });
  }
  if (coupon.toUpperCase() !== TESTER_COUPON) {
    return res.status(400).json({ success: false, error: 'Invalid tester coupon.' });
  }
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid plan ID.' });
  }
  try {
    await activateSubscription(userId, { name: plan.name + ' (Tester)', durationMonths: plan.durationMonths }, { tester_access: true });
    res.json({ success: true, message: 'Tester subscription activated.' });
  } catch (err) {
    console.error('Tester activation error:', err);
    res.status(500).json({ success: false, error: 'Failed to activate tester subscription.' });
  }
});

app.post('/create-subscription-order', async (req, res) => {
  const { planId, userId, userEmail } = req.body;

  if (!razorpay) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required.' });
  }

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid subscription plan.' });
  }

  const amountRupees = plan.originalPrice;

  try {
    const order = await razorpay.orders.create({
      amount: amountRupees * 100,
      currency: 'INR',
      receipt: `sub_${planId}_${Date.now()}`,
      notes: {
        planId,
        planName: plan.name,
        durationMonths: String(plan.durationMonths),
        // Store user identity so webhook can activate without browser
        userId,
        userEmail: userEmail || '',
      },
    });

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      durationMonths: plan.durationMonths,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create order.' });
  }
});

app.post('/verify-subscription-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
  }
  if (!userId || !planId) {
    return res.status(400).json({ success: false, error: 'userId and planId are required for subscription activation.' });
  }

  // 1. Verify Razorpay payment signature
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
  }

  // 2. Activate subscription server-side — client never calls updateUser
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Unknown plan ID.' });
  }
  try {
    await activateSubscription(userId, plan, {
      razorpay_payment_id,
      razorpay_order_id,
    });
    res.json({ success: true, message: 'Payment verified and subscription activated.' });
  } catch (err) {
    console.error('Subscription activation error after payment:', err);
    // Payment was valid — activation failed. Log for manual recovery.
    res.status(500).json({
      success: false,
      error: 'Payment verified but subscription activation failed. Contact support with Payment ID: ' + razorpay_payment_id,
    });
  }
});

// ---------------------------------------------------------------------------
// Razorpay Webhook — fires when a payment is captured by Razorpay
// This is the fallback activation path: if the browser closes after payment
// before the frontend can call /verify-subscription-payment, this webhook
// will activate the subscription automatically.
//
// Setup:
//   1. Set RAZORPAY_WEBHOOK_SECRET in .env (copy from Razorpay Dashboard → Webhooks)
//   2. Register this URL in Razorpay Dashboard → Webhooks:
//      https://your-domain.com/razorpay-webhook
//   3. Select event: payment.captured
// ---------------------------------------------------------------------------
app.post(
  '/razorpay-webhook',
  express.raw({ type: 'application/json' }), // raw body needed for signature check
  async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not set — skipping webhook signature check (INSECURE).');
    } else {
      const signature = req.headers['x-razorpay-signature'];
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');
      if (expected !== signature) {
        console.warn('Razorpay webhook: invalid signature, rejecting.');
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    let event;
    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }

    // Only handle payment.captured
    if (event.event !== 'payment.captured') {
      return res.json({ received: true, action: 'ignored' });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      return res.status(400).json({ error: 'Missing payment entity in webhook payload.' });
    }

    const orderId = payment.order_id;
    if (!orderId || !razorpay) {
      return res.json({ received: true, action: 'no-order-or-razorpay' });
    }

    try {
      // Fetch the order from Razorpay to get the notes (userId, planId, etc.)
      const order = await razorpay.orders.fetch(orderId);
      const { userId, planId } = order.notes || {};
      if (!userId || !planId) {
        console.log(`Webhook: order ${orderId} has no userId/planId in notes — skipping activation.`);
        return res.json({ received: true, action: 'no-user-in-notes' });
      }

      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        console.error(`Webhook: unknown planId "${planId}" in order ${orderId}`);
        return res.json({ received: true, action: 'unknown-plan' });
      }

      await activateSubscription(userId, plan, {
        razorpay_payment_id: payment.id,
        razorpay_order_id: orderId,
        activated_via: 'webhook',
      });
      console.log(`Webhook: subscription activated for user=${userId} via order=${orderId}`);
      res.json({ received: true, action: 'subscription-activated' });
    } catch (err) {
      console.error('Webhook: error activating subscription:', err);
      // Still return 200 so Razorpay doesn't retry endlessly
      res.json({ received: true, action: 'error', message: err.message });
    }
  }
);

app.post('/welcome-email', async (req, res) => {
  const { email, fullName } = req.body;
  
  const mailOptions = {
    from: `"Bartr.in" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to the Bartr Community, ${fullName}! 🚀`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 4px solid #000; border-radius: 12px;">
        <h1 style="text-transform: uppercase; font-weight: 900; margin-bottom: 20px;">Welcome to Bartr!</h1>
        <p style="font-size: 16px; line-height: 1.5;">Hi <strong>${fullName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Welcome to <strong>Bartr.in</strong> — Nagpur's most energetic community for startups, trades, and creative collaborations.</p>
        
        <div style="background: #fcd34d; padding: 20px; border: 3px solid #000; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; text-transform: uppercase;">Your Journey Starts Now</h2>
          <p>You can now log in, set up your profile, and start networking with other founders and creators.</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">Check your inbox for a verification email from Supabase and click the link to confirm your account.</p>
        
        <p style="margin-top: 30px;">Cheers,<br/><strong>Team Bartr</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ success: false, error: 'Failed to send welcome email.' });
  }
});

// ---------------------------------------------------------------------------
// Serve built frontend (Vite dist/)
// ---------------------------------------------------------------------------
// This lets the Express server act as both API backend AND static host
// in production (Railway), removing the need for a separate static host.
//
// WHY THIS PATTERN:
//   Express v5's express.static returns 403 for dot-files (like .htaccess)
//   and for directory-like SPA routes (/gigs, /profile) even with index:false.
//
//   Fix 1 (build-time): vite.config.js removes .htaccess/.cpanel.yml from
//   dist/ after every build via the removeApacheArtifacts plugin.
//
//   Fix 2 (runtime): Gate express.static so it only activates for requests
//   that have a file extension (real assets). SPA routes have no extension
//   and skip straight to the index.html catch-all — no static middleware
//   involvement at all, so no 403 possible.
//
//   Fix 3 (runtime): Set dotfiles:'allow' so if any dot-file somehow remains
//   in dist/, it gets served normally instead of 403.
// ---------------------------------------------------------------------------
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  const staticMiddleware = express.static(distPath, {
    index: false,
    fallthrough: true,
    dotfiles: 'allow', // Defense-in-depth: serve dot-files instead of 403ing
  });

  // Only forward to express.static when the request looks like a real file asset.
  // Paths without a dot in the last segment (SPA routes) skip static entirely.
  app.use((req, res, next) => {
    const lastSegment = req.path.split('/').pop();
    if (lastSegment && lastSegment.includes('.')) {
      return staticMiddleware(req, res, next);
    }
    next();
  });

  // SPA catch-all: read index.html and serve it for every non-API, non-asset route.
  // Using fs.readFile avoids res.sendFile's OS-level permission checks that
  // can trigger 403 errors on Railway/Nixpacks filesystem setups.
  const serveIndex = (req, res) => {
    fs.readFile(indexHtmlPath, (err, data) => {
      if (err) {
        console.error('Failed to read index.html:', err);
        return res.status(500).send('Internal Server Error: Could not load app.');
      }
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    });
  };

  app.get('/', serveIndex);
  app.get('/*splat', serveIndex);
  console.log(`Serving frontend from ${distPath}`);
} else {
  console.log('No dist/ folder found — running in API-only mode (dev).');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bartr Backend running on port ${PORT}`);
  console.log(`Server will handle real SMTP emails using NodeMailer.`);
});
