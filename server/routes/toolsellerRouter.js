const express = require('express');
const ToolsellerController = require('../controllers/toolsellerController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/bakeries');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/orders', authenticateToken, OrderController.getToolsellerOrders);
router.post('/registration', upload.single('photo'), ToolsellerController.registration);
router.post('/login', ToolsellerController.login);
router.get('/auth', authenticateToken, ToolsellerController.auth);
router.get('/', ToolsellerController.findAll);
router.get('/:id', ToolsellerController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), ToolsellerController.update);
router.delete('/:id', authenticateToken, ToolsellerController.delete);


module.exports = router;