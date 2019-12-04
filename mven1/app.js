const path = require('path');
const express = require('express');
const app = express();

//Global Project Work
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Global Project Work

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// View engine setup
var exphbs = require('express-handlebars');
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
  }),
);
app.set('view engine', 'handlebars');
app.set('views', 'views');

//Add Cors
var cors = require('cors');
app.use(
  cors({
    origin: '*',
  }),
);

var Hoek = require('hoek');
var malicious_payload = '{"__proto__":{"oops":"It works !"}}';

var a = {};
//console.log("Before : " + a.oops);
Hoek.merge({}, JSON.parse(malicious_payload));
//console.log("After : " + a.oops);

//Get and Set Routes Client
const signupRouter = require('./routes/signup');
app.use('/api', signupRouter);

//Import JWT WenToken
const jwt = require('jsonwebtoken');

//Get Config Key
const keys = require('./config/keys');

//Add Passport
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./config/passport');
app.use(
  cookieSession({
    name: 'session',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
);
app.use(passport.initialize());
app.use(passport.session());

//Auth Setup
const auth = require('./routes/auth');
app.use('/api/auth', auth);

//Access routes after login with middleware
const routeClient = require('./routes/client');
app.use(
  '/api/client',
  passport.authenticate('jwt', { session: false }),
  routeClient,
);

//Access routes after login with middleware
const routeAdmin = require('./routes/admin');
app.use(
  '/api/admin',
  passport.authenticate('admin-jwt', { session: false }),
  routeAdmin,
);

//Access routes General
const routeGen = require('./routes/general');
app.use('/api', routeGen);

app.get('/', (req, res) => {
  res.render('contact');
});

/*const stripeNode = require("stripe")("sk_test_zT64byEOqxHOliQedZ0ocumz");
stripeNode.subscriptions.retrieve(
    'sub_FY7fKD7lqVhy7z',
    function (err, subscription) {
        if (err) {
            console.log(err,'err');
        }
        console.log(subscription,'subscription');
        console.log(subscription.status,'subscription status');
    }
);*/

//Install And Connect Mangoose
// const mongoose = require('mongoose');
// mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true, useCreateIndex: true }).then(result => {
//   //console.log(mongoose.connection.readyState);
//   app.listen(3000);
// }).catch(err => {
//   console.log(err);
// });

/**
 * ================================================
 * Database setup
 * ================================================
 */
const db = require('./config/postgres');

const User = require('./models/user.model');
const Admin = require('./models/admin.model');
const Survey = require('./models/survey.model');

// Associations
User.belongsTo(Survey);

// Enable it to auto generate tables
// !!! Disable for production purpose !!!
// db.sync({ force: true });

db.authenticate()
  .then(() => {
    console.log('Postgres connection has been established successfully.');

    // Create a new admin (execute once)
    // Admin.create({
    //   full_name: 'Marcin Stawowczyk',
    //   email: 'x@gmail.com',
    //   country: 'Austria',
    //   password: '$2a$10$ssyk7aCiZFJ.VP6Z5zNttOMFkdGlftbjvkVgzQ.QoYAkbNtcIyWfW', // -> magic321
    //   tokenEmail: 'xdd',
    //   authToken: 'In Progress',
    // }).then(() => {
    //   console.log('Admin created.');
    // });

    // Start Express server
    app.listen(3000, async () => {
      console.log('Server started on port 3000!');
    });
  })
  .catch((error) => console.log(error));
