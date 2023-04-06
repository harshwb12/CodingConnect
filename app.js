if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expresserror');
const axios = require('axios').default;
const User = require('./models/user');
const MongoStore = require("connect-mongo")(session);
const { isLoggedIn } = require('./middleware');

const announcementRoutes = require('./routes/announcement');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const problemsetRoutes = require('./routes/problemset');

const dbUrl = 'mongodb+srv://Iamharsh12gupta:<sa77tJA03pqD85Jm>@cluster0.z34op.mongodb.net/nemp?retryWrites=true&w=majority' || 'mongodb://localhost:27017/nemp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('database is connected');
    })
    .catch(err => {
        console.log(err);
    })


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = 'thisisasecret';

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (error) {
    console.log(error);
});

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxage: 1000 * 60 * 60 * 24 * 7
    },

}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', groupRoutes);
app.use('/', userRoutes);
app.use('/group/:id1/problemset', problemsetRoutes);
app.use('/group/:id1/announcement', announcementRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/upcomingcontest', isLoggedIn, catchAsync(async (req, res) => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dt = d.getUTCDate();
    const h = d.getUTCHours();
    const min = d.getUTCMinutes();
    const s = d.getUTCSeconds();
    var nd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const y1 = nd.getUTCFullYear();
    const m1 = nd.getUTCMonth() + 1;
    const dt1 = nd.getUTCDate();
    const h1 = nd.getUTCHours();
    const min1 = nd.getUTCMinutes();
    const s1 = nd.getUTCSeconds();
    var str = `${y}-${m}-${dt}T${h}:${min}:${s}`;
    var end = `${y1}-${m1}-${dt1}T${h1}:${min1}:${s1}`;
    try {
        const result1 = await axios.get(`https://clist.by:443/api/v2/contest/?resource=codeforces.com&start__gte=${str}&end__lte=${end}&username=harsh20je0397&api_key=af26f9fc5441d1ecc5ef8bea072aac11795d57a5`);
        const result2 = await axios.get(`https://clist.by:443/api/v2/contest/?resource=atcoder.jp&start__gte=${str}&end__lte=${end}&username=harsh20je0397&api_key=af26f9fc5441d1ecc5ef8bea072aac11795d57a5`);
        const result3 = await axios.get(`https://clist.by:443/api/v2/contest/?resource=codechef.com&start__gte=${str}&end__lte=${end}&username=harsh20je0397&api_key=af26f9fc5441d1ecc5ef8bea072aac11795d57a5`);
        const cf = result1.data.objects; const cfl = cf.length;
        const at = result2.data.objects; const atl = at.length;
        const cc = result3.data.objects; const ccl = cc.length;
        cf.sort((a, b) => a.start < b.start ? -1 : 1);
        at.sort((a, b) => a.start < b.start ? -1 : 1);
        cc.sort((a, b) => a.start < b.start ? -1 : 1);
        res.render('upcomingct/index', { cf, cfl, at, atl, cc, ccl });
    }
    catch (e) {
        console.log(e);
    }
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = 'something went wrong' }
    console.log(err);
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('serving on port 3000');
})
