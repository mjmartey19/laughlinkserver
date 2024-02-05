import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {v4 as uuidv4 } from 'uuid'; //version 4 of uuid
import { hashString } from './index.js'; 
import Verification from '../models/emailVerification.js';
import PasswordReset from '../models/passwordReset.js';

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL} = process.env;

//We create a node mailer transporter.We pass the host as well as the authentication
let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    },//Authentication
});

// Send a verification email to the user
export const sendVerificationEmail = async (user, res) => {
  const { _id, email, lastName } = user;

  // Generate a token using uuid
  const token = _id + uuidv4();

  // Create the verification link
  const link = `${APP_URL}users/verify/${_id}/${token}`;

  // Set up the mail options
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<div
      style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
      <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
      <hr>
      <h4>Hi ${lastName},</h4>
      <p>
        Please verify your email address so we can know that it's really you.
        <br>
        <p>This link <b>expires in 1 hour</b></p>
        <br>
        <a href=${link}
          style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px;">Verify
          Email Address</a>
      </p>
      <div style="margin-top: 20px;">
        <h5>Best Regards</h5>
        <h5>ShareFun Team</h5>
      </div>
    </div>`,
  };

  try {
    // Hash the token
    const hashedToken = await hashString(token);

    // Create a new verification entry in the database
    const newVerifiedEmail = await Verification.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour in milliseconds
    });

    // If verification exists, send the email
    if (newVerifiedEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: 'PENDING',
            message:
              'Verification email has been sent to your account. Check your email for further instructions',
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: 'Failed to send verification email. Check the server logs for details.' });
        });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: 'Something went wrong' });
  }
};

/*
  Sends a password reset link to the user's email address.
 */
export const resetPasswordLink = async (user, res) => {
  const { _id, email } = user;

  // Generate a unique token for password reset
  const token = _id + uuidv4();

  // Create the reset password link
  const link = APP_URL + "users/reset-password/" + _id + "/" + token; 

  // Create the email content
  const emailContent = `
    <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
      Password reset link. Please click the link below to reset password.
      <br>
      <p style="font-size: 18px;"><b>This link expires in 10 minutes</b></p>
      <br>
      <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
    </p>
  `;

  // Set up the email options
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Password Reset",
    html: emailContent,
  };

  try {
    const hashedToken = await hashString(token);

    // Create a password reset record in the database
    const resetEmail = await PasswordReset.create({
      userId: _id,
      email: email,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });

    if (resetEmail) {
      // Send the password reset email
      transporter.sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "PENDING",
            message: "Reset Password Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Failed to send reset-password link." });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};
