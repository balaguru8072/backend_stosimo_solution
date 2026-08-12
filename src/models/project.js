import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category required'],
        enum: ['Web Development', 'Mobile App', 'UI/UX Design', 'E-commerce', 'Custom Software']
    },
    client: {
        type: String,
        required: [true, 'Client name required']
    },
    description: {
        type: String,
        required: [true, 'Description required']
    },
    image: {
        type: String, // Project thumbnail URL
        required: [true, 'Project image required']
    },
    images: [{ // Gallery images
        type: String
    }],
    technologies: [{
        type: String // ["React", "Node.js", "MongoDB"]
    }],
    liveUrl: {
        type: String // https://client-project.com
    },
    githubUrl: {
        type: String
    },
    completedDate: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: false // Homepage la show pannanum na true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;