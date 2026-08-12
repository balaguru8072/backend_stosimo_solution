import cloudinary  from '../config/cloudinary.js'; // ✅ curly braces

const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: folder,
                resource_type: resourceType, // ⭐ PDF ku 'raw' varum
                // Image mattum resize pannanum, PDF ku transformation venam
                transformation: resourceType === 'image'? [{ width: 1200, height: 800, crop: 'limit' }] : undefined
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

export default uploadToCloudinary;