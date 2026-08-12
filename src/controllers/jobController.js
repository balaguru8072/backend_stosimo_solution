import Job from '../models/job.js';

// @desc Get all active jobs
// @route GET /api/jobs
// @access Public
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get single job
// @route GET /api/jobs/:id
// @access Public
export const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Create job
// @route POST /api/jobs
// @access Private/Admin
export const createJob = async (req, res) => {
    try {
        const jobData = {...req.body };
        if (typeof jobData.requirements === 'string') {
            jobData.requirements = jobData.requirements.split(',').map(r => r.trim());
        }
        if (typeof jobData.responsibilities === 'string') {
            jobData.responsibilities = jobData.responsibilities.split(',').map(r => r.trim());
        }
        if (typeof jobData.skills === 'string') {
            jobData.skills = jobData.skills.split(',').map(r => r.trim());
        }
        
        const job = await Job.create(jobData);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Update job
// @route PUT /api/jobs/:id
// @access Private/Admin
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Delete job
// @route DELETE /api/jobs/:id
// @access Private/Admin
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};