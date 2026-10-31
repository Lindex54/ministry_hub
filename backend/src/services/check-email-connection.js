import { verifyEmailConnection } from "./email.service.js";

try {
  await verifyEmailConnection();
  console.log("SMTP connection and authentication succeeded.");
} catch (error) {
  console.error(`SMTP connection failed: ${error.message}`);
  process.exitCode = 1;
}
