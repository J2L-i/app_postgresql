//imporo passport local
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Import user model
const User = require('../models/user.model');

//Import admin model
const Admin = require('../models/admin.model');

//Import bcrypt js
const bcryptjs = require('bcryptjs');

//Import Global Controller
const global = require('../controllers/global');

//Import passport Jwt
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

//Imprt Passpoet Keys App
const keys = require('./keys');

//Imprt Gloabal Function
const gloabal = require('../controllers/global');

//Import Request to execut url
const request = require('request');

//Import Passport Zoho
const ZohoCRMStrategy = require('passport-zoho-crm').Strategy;

//Import GoogleStrategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;

//Import JWT WenToken
const jwt = require('jsonwebtoken');

//Func to set Session and Auto User in NodeJS
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    function(email, password, done) {
      //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
      return User.findOne({ where: { email } })
        .then((user) => {
          if (user) {
            if (bcryptjs.compareSync(password, user.password)) {
              if (user.statusAccount === 'active') {
                done(null, user);
              } else {
                done(null, false, {
                  error: true,
                  message: 'Sorry this account is deactivate',
                });
              }
            } else {
              done(null, false, {
                error: true,
                message: 'Incorrect email or password',
              });
            }
          } else {
            done(null, false, {
              error: true,
              message: 'Incorrect email or password',
            });
          }
        })
        .catch((err) => done(err));
    },
  ),
);

//Func to set Session and Auto With Google in NodeJS
passport.use(
  'local-google',
  new LocalStrategy(
    {
      usernameField: 'token',
      passwordField: 'type',
    },
    function(token, type, done) {
      if (type === 'google') {
        const googleInfo = jwt.decode(token);
        const email = googleInfo.email;
        const last_name = googleInfo.given_name;
        const first_name = googleInfo.family_name;
        const country = '';
        const zipcode = '';
        const avatar = googleInfo.picture;
        const nameGoogle = googleInfo.name;
        let authTokenRes = '';
        let accessTokenRes = '';
        let dateString = '';

        let promiseDate = global.getCurrentDateuUTC();
        return promiseDate.then(function(currentDateRes) {
          dateString = currentDateRes.currentDate;
          if (googleInfo.email_verified === true) {
            User.findOne({ where: { email } })
              .then((userEx) => {
                if (userEx) {
                  if (userEx.statusAccount === 'active') {
                    done(null, userEx);
                  } else {
                    done(null, false, {
                      error: false,
                      typeError: '',
                      message: 'Sorry this account is deactivate',
                      redirect: false,
                      redirectTo: '',
                    });
                  }
                } else {
                  let promisezoho = global.zohoCrmV2({
                    firstName: first_name,
                    lastName: last_name,
                    email: email,
                    country: country,
                  });
                  promisezoho.then(function(valuZoho) {
                    if (valuZoho.error === true) {
                      const userSave = new User({
                        full_name: first_name + ' ' + last_name,
                        email: email,
                        country: country,
                        password: '',
                        status: 'survey',
                        avatar: '',
                        account_type: 'google',
                        survey: 'In progress',
                        zipcode: '',
                        tokenEmail: 'In progress',
                        tokenPassword: '',
                        created_at_token_password: '',
                        customerId: '',
                        subscriptions: [],
                        statusCard: 'false',
                        statusAccount: 'active',
                        typePayment: '',
                        created_at_token_mail: dateString,
                        last_login: dateString,
                        createdAt: dateString,
                      });
                      userSave
                        .save()
                        .then((resultUser) => {
                          done(null, resultUser);
                        })
                        .catch((err) => {
                          done(null, false, {
                            error: true,
                            typeError: 'backend',
                            message:
                              'Something went wrong. Please try again after some time!',
                            redirect: false,
                            redirectTo: '',
                            zoho: valuZoho,
                          });
                        });
                    } else {
                      const userSave = new User({
                        full_name: first_name + ' ' + last_name,
                        email: email,
                        country: country,
                        password: '',
                        status: 'survey',
                        avatar: '',
                        account_type: 'google',
                        survey: 'In progress',
                        zipcode: '',
                        tokenEmail: 'In progress',
                        tokenPassword: '',
                        created_at_token_password: '',
                        customerId: '',
                        statusCard: 'false',
                        statusAccount: 'active',
                        subscriptions: [],
                        typePayment: '',
                        created_at_token_mail: dateString,
                        last_login: dateString,
                        createdAt: dateString,
                      });
                      userSave
                        .save()
                        .then((resultUser) => {
                          done(null, resultUser);
                        })
                        .catch((err) => {
                          done(null, false, {
                            error: true,
                            typeError: 'backend',
                            message:
                              'Something went wrong. Please try again after some time!',
                            redirect: false,
                            redirectTo: '',
                            zoho: valuZoho,
                          });
                        });
                    }
                  });
                }
              })
              .catch((err) => {
                done(null, false, {
                  error: true,
                  typeError: 'backend',
                  redirect: false,
                  messageErr: err,
                  redirectTo: '',
                  message:
                    'Something went wrong. Please try again after some time!',
                });
              });
          } else {
            done(null, false, {
              error: true,
              typeError: 'client',
              redirect: false,
              redirectTo: '',
              message: 'Sorry, this compte is not active',
            });
          }
        });
      } else {
        done(null, false, {
          error: true,
          typeError: 'tech',
          redirect: false,
          redirectTo: '',
          message: 'this authorization valid just by google login',
        });
      }
    },
  ),
);

//Func to set Session and Auto Admin in NodeJS
passport.use(
  'admin-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    function(email, password, done) {
      //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
      return Admin.findOne({ where: { email } })
        .then((admin) => {
          if (admin) {
            if (bcryptjs.compareSync(password, admin.password)) {
              done(null, admin);
            } else {
              done(null, false, {
                error: true,
                message: 'Incorrect email or password',
              });
            }
          } else {
            done(null, false, {
              error: true,
              message: 'Incorrect email or password',
            });
          }
        })
        .catch((err) => done(err));
    },
  ),
);

//Func To Verify Access User (Middleware)
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    function(jwtPayload, cb) {
      console.log(jwtPayload);
      return User.findOne({ where: { email: jwtPayload.user.email } })
        .then((user) => {
          if (user) {
            return cb(null, user);
          } else {
            return cb(null, false, {
              error: true,
              message: 'Incorrect email or password',
            });
          }
        })
        .catch((err) => {
          console.log(err, err);
          return cb(err);
        });
    },
  ),
);

passport.use(
  'admin-jwt',
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    function(jwtPayload, cb) {
      return Admin.findOne({ email: jwtPayload.admin.email })
        .then((admin) => {
          if (admin) {
            return cb(null, admin);
          } else {
            return cb(null, false, {
              error: true,
              message: 'Incorrect email or password',
            });
          }
        })
        .catch((err) => {
          console.log(err, err);
          return cb(err);
        });
    },
  ),
);

//Oauth with google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID:
        '357333314140-potmc763ddpu884dilksgkcr0p9poosu.apps.googleusercontent.com',
      clientSecret: 'aeYuzxoaADdMKjeks1XREr4A',
      callbackURL: '/api/auth/google/callback',
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log('passport google');
      console.log(profile);
      /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return cb(err, user);
            });*/
    },
  ),
);

passport.use(
  new ZohoCRMStrategy(
    {
      clientID: '1000.DU4KD2QWARJO84212J8FVNPO6UFSMH',
      clientSecret: '3ebdb0336de1f4595e293f794809acf43b2c82d813',
      redirect_URL: '/api/auth/zohocrm/callback',
      scope: 'users.all',
      response_type: 'code',
      access_type: 'offline',
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log('sfs');
    },
  ),
);
