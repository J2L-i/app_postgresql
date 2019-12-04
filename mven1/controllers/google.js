const User = require('../models/user.model');
const passport = require('passport');
const keys = require('../config/keys');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports.controller = (app) => {
  passport.use(
    new GoogleStrategy(
      {
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect',
      },
      (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({ where: { googleId: profile.id } }).then(
          (currentUser) => {
            if (currentUser) {
              // already have this user
              console.log('user is: ', currentUser);
              done(null, currentUser);
            } else {
              // if not, create user in our db
              new User({
                googleId: profile.id,
                username: profile.displayName,
                thumbnail: profile._json.image.url,
              })
                .save()
                .then((newUser) => {
                  console.log('created new user: ', newUser);
                  done(null, newUser);
                });
            }
          },
        );
      },
    ),
  );
  app.get(
    '/login/google',
    passport.authenticate('google', { scope: ['email'] }),
  );

  app.get(
    '/login/google/return',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      console.log(req.user);
      res.redirect('/');
    },
  );
};
