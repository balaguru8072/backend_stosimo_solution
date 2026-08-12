import mongoose from 'mongoose';

const serviceMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone required']
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        match: [/\S+@\S+\.\S+/, 'Please enter valid email']
    },
    service: {
        type: String,
        required: [true, 'Service required']
    },
    business: {
        type: String,
        required: [true, 'Business type required']
    },
    location: {
        type: String,
        required: [true, 'Location required']
    },
    message: {
        type: String,
        required: [true, 'Message required']
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'closed'],
        default: 'new'
    }
}, { timestamps: true });

const ServiceMessage = mongoose.model('ServiceMessage', serviceMessageSchema);
export default ServiceMessage;