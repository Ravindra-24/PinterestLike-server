import { User } from "../db/schema/User.js";
import {
  generateToken,
  generateResetToken,
  verifyResetToken,
  verifyAuthToken,
} from "../utils/token.js";
import { comparePassword } from "../utils/auth.utils.js";
import { validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    message,
    success: status >= 200 && status < 300,
    data,
  });
};

const createUserToken = (user) => {
  return generateToken({
    id: user._id,
    email: user.email,
    profilePicture: user.profilePicture,
    firstName: user.firstName,
    fullName: user.fullName,
    initials: user.initials,
    role: user.role,
  });
};

export const oneTapLogin = async (req, res) => {
  try {
    const { CredentialResponse } = req.body;
    const { credential } = CredentialResponse;
    if (!credential || !process.env.GOOGLE_CLIENT_ID) return handleResponse(res, 400, "Google sign-in is not configured");
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const userData = ticket.getPayload();
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
      sub: password,
    } = userData;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        profilePicture,
        password,
      });
    }
    let loginUser = await User.findOne({ email });
    const token = createUserToken(loginUser);
    return res.status(201).json({
      message: "Login successfull",
      success: true,
      data: {
        token,
        user: {
          id: loginUser._id,
          email: loginUser.email,
          profilePicture: loginUser.profilePicture,
          firstName: loginUser.firstName,
          fullName: loginUser.fullName,
          initials: loginUser.initials,
          role: loginUser.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 401, "Google sign-in could not be verified");
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { codeResponse } = req.body;
    const { access_token } = codeResponse;
    const googleUserInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
    if (!googleUserInfoResponse.ok) return handleResponse(res, 401, "Google sign-in could not be verified");
    const userData = await googleUserInfoResponse.json();

    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
      password: id,
    } = userData;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        profilePicture,
        password: id,
      });
    }

    const token = createUserToken(user);

    return handleResponse(res, 201, "Login successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        fullName: user.fullName,
        initials: user.initials,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, "Validation failed", errors.array());
    }

    const { firstName, lastName, email, password } = req.body;

    await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    return handleResponse(res, 201, "Signup successful");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, "Validation failed", errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return handleResponse(res, 400, "User with this email does not exist");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return handleResponse(res, 400, "Invalid credentials");
    }

    const token = createUserToken(user);

    return handleResponse(res, 201, "Login successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        fullName: user.fullName,
        initials: user.initials,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, "Validation failed", errors.array());
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return handleResponse(res, 400, "User with this email not found");
    }

    const token = generateResetToken({ email });
    const resetPasswordLink = `${process.env.SITE_URL || "http://localhost:5173"}/reset-password/${token}`;

    if (process.env.RESET_EMAIL_WEBHOOK_URL) {
      await fetch(process.env.RESET_EMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: user.email, template: "password-reset", resetPasswordLink }),
      });
    }
    return handleResponse(res, 200, "If that account exists, a reset link has been sent", process.env.NODE_ENV === "development" ? { resetPasswordLink } : null);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, 400, "Validation failed", errors.array());
    }

    const { password } = req.body;
    const { token } = req.params;

    const payload = verifyResetToken(token);
    if (!payload) {
      return handleResponse(res, 400, "Invalid or expired token");
    }

    const { email } = payload;
    const user = await User.findOne({ email });
    user.password = password;
    await user.save();

    return handleResponse(res, 200, "Password updated successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};

export const validate = async (req, res) => {
  try {
    const { token } = req.params;
    const payload = verifyAuthToken(token);
    if (!payload) {
      return handleResponse(res, 401, "Invalid or expired token");
    }

    const currentUser = await User.findById(payload.id);

    return handleResponse(res, 200, "User verified", {
      token,
      user: {
        id: currentUser._id,
        email: currentUser.email,
        profilePicture: currentUser.profilePicture,
        firstName: currentUser.firstName,
        fullName: currentUser.fullName,
        initials: currentUser.initials,
        role: currentUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message);
  }
};
