import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { CAFE_NAME, CAFE_PHONE } from "@/lib/constants";

type Reservation = {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  date: string;
  timeSlot: string;
  partySize: number;
};

export async function sendReservationConfirmation(reservation: Reservation) {
  const { customerName, customerEmail, customerPhone, date, timeSlot, partySize } = reservation;

  const subject = `Your ${CAFE_NAME} reservation is confirmed`;
  const body = `Hi ${customerName}, your table for ${partySize} at ${CAFE_NAME} on ${date} at ${timeSlot} is confirmed. Questions? Call us at ${CAFE_PHONE}.`;

  const results = await Promise.allSettled([
    customerEmail ? sendEmail(customerEmail, subject, body) : Promise.resolve(),
    customerPhone ? sendSms(customerPhone, body) : Promise.resolve(),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const channel = i === 0 ? "email" : "SMS";
      console.error(`Reservation confirmation ${channel} failed:`, result.reason);
    }
  });
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.warn("SendGrid not configured; skipping reservation confirmation email.");
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({ to, from: process.env.SENDGRID_FROM_EMAIL, subject, text });
}

async function sendSms(to: string, body: string) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.warn("Twilio not configured; skipping reservation confirmation SMS.");
    return;
  }
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  await client.messages.create({ to, from: TWILIO_FROM_NUMBER, body });
}
