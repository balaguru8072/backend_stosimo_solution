import Service from '../models/serviceSchema.js';

export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ✅ Itha add pannu - Edit ku theva
export const getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};