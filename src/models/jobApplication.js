import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone required']
    },
    subject: {
        type: String
    },
    message: {
        type: String
    },
    resume: {
        type: String, // Cloudinary PDF URL
        required: [true, 'Resume required']
    },
    status: {
        type: String,
        enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
        default: 'new'
    }
}, { timestamps: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;