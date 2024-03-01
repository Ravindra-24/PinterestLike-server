import { User } from "../db";
import logger from "../logger";
import { comparePassword } from "../utils/auth.utils";
import {
  generateResetToken,
  verifyResetToken,
  generateToken,
  verifyAuthToken,
} from "../utils/token";
import jwt from "jsonwebtoken";
const { validationResult } = require("express-validator");

import axios from "axios";

export const oneTapLogin = async (req, res) => {
  try {
    const { CredentialResponse } = req.body;
    const { credential } = CredentialResponse;
    const userData = jwt.decode(credential);
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
      jti: password,
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
    const token = generateToken({
      id: loginUser._id,
      email: loginUser.email,
      profilePicture: loginUser.profilePicture,
      firstName: loginUser.firstName,
      fullName: loginUser.fullName,
      initials: loginUser.initials,
      role: loginUser.role,
    });
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
    console.log(error);
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { codeResponse } = req.body;

    const { access_token } = codeResponse;

    const googleUserInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = googleUserInfoResponse.data;

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
    let loginUser = await User.findOne({ email });
    const token = generateToken({
      id: loginUser._id,
      email: loginUser.email,
      profilePicture: loginUser.profilePicture,
      firstName: loginUser.firstName,
      fullName: loginUser.fullName,
      initials: loginUser.initials,
      role: loginUser.role,
    });
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
    return res.status(400).json({
      message: "Google login failed",
      success: false,
    });
  }
};

export const signup = async (req, res) => {
  try {
    // validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        data: errors.array(),
      });
    }
    const { firstName, lastName, email, password } = req.body;
    // create a new user
    await User.create({
      firstName,
      lastName,
      email,
      password,
    });
    return res.status(201).json({
      message: "Signup successful",
      success: true,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    // validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        data: errors.array(),
      });
    }
    const { email, password } = req.body;
    // create a new user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        success: false,
        data: null,
      });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
        data: null,
      });
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      fullName: user.fullName,
      initials: user.initials,
      role: user.role,
    });
    return res.status(201).json({
      message: "Login successfull",
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        data: errors.array(),
      });
    }
    // check if user exists in the DB
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email not found",
        success: false,
        data: null,
      });
    }
    // generate a token and send email
    const token = generateResetToken({
      email,
    });
    const resetPasswordLink = `http://localhost:3000/reset-password/${token}`;
    // send the email
    return res.status(200).json({
      message: "Reset password link sent to email",
      success: true,
      data: { resetPasswordLink, token },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        data: errors.array(),
      });
    }
    const { password } = req.body;
    const { token } = req.params;
    // verify the token
    const payload = verifyResetToken(token);
    if (!payload) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
        data: null,
      });
    }
    const { email } = payload;
    const user = await User.findOne({ email });
    user.password = password;
    await user.save();
    // await User.findOneAndUpdate({ email }, { password });
    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
      data: null,
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

export const validate = async (req, res) => {
  try {
    const { token } = req.params;
    const payload = verifyAuthToken(token);
    if (!payload) {
      return res.status(401).json({
        message: "Invalid or expired token",
        success: false,
        data: null,
      });
    }
    const users = await User.findById({ _id: payload.id });
    return res.status(200).json({
      message: "User Verified",
      success: true,
      data: { token, user: payload },
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: null,
    });
  }
};
