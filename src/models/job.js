import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location required'],
        default: 'Chennai, India'
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    experience: {
        type: String, // "2-4 years"
        required: true
    },
    description: {
        type: String,
        required: [true, 'Job description required']
    },
    requirements: [{
        type: String // ["React.js", "Node.js", "3+ years exp"]
    }],
    responsibilities: [{
        type: String
    }],
    salary: {
        type: String // "5-8 LPA" or "Negotiable"
    },
    skills: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true // false = closed
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;