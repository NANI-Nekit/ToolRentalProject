const Router = require('express').Router;
const router = new Router();

router.use('/users', require('./userRouter'));
router.use('/reviews', require('./reviewRouter'));
router.use('/products', require('./productRouter'));
router.use('/toolsellers', require('./toolsellerRouter'));
router.use('/orders', require('./orderRouter'));
router.use('/baskets', require('./basketRouter'));


module.exports = router;