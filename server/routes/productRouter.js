const express = require('express');
const ProductController = require('../controllers/productController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/products');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

// Используем upload.fields для загрузки нескольких файлов
const cpUpload = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documentation', maxCount: 1 },
]);

const router = express.Router();

router.post('/', authenticateToken, cpUpload, ProductController.create);
router.get('/', ProductController.findAll);
router.get('/toolseller/:toolsellerId', ProductController.findByToolseller);
router.get('/:id', ProductController.findOne);
router.put('/:id', authenticateToken, cpUpload, ProductController.update);
router.delete('/:id', authenticateToken, ProductController.delete);

module.exports = router;