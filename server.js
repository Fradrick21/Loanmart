/* ============================================================
   LOAN MART — Lead Form Email Server
   Node.js + Express + Nodemailer
   Run:  node server.js
   ============================================================ */

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Serve your HTML files as static assets ── */
app.use(express.static(path.join(__dirname)));

/* ── Nodemailer transporter (Gmail SMTP) ── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // your gmail address
    pass: process.env.GMAIL_PASS    // your gmail app password
  }
});

const LEAD_RECEIVER_EMAIL = process.env.LEAD_RECEIVER_EMAIL || process.env.GMAIL_USER || 'fradrickraj21@gmail.com';

/* ── POST /submit-lead  ── */
app.post('/submit-lead', async (req, res) => {
  const { full_name, phone, loan_type, city, page_source } = req.body;

  /* Basic server-side validation */
  if (!full_name || !phone || !loan_type || !city) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const mailOptions = {
    from    : `"Loan Mart Lead" <${process.env.GMAIL_USER}>`,
    to      : LEAD_RECEIVER_EMAIL,
    subject : `🔔 New Lead – ${page_source || 'Loan Mart Website'}`,
    html    : `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:30px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(31,111,214,0.10);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1f6fd6,#2ea36a);padding:28px 36px;">
                  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🏦 Loan Mart</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Lead Form Submission</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 36px;">
                  <p style="margin:0 0 24px;color:#17324d;font-size:15px;">
                    A new customer has submitted an enquiry from your website. Details below:
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:12px 16px;background:#f7fbff;border-radius:10px 10px 0 0;border-bottom:1px solid #e0ecff;">
                        <span style="font-size:12px;color:#1f6fd6;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Page Source</span><br>
                        <span style="font-size:16px;color:#17324d;font-weight:600;">${page_source || 'Website'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;background:#f7fbff;border-bottom:1px solid #e0ecff;">
                        <span style="font-size:12px;color:#1f6fd6;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Customer Name</span><br>
                        <span style="font-size:16px;color:#17324d;font-weight:600;">${full_name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;background:#f7fbff;border-bottom:1px solid #e0ecff;">
                        <span style="font-size:12px;color:#1f6fd6;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Phone Number</span><br>
                        <span style="font-size:18px;color:#17324d;font-weight:700;">📞 ${phone}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;background:#f7fbff;border-bottom:1px solid #e0ecff;">
                        <span style="font-size:12px;color:#1f6fd6;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Service / Loan Type</span><br>
                        <span style="font-size:16px;color:#17324d;font-weight:600;">${loan_type}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;background:#f7fbff;border-radius:0 0 10px 10px;">
                        <span style="font-size:12px;color:#1f6fd6;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">City</span><br>
                        <span style="font-size:16px;color:#17324d;font-weight:600;">📍 ${city}</span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;color:#5a7a9a;font-size:13px;">
                    ⏰ Submitted at: <strong>${submittedAt}</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 36px;background:#f7fbff;border-top:1px solid #e0ecff;text-align:center;">
                  <p style="margin:0;color:#8aaccc;font-size:12px;">Loan Mart · Automated Lead Notification · Do not reply</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

/* ── Start server ── */
app.listen(PORT, () => {
  console.log(`\n🚀 Loan Mart server running at http://localhost:${PORT}`);
  console.log(`   Open your website at: http://localhost:${PORT}/index.html\n`);
});
