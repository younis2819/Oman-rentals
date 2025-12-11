import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(
  customerEmail: string, 
  customerName: string, 
  bookingRef: string,
  carName: string
) {
  if (!customerEmail) return;

  try {
    await resend.emails.send({
      from: 'Oman Rentals <onboarding@resend.dev>', // Change this to 'bookings@omanrentals.com' once domain is verified
      to: customerEmail,
      subject: `Booking Confirmed! (Ref: ${bookingRef})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>🚗 Booking Received</h1>
          <p>Hi ${customerName},</p>
          <p>We have received your request for the <strong>${carName}</strong>.</p>
          <p><strong>Booking Reference:</strong> #${bookingRef}</p>
          <hr />
          <p>The vendor has been notified and will contact you shortly to confirm details.</p>
          <p>To view your booking status, visit your dashboard.</p>
        </div>
      `
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email failed:', error);
  }
}

export async function sendVendorAlert(
    // You can implement this later to email the vendor automatically
) {
    // ...
}