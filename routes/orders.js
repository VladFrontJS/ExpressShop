const { Router, request } = require('express');
const Order = require('../models/order');
const router = Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id }).populate('user.userId');
        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: orders.map(order => {
                return {
                    ...order._doc,
                    price: order.courses.reduce((total, course) => {
                        return (total += course.count * course.course.price);
                    }, 0),
                };
            }),
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseId');

        const courses = user.cart.items.map(el => ({
            count: el.count,
            course: { ...el.courseId._doc },
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            courses: courses,
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
