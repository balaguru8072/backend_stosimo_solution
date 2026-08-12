import ServiceMessage from '../models/serviceMessage.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Submit contact form
// @route   POST /api/service-messages
// @access  Public
export const submitServiceMessage = async (req, res) => {
    try {
        const { name, phone, email, service, business, location, message } = req.body;

        const newServiceMessage = await ServiceMessage.create({
            name, phone, email, service, business, location, message
        });

        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `New Lead: ${service} - ${name}`,
                html: `
                    <h2>New Service Enquiry from Zotech Website</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Business:</strong> ${business}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Message:</strong> ${message}</p>
                `
            });
        } catch (emailErr) {
            console.log('Email send failed:', emailErr);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully! We will contact you soon.',
            data: newServiceMessage 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all service messages for Admin
// @route   GET /api/service-messages
// @access  Private/Admin
export const getServiceMessages = async (req, res) => {
    try {
        const serviceMessages = await ServiceMessage.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: serviceMessages.length, data: serviceMessages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get single service message
// @route GET /api/service-messages/:id
// @access Private/Admin
export const getServiceMessage = async (req, res) => {
    try {
        const serviceMessage = await ServiceMessage.findById(req.params.id);
        if (!serviceMessage) {
            return res.status(404).json({ success: false, message: 'Service Message not found' });
        }
        res.status(200).json({ success: true, data: serviceMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update service message status
// @route   PUT /api/service-messages/:id
// @access  Private/Admin
export const updateServiceMessageStatus = async (req, res) => {
    try {
        const serviceMessage = await ServiceMessage.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        if (!serviceMessage) {
            return res.status(404).json({ success: false, message: 'Service Message not found' });
        }
        res.status(200).json({ success: true, data: serviceMessage });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete service message
// @route   DELETE /api/service-messages/:id
// @access  Private/Admin
export const deleteServiceMessage = async (req, res) => {
    try {
        const serviceMessage = await ServiceMessage.findByIdAndDelete(req.params.id);
        
        if (!serviceMessage) {
            return res.status(404).json({ 
                success: false, 
                message: 'Service Message not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Service Message deleted successfully',
            data: {} 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};