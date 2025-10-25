const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow requests from your GitHub Pages frontend
app.use(cors({
  origin: 'https://nesimi09.github.io',
}));

app.use(express.json());

// Root route to check server
app.get('/', (req, res) => res.send('Server is alive!'));

// Get env variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// Nodemailer transporter only if env vars exist
let transporter;
if (EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD }
  });
  console.log('✅ Nodemailer transporter configured');
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASSWORD is missing. Emails will not be sent.');
}

// Contact form route
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!transporter) {
    console.error('⚠️ Cannot send email: transporter not configured');
    return res.status(500).json({ error: 'Email server not configured' });
  }

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form: ${subject || 'No subject'}`,
      html: `
        <h2>New Message from Contact Form</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Use Railway's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
