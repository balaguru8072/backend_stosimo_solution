import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// @desc Get logged in admin profile
// @route GET /api/users/profile
// @access Private/Admin
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error',
            error: error.message 
        });
    }
};

// @desc Update admin profile
// @route PUT /api/users/profile
// @access Private/Admin
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, company } = req.body;
        
        // Check if email already exists for another user
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: req.user.id } 
            });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already in use' 
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, company },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpiry');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully',
            data: user 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc Change admin password
// @route PUT /api/users/change-password
// @access Private/Admin
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword ||!newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide current and new password' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save(); // pre('save') hook hash pannum

        res.status(200).json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc Update admin settings
// @route PUT /api/users/settings
// @access Private/Admin
export const updateSettings = async (req, res) => {
    try {
        const { emailNotifications, pushNotifications, siteName, timezone } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                settings: {
                    emailNotifications,
                    pushNotifications,
                    siteName,
                    timezone
                }
            },
            { new: true }
        ).select('-password -otp -otpExpiry');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Settings updated successfully',
            data: user 
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};