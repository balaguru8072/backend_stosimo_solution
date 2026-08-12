import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Service title required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description required']
    },
    icon: {
        type: String,
        default: 'code'
    },
    features: [{
        type: String
    }],
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;