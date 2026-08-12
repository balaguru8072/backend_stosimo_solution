import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5MB = 5,242,880 bytes
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Resume la PDF file mattum upload pannu!'), false);
            }
        } 
        else if (file.fieldname === 'image' || file.fieldname === 'images') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files allowed!'), false);
            }
        } 
        else {
            cb(null, true);
        }
    }
});

export default upload;