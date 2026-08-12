import Project from '../models/project.js';
import cloudinary from '../config/cloudinary.js';
import uploadToCloudinary from '../utils/cloudinaryUpload.js';

// @desc Get all projects for website
// @route GET /api/projects
// @access Public
export const getProjects = async (req, res) => {
    try {
        const { category, featured } = req.query;
        let query = { isActive: true };
        
        if (category) query.category = category;
        if (featured) query.featured = featured === 'true';

        const projects = await Project.find(query).sort({ order: 1, completedDate: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get single project
// @route GET /api/projects/:id
// @access Public
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Create new project with image upload
// @route POST /api/projects
// @access Private/Admin
export const createProject = async (req, res) => {
    try {
        const projectData = {...req.body };

        // 1. Thumbnail image upload
        if (req.files?.image && req.files.image[0]) {
            const result = await uploadToCloudinary(req.files.image[0].buffer, 'zotech_projects');
            projectData.image = result.secure_url;
        }

        // 2. Gallery images upload
        if (req.files?.images && req.files.images.length > 0) {
            const uploadPromises = req.files.images.map(file => 
                uploadToCloudinary(file.buffer, 'zotech_projects')
            );
            const results = await Promise.all(uploadPromises);
            projectData.images = results.map(r => r.secure_url);
        }

        // 3. Technologies comma separated string ah vandha array aaku
        if (typeof projectData.technologies === 'string') {
            projectData.technologies = projectData.technologies.split(',').map(t => t.trim());
        }

        const project = await Project.create(projectData);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Update project with image
// @route PUT /api/projects/:id
// @access Private/Admin
export const updateProject = async (req, res) => {
    try {
        const projectData = {...req.body };
        const oldProject = await Project.findById(req.params.id);

        if (!oldProject) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // 1. New thumbnail upload panna old ah delete pannu
        if (req.files?.image && req.files.image[0]) {
            if (oldProject.image) {
                const publicId = oldProject.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`zotech_projects/${publicId}`);
            }
            const result = await uploadToCloudinary(req.files.image[0].buffer, 'zotech_projects');
            projectData.image = result.secure_url;
        }

        // 2. New gallery images add panna
        if (req.files?.images && req.files.images.length > 0) {
            const uploadPromises = req.files.images.map(file => 
                uploadToCloudinary(file.buffer, 'zotech_projects')
            );
            const results = await Promise.all(uploadPromises);
            const newImages = results.map(r => r.secure_url);
            projectData.images = [...oldProject.images,...newImages];
        }

        if (typeof projectData.technologies === 'string') {
            projectData.technologies = projectData.technologies.split(',').map(t => t.trim());
        }

        const project = await Project.findByIdAndUpdate(req.params.id, projectData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc Delete project + cloudinary images
// @route DELETE /api/projects/:id
// @access Private/Admin
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Cloudinary la irukura images delete pannu
        const deletePromises = [];
        
        if (project.image) {
            const publicId = project.image.split('/').pop().split('.')[0];
            deletePromises.push(cloudinary.uploader.destroy(`zotech_projects/${publicId}`));
        }

        if (project.images && project.images.length > 0) {
            project.images.forEach(img => {
                const publicId = img.split('/').pop().split('.')[0];
                deletePromises.push(cloudinary.uploader.destroy(`zotech_projects/${publicId}`));
            });
        }

        await Promise.all(deletePromises);
        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};