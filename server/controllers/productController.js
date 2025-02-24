const { Product, Toolseller } = require('../models/models');
const fs = require('fs');
const path = require('path');

class ProductController {
    async create(req, res) {
        try {
            // При создании товара теперь ожидаются дополнительные поля
            const { name, description, price, category, brand, model, condition, warranty, stock } = req.body;
            const toolsellerId = req.user.toolsellerId;

            if (!toolsellerId) {
                return res.status(403).json({ message: 'Нет прав для создания товара' });
            }

            const toolseller = await Toolseller.findByPk(toolsellerId);
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            // Формируем пути для фото и документации, если они были загружены
            const photoPath = req.files && req.files.photo
                ? `/uploads/products/${req.files.photo[0].filename}`
                : null;
            const documentationPath = req.files && req.files.documentation
                ? `/uploads/products/${req.files.documentation[0].filename}`
                : null;

            const product = await Product.create({
                name,
                description,
                price,
                category,
                brand,
                model,
                condition,   // если не передано, по умолчанию будет 'new'
                warranty,
                stock,
                toolsellerId,
                photo: photoPath,
                documentation: documentationPath,
            });

            res.status(201).json(product);
        } catch (error) {
            console.error('Ошибка при создании продукта:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: Toolseller }],
            });
            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }
            res.json(product);
        } catch (error) {
            console.error('Ошибка при получении продукта:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const products = await Product.findAll({
                include: [{ model: Toolseller }],
            });
            res.json(products);
        } catch (error) {
            console.error('Ошибка при получении списка продуктов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            // При обновлении также поддерживаются дополнительные поля
            const { name, description, price, category, brand, model, condition, warranty, stock } = req.body;
            const productId = req.params.id;

            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }

            let updatedData = { name, description, price, category, brand, model, condition, warranty, stock };

            // Если загружено новое фото, обновляем поле photo
            if (req.files && req.files.photo) {
                const uploadDir = path.join(__dirname, '../uploads/products');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/products/${productId}_${req.files.photo[0].originalname}`;
                const filePath = path.join(uploadDir, `${productId}_${req.files.photo[0].originalname}`);

                fs.writeFileSync(filePath, fs.readFileSync(req.files.photo[0].path));
                updatedData.photo = photoPath;
            }

            // Если загружена документация, обновляем поле documentation
            if (req.files && req.files.documentation) {
                const uploadDir = path.join(__dirname, '../uploads/products');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const documentationPath = `/uploads/products/${productId}_${req.files.documentation[0].originalname}`;
                const filePath = path.join(uploadDir, `${productId}_${req.files.documentation[0].originalname}`);

                fs.writeFileSync(filePath, fs.readFileSync(req.files.documentation[0].path));
                updatedData.documentation = documentationPath;
            }

            await product.update(updatedData);

            res.json(product);
        } catch (error) {
            console.error('Ошибка при обновлении продукта:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }

            await product.destroy();

            res.status(200).json({ message: 'Продукт успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении продукта:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findByToolseller(req, res) {
        try {
            const { toolsellerId } = req.params;

            const toolseller = await Toolseller.findByPk(toolsellerId);
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            const products = await Product.findAll({ where: { toolsellerId } });

            res.json(products);
        } catch (error) {
            console.error('Ошибка при получении товаров продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ProductController();
