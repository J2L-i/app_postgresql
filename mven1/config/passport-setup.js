const passport = require('passport');
var ZohoCRMStrategy = require('passport-zoho-crm').Strategy;
const User = require('./../models/user.model');
const passportJWT = require('passport-JWT');
const keys = require('./keys');
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = keys.SECRET;
  passport.use(
    new JwtStrategy(opts, function(jwt_payload, done) {
      User.findOne({ id: jwt_payload.id }, function(err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ id }).then((user) => {
      done(null, user);
    });
  });

  passport.use(
    new ZohoCRMStrategy(
      {
        clientID: keys.zohocrm.clientID,
        clientSecret: keys.zohocrm.clientSecret,
        redirect_URL: 'http://127.0.0.1:3000/auth/zohocrm/callback',
        scope: 'ZohoCRM.modules.READ',
        response_type: 'code',
        access_type: 'offline',
      },
      function(accessToken, refreshToken, profile, cb) {
        // ...
      },
    ),
  );
};
