import { Resend } from 'resend';

// ❌ OLD: const resend = new Resend(process.env.RESEND_API_KEY); (Don't do this globally)

export async function sendBookingConfirmation(
  customerEmail: string, 
  customerName: string, 
  bookingRef: string,
  carName: string
) {
  // ✅ NEW: Initialize it here (Lazy Load)
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!customerEmail) return;

  try {
    // Check if key exists before trying to send
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing');
      return;
    }

    await resend.emails.send({
      from: 'Oman Rentals <onboarding@resend.dev>', // Update this if you verified your domain
      to: customerEmail,
      subject: `Booking Confirmed! (Ref: ${bookingRef})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #000;">🚗 Booking Received</h1>
          <p>Hi ${customerName},</p>
          <p>We have received your request for the <strong>${carName}</strong>.</p>
          <p><strong>Booking Reference:</strong> #${bookingRef}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p>The vendor has been notified and will contact you shortly via WhatsApp to confirm details.</p>
          <p style="font-size: 12px; color: #888;">Thank you for choosing Oman Rentals.</p>
        </div>
      `
    });
    console.log('📧 Email sent successfully to:', customerEmail);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}