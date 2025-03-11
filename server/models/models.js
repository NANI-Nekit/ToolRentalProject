const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Модель пользователя
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    birthDate: { type: DataTypes.DATE, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    photo: { type: DataTypes.STRING, allowNull: true },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { timestamps: true });

// Модель продавца инструментов
const Toolseller = sequelize.define('Toolseller', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    contactPerson: { type: DataTypes.STRING, allowNull: false },
    registrationNumber: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: true },
    establishedYear: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

// Модель продукта (инструмента)
const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: true },
    condition: {
        type: DataTypes.ENUM('new', 'used'),
        allowNull: false,
        defaultValue: 'new'
    },
    warranty: { type: DataTypes.STRING, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    photo: { type: DataTypes.STRING, allowNull: true },
    documentation: { type: DataTypes.STRING, allowNull: true },
    toolsellerId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });


// Модель корзины
const Basket = sequelize.define('Basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

// Модель элемента корзины
const BasketItem = sequelize.define('BasketItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    basketId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

// Модель заказа
const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deliveryAddress: { type: DataTypes.STRING, allowNull: false },
    totalCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false
    },
    paymentMethod: { type: DataTypes.STRING, allowNull: false },
    trackingNumber: { type: DataTypes.STRING, allowNull: true },
    orderDate: { type: DataTypes.DATE, allowNull: false },
    // Новые поля для поддержки аренды
    orderType: {
        type: DataTypes.ENUM('purchase', 'rental'),
        allowNull: false,
        defaultValue: 'purchase'
    },
    rentalStartDate: { type: DataTypes.DATE, allowNull: true },
    rentalEndDate: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

// Модель элемента заказа
const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    priceAtPurchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { timestamps: true });

// Модель отзыва
const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    shortReview: { type: DataTypes.STRING, allowNull: false },
    reviewText: { type: DataTypes.TEXT, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    toolsellerId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

// Корзина принадлежит пользователю
User.hasOne(Basket, { foreignKey: 'userId' });
Basket.belongsTo(User, { foreignKey: 'userId' });

// Пользователь может делать заказы
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Продавец имеет заказы
Toolseller.hasMany(Order, { foreignKey: 'toolsellerId' });
Order.belongsTo(Toolseller, { foreignKey: 'toolsellerId' });

// Продавец имеет товары
Toolseller.hasMany(Product, { foreignKey: 'toolsellerId' });
Product.belongsTo(Toolseller, { foreignKey: 'toolsellerId' });

// Продавец получает отзывы
Toolseller.hasMany(Review, { foreignKey: 'toolsellerId' });
Review.belongsTo(Toolseller, { foreignKey: 'toolsellerId' });

// Заказ может иметь отзыв
Order.hasOne(Review, { foreignKey: 'orderId' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

// Связь «многие-ко-многим» между корзиной и товаром через BasketItem
Basket.belongsToMany(Product, { through: BasketItem, foreignKey: 'basketId', otherKey: 'productId' });
Product.belongsToMany(Basket, { through: BasketItem, foreignKey: 'productId', otherKey: 'basketId' });

// Связь «многие-ко-многим» между заказом и товаром через OrderItem
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId', otherKey: 'productId' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId', otherKey: 'orderId' });

// Дополнительные связи для OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Связи для BasketItem
Basket.hasMany(BasketItem, { foreignKey: 'basketId' });
BasketItem.belongsTo(Basket, { foreignKey: 'basketId' });
Product.hasMany(BasketItem, { foreignKey: 'productId' });
BasketItem.belongsTo(Product, { foreignKey: 'productId' });

// Пользователь может оставлять отзывы
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    Toolseller,
    Product,
    Basket,
    BasketItem,
    Order,
    OrderItem,
    Review,
    sequelize,
};