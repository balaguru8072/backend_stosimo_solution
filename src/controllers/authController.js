import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc Register with OTP
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiry
    });

    console.log(`🔥 OTP for ${email}: ${otp}`);

    const message = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <h2 style="color: #3B82F6;">Welcome to Zotech! 🚀</h2>
        <p>Hi ${name},</p>
        <p>Your OTP: <h1 style="background: #3B82F6; color: #FFF; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 5px;">${otp}</h1></p>
        <p>Expires in 10 mins</p>
      </div>
    `;

    try {
      await sendEmail({ email, subject: 'Verify Your Email - Zotech OTP', message });
    } catch (emailError) {
      console.log('Email failed, but check terminal OTP:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered! OTP sent',
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified!',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        company: user.company,
        settings: user.settings
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login - ✅ FIXED
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ✅ FIX: select('+password') add panniten
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        company: user.company,
        settings: user.settings
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`🔥 Forgot OTP for ${email}: ${otp}`);

    const message = `<h1>Password Reset OTP: ${otp}</h1><p>Expires in 10 mins</p>`;

    try {
      await sendEmail({ email, subject: 'Password Reset OTP', message });
    } catch (err) {
      console.log('Email failed:', err.message);
    }

    res.json({ success: true, message: 'OTP sent!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful!',
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`🔥 Resent OTP for ${email}: ${otp}`);

    const message = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3B82F6;">New OTP - Zotech</h2>
        <h1 style="background: #3B82F6; color: #FFF; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 5px;">${otp}</h1>
        <p>Expires in 10 mins</p>
      </div>
    `;

    try {
      await sendEmail({ email, subject: 'New OTP - Zotech', message });
    } catch (err) {
      console.log('Email failed:', err.message);
    }

    res.json({ success: true, message: 'New OTP sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Profile - ✅ FIXED
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};