import nodemailer from "nodemailer";
import { environment, isEmailConfigured } from "../config/environment.js";

let emailService;

function formatSender(name, address) {
  return name ? { name, address } : address;
}

/**
 * Creates an email service around any Nodemailer-compatible transport.
 * Keeping this small wrapper injectable makes delivery behavior testable without
 * connecting to a real SMTP account.
 */
export function createEmailService({ transport, from, replyTo }) {
  if (!transport?.sendMail) throw new TypeError("An email transport is required");

  return {
    async send(message = {}) {
      const { to, cc, bcc, subject, text, html, attachments } = message;

      if (!to) throw new TypeError("Email recipient (to) is required");
      if (!subject?.trim()) throw new TypeError("Email subject is required");
      if (!text && !html) throw new TypeError("Email text or html content is required");

      return transport.sendMail({
        from,
        to,
        cc,
        bcc,
        replyTo: message.replyTo ?? replyTo,
        subject: subject.trim(),
        text,
        html,
        attachments,
      });
    },

    verify() {
      if (!transport.verify) return Promise.resolve(true);
      return transport.verify();
    },
  };
}

function getEmailService() {
  if (!isEmailConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, " +
      "SMTP_PASSWORD, and SMTP_FROM_EMAIL."
    );
  }

  if (!emailService) {
    const transport = nodemailer.createTransport({
      host: environment.smtp.host,
      port: environment.smtp.port,
      secure: environment.smtp.secure,
      auth: {
        user: environment.smtp.user,
        pass: environment.smtp.password,
      },
    });

    emailService = createEmailService({
      transport,
      from: formatSender(environment.smtp.fromName, environment.smtp.fromEmail),
      replyTo: environment.smtp.replyTo,
    });
  }

  return emailService;
}

export function sendEmail(message) {
  return getEmailService().send(message);
}

export function verifyEmailConnection() {
  return getEmailService().verify();
}

