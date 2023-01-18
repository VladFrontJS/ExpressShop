const { Router } = require('express');
const router = Router();
const Course = require('../models/course');
const auth = require('../middleware/auth');

function mapCartItems(cart) {
    return cart.items.map(el => ({ ...el.courseId._doc, id: el.courseId.id, count: el.count }));
}

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return (total += course.price * course.count);
    }, 0);
}

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId');
    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: computePrice(courses),
    };
    res.status(200).json(cart);
});

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId');
    const courses = mapCartItems(user.cart);
    res.render('card', {
        title: 'Basket',
        isCard: true,
        courses: courses,
        price: computePrice(courses),
    });
});

module.exports = router;
