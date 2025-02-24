const { Toolseller, Product, Review, User, sequelize } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class ToolsellerController {
    async registration(req, res) {
        try {
            const {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password,
                address,
                establishedYear
            } = req.body;

            const existingToolseller = await Toolseller.findOne({ where: { email } });
            if (existingToolseller) {
                return res.status(400).json({ message: 'Продавец с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const toolseller = await Toolseller.create({
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password: passwordHash,
                address,
                establishedYear: establishedYear ? parseInt(establishedYear) : null,
                logo: req.file ? `/uploads/toolsellers/${req.file.filename}` : null,
            });

            res.status(201).json(toolseller);
        } catch (error) {
            console.error('Ошибка при регистрации продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const toolseller = await Toolseller.findOne({ where: { email } });
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            const isMatch = await bcrypt.compare(password, toolseller.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { toolsellerId: toolseller.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, user: toolseller });
        } catch (error) {
            console.error('Ошибка при входе продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const toolseller = await Toolseller.findByPk(decoded.toolsellerId);

            res.json(toolseller);
        } catch (error) {
            console.error('Ошибка при аутентификации продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const { id } = req.params;

            const toolseller = await Toolseller.findByPk(id, {
                include: [
                    { model: Product },
                    {
                        model: Review,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                    },
                ],
            });

            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            res.json(toolseller);
        } catch (error) {
            console.error('Ошибка при получении продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const { name, address, averageRating, limit, offset } = req.query;

            const whereConditions = {};
            if (name) {
                // Фильтрация по полю companyName
                whereConditions.companyName = { [Op.iLike]: `%${name}%` };
            }
            if (address) {
                whereConditions.address = { [Op.iLike]: `%${address}%` };
            }

            let havingConditions = null;
            if (averageRating) {
                havingConditions = sequelize.where(
                    sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                    {
                        [Op.gte]: parseFloat(averageRating)
                    }
                );
            }

            const { rows, count } = await Toolseller.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Review,
                        attributes: [],
                    },
                ],
                attributes: {
                    include: [
                        [
                            sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('Reviews.rating')), 1),
                            'averageRating'
                        ],
                        [
                            sequelize.fn('COUNT', sequelize.col('Reviews.id')),
                            'reviewCount'
                        ],
                    ],
                },
                group: ['Toolseller.id'],
                having: havingConditions,
                order: [['companyName', 'ASC']],
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
                subQuery: false,
            });

            res.json({
                toolsellers: rows,
                total: count.length,
            });
        } catch (error) {
            console.error('Ошибка при получении списка продавцов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password,
                address,
                establishedYear
            } = req.body;
            const toolsellerId = req.params.id;

            const toolseller = await Toolseller.findByPk(toolsellerId);
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            let updatedData = {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                address,
                establishedYear: establishedYear ? parseInt(establishedYear) : toolseller.establishedYear,
            };

            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/toolsellers');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/toolsellers/${toolsellerId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${toolsellerId}_${req.file.originalname}`), fs.readFileSync(req.file.path));
                updatedData.logo = photoPath;
            }

            await toolseller.update(updatedData);

            res.json(toolseller);
        } catch (error) {
            console.error('Ошибка при обновлении продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const toolseller = await Toolseller.findByPk(req.params.id);
            if (!toolseller) {
                return res.status(404).json({ message: 'Продавец не найден' });
            }

            await toolseller.destroy();

            res.status(200).json({ message: 'Продавец успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении продавца:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ToolsellerController();
