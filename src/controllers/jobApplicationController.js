import JobApplication from '../models/jobApplication.js';
import Job from '../models/job.js';
import cloudinary from '../config/cloudinary.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';
import sendEmail from '../utils/sendEmail.js'; // ✅ Email utility

// @desc Submit job application
export const submitApplication = async (req, res) => {
    try {
        const { jobId, name, email, phone, subject, message } = req.body;

        const job = await Job.findById(jobId);
        if (!job ||!job.isActive) {
            return res.status(404).json({ success: false, message: 'Job not found or closed' });
        }

        if (!req.files?.resume ||!req.files.resume[0]) {
            return res.status(400).json({ success: false, message: 'Resume is required' });
        }

        const result = await uploadToCloudinary(
            req.files.resume[0].buffer, 
            'zotech_resumes', 
            'raw'
        );
        
        const application = await JobApplication.create({
            jobId,
            name,
            email,
            phone,
            subject,
            message,
            resume: result.secure_url
        });

        // ✅ Send confirmation mail to candidate
        try {
            await sendEmail({
                to: email,
                subject: `Application Received - ${job.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3B82F6;">Application Received Successfully!</h2>
                        <p>Dear ${name},</p>
                        <p>Thank you for applying for the position of <strong>${job.title}</strong> at our company.</p>
                        <p>We have received your application and our team will review it shortly. You will be notified about the next steps via email.</p>
                        <div style="background: #F1F5F9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Position:</strong> ${job.title}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                            <p style="margin: 5px 0;"><strong>Applied On:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                        </div>
                        <p>Best regards,<br>HR Team</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.log('Candidate email failed:', emailErr);
        }

        // ✅ Send notification to Admin
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `New Application: ${job.title} - ${name}`,
                html: `
                    <h2>New Job Application Received</h2>
                    <p><strong>Position:</strong> ${job.title}</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                    <p><strong>Message:</strong> ${message || 'N/A'}</p>
                    <p><strong>Resume:</strong> <a href="${result.secure_url}">Download</a></p>
                `
            });
        } catch (emailErr) {
            console.log('Admin email failed:', emailErr);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Application submitted successfully! Check your email.',
            data: application 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Update application status - Send mail on status change
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('jobId', 'title location');
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // ✅ Send status update mail to candidate
        const statusMessages = {
            reviewing: {
                subject: `Application Under Review - ${application.jobId.title}`,
                message: `Your application for <strong>${application.jobId.title}</strong> is currently under review. Our team is carefully evaluating your profile.`
            },
            shortlisted: {
                subject: `Congratulations! Shortlisted - ${application.jobId.title}`,
                message: `Great news! You have been <strong>shortlisted</strong> for the position of <strong>${application.jobId.title}</strong>. Our HR team will contact you soon for the next round.`
            },
            rejected: {
                subject: `Application Update - ${application.jobId.title}`,
                message: `Thank you for applying for <strong>${application.jobId.title}</strong>. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We appreciate your interest and wish you all the best.`
            },
            hired: {
                subject: `Congratulations! Selected - ${application.jobId.title}`,
                message: `Congratulations! We are pleased to inform you that you have been <strong>selected</strong> for the position of <strong>${application.jobId.title}</strong>. Our HR team will reach out to you with the offer details.`
            }
        };

        if (statusMessages[status]) {
            try {
                await sendEmail({
                    to: application.email,
                    subject: statusMessages[status].subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #3B82F6;">Application Status Update</h2>
                            <p>Dear ${application.name},</p>
                            <p>${statusMessages[status].message}</p>
                            <div style="background: #F1F5F9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Position:</strong> ${application.jobId.title}</p>
                                <p style="margin: 5px 0;"><strong>Location:</strong> ${application.jobId.location}</p>
                                <p style="margin: 5px 0;"><strong>Status:</strong> ${status.toUpperCase()}</p>
                            </div>
                            <p>Best regards,<br>HR Team</p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.log('Status update email failed:', emailErr);
            }
        }

        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Other functions same...
export const getApplications = async (req, res) => {
    try {
        const { status, jobId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (jobId) query.jobId = jobId;

        const applications = await JobApplication.find(query)
        .populate('jobId', 'title location')
        .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.resume) {
            const urlParts = application.resume.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExt.split('.')[0];
            
            await cloudinary.uploader.destroy(`zotech_resumes/${publicId}`, { 
                resource_type: 'raw' 
            });
        }

        await JobApplication.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};