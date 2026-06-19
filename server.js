import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for OTPs
// Structure: { "email@example.com": { otp: "123456", expiresAt: 1714000000000 } }
const otps = {};

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

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
  otps[email] = { otp, expiresAt };

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

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  const record = otps[email];
  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this email. Try sending again.' });
  }

  // Check Expiry (2 Limit limit)
  if (Date.now() > record.expiresAt) {
    delete otps[email]; // Clean up immediately
    return res.status(400).json({ success: false, error: 'OTP has expired (2 minute limit). Please request a new one.' });
  }

  // Check Match
  if (record.otp === otp) {
    delete otps[email]; // Clean up on success
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

const VALID_COUPON = process.env.RAZORPAY_COUPON_CODE || 'COCKROACH';

app.post('/create-subscription-order', async (req, res) => {
  const { planId, couponCode } = req.body;

  if (!razorpay) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid subscription plan.' });
  }

  const couponApplied = couponCode === VALID_COUPON;
  const amountRupees = couponApplied ? plan.discountedPrice : plan.originalPrice;

  try {
    const order = await razorpay.orders.create({
      amount: amountRupees * 100,
      currency: 'INR',
      receipt: `sub_${planId}_${Date.now()}`,
      notes: {
        planId,
        planName: plan.name,
        durationMonths: String(plan.durationMonths),
        couponApplied: String(couponApplied),
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

app.post('/verify-subscription-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, error: 'Razorpay is not configured on the server.' });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
  }

  res.json({ success: true });
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bartr Backend running on port ${PORT}`);
  console.log(`Server will handle real SMTP emails using NodeMailer.`);
});
