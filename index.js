const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const keys = require('./keys');

const PORT = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers'),
});
const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: keys.SESION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
    })
);
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'https:'],
                'script-src-elem': ["'self'", 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js', "'unsafe-inline'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);

async function start() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose
            .connect(keys.MONGODB_URI, { useNewUrlParser: true })
            .then(() => console.log('mongoose connected'))
            .catch(e => console.log(e));

        app.listen(PORT, () => {
            console.log(`Server is runing on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();
