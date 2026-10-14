const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});


exports.sendBookingConfirmation = async (bookingDetails) => {
  const {
    userEmail,
    userName,
    eventName,
    eventDate,
    eventLocation,
    ticketType,
    quantity,
    amount,
    orderId,
    bookingId,
    // Assuming you might have a frontend URL for the user to view the ticket
    ticketUrl = "#" 
  } = bookingDetails;

  // Format currency
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            /* Reset & Base Styles */
            body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
            table { border-spacing: 0; width: 100%; }
            td { padding: 0; }
            img { border: 0; }
            
            /* Container */
            .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 40px; }
            .main-content { background-color: #ffffff; margin: 0 auto; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            
            /* Header */
            .header { background-color: #1a202c; padding: 30px 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
            
            /* Body */
            .body-section { padding: 40px 40px 20px 40px; color: #4a5568; }
            .greeting { font-size: 18px; margin-bottom: 20px; color: #2d3748; }
            .intro-text { line-height: 1.6; margin-bottom: 30px; }
            
            /* Event Card */
            .event-card { background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
            .event-title { font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 15px; }
            .info-row { margin-bottom: 12px; display: flex; align-items: start; }
            .info-label { font-weight: 600; width: 80px; color: #718096; font-size: 14px; }
            .info-value { color: #2d3748; font-weight: 500; font-size: 14px; flex: 1; }
            
            /* Ticket Details Table */
            .ticket-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .ticket-table th { text-align: left; padding: 12px; background-color: #edf2f7; color: #4a5568; font-size: 13px; font-weight: 600; text-transform: uppercase; }
            .ticket-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-size: 14px; }
            .total-row td { font-weight: 700; color: #1a202c; border-bottom: none; font-size: 16px; }
            
            /* Ticket ID Box */
            .ticket-id-box { text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #cbd5e0; border-radius: 8px; background-color: #fff; }
            .ticket-label { display: block; font-size: 12px; color: #718096; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px; }
            .ticket-code { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: #2d3748; letter-spacing: 2px; }
            
            /* CTA Button */
            .btn-container { text-align: center; margin-bottom: 40px; }
            .btn { background-color: #3182ce; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.3s; }
            .btn:hover { background-color: #2c5282; }
            
            /* Footer */
            .footer { background-color: #f4f7f6; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; }
            .footer a { color: #718096; text-decoration: none; margin: 0 5px; }
            
            /* Mobile Responsive */
            @media screen and (max-width: 600px) {
                .main-content { width: 100% !important; border-radius: 0; }
                .header, .body-section { padding: 20px !important; }
                .ticket-code { font-size: 18px; }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <center>
                <div class="main-content">
                    <div class="header">
                        <h1>EventEase</h1>
                    </div>

                    <div class="body-section">
                        <div class="greeting">Hi ${userName},</div>
                        <p class="intro-text">
                            We are excited to confirm your booking! Your tickets for <strong>${eventName}</strong> have been secured. Below are your booking details.
                        </p>

                        <div class="event-card">
                            <div class="event-title">${eventName}</div>
                            
                            <table width="100%">
                                <tr>
                                    <td class="info-label" style="padding-bottom: 10px;">Date:</td>
                                    <td class="info-value" style="padding-bottom: 10px;">${eventDate}</td>
                                </tr>
                                <tr>
                                    <td class="info-label">Location:</td>
                                    <td class="info-value">${eventLocation}</td>
                                </tr>
                            </table>
                        </div>

                        <table class="ticket-table">
                            <thead>
                                <tr>
                                    <th>Ticket Type</th>
                                    <th>Qty</th>
                                    <th style="text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${ticketType}</td>
                                    <td>${quantity}</td>
                                    <td style="text-align: right;">${formattedAmount}</td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="2" style="text-align: right; padding-top: 15px;">Total Paid:</td>
                                    <td style="text-align: right; padding-top: 15px;">${formattedAmount}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="ticket-id-box">
                            <span class="ticket-label">Booking Reference</span>
                            <span class="ticket-code">${bookingId}</span>
                        </div>
                        
                        <p style="text-align: center; font-size: 13px; color: #718096; margin-bottom: 30px;">
                            Order ID: ${orderId}
                        </p>

                        <div class="btn-container">
                            <a href="https://eventease-myprojects.vercel.app/my-bookings" class="btn">View My Ticket</a>
                        </div>

                        <p style="font-size: 13px; color: #718096; text-align: center;">
                            Please present the Booking Reference or QR code (if applicable) at the venue entrance.
                        </p>
                    </div>
                </div>

                <div class="footer">
                    <p>Need help? Contact us at support@eventease.com</p>
                    <p>
                        <a href="#">Privacy Policy</a> • 
                        <a href="#">Terms of Service</a>
                    </p>
                    <p>&copy; ${new Date().getFullYear()} EventEase. All rights reserved.</p>
                </div>
            </center>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"EventEase Support" <${process.env.EMAIL_USER}>`, // Professional "From" name
    to: userEmail,
    subject: `✅ Booking Confirmed: ${eventName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error);
    // Depending on your error handling policy, you might want to suppress this error 
    // so it doesn't crash the request, or re-throw it.
    // throw error; 
  }
};

/**
 * Send ticket verification email
 */
exports.sendTicketVerification = async (userEmail, eventName, orderId) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2b6cb0;">Ticket Verified</h2>
        <p>Your ticket for <strong>${eventName}</strong> has been successfully verified.</p>
        <p style="background: #f7fafc; padding: 10px; border-radius: 5px; display: inline-block;">
            Order ID: <strong>${orderId}</strong>
        </p>
    </div>
  `;

  const mailOptions = {
    from: `"EventEase Security" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Ticket Verified - ${eventName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket verification email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending verification email:`, error);
    // throw error;
  }
};