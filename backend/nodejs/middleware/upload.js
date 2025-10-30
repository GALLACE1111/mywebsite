import multer from 'multer';

// 使用記憶體儲存
const storage = multer.memoryStorage();

// 文件過濾器
const fileFilter = (req, file, cb) => {
    // 只允許圖片格式
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('無效的圖片格式。只允許 JPG, PNG, GIF, WEBP'), false);
    }
};

// 創建 multer 實例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB 限制
    },
    fileFilter: fileFilter
});

export default upload;
