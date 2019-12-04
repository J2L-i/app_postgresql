const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const userController = require('../controllers/user');
/* POST login. */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.log(err, 'err');
      return next(err);
    }

    if (!user) {
      console.log('not user');
      return res.status(200).send(info);
    }

    req.login(user, { session: false }, (err) => {
      let survey = user.surveyId;
      // If survey exists
      if (user.surveyId) {
        survey = user.surveyId;
      }

      let token = jwt.sign(
        {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            country: user.country,
            avatar: user.avatar,
            status: user.status,
            account_type: user.account_type,
            zipcode: user.zipcode,
            statusAccount: user.statusAccount,
            typePayment: user.typePayment,
            surveyId: survey,
            customerId: user.customerId,
            statusCard: user.statusCard,
          },
        },
        'secret',
        { expiresIn: '22h' },
      );
      let resJson = {};
      let promiseAuth = userController.verifyMail(user);
      promiseAuth.then(function(value) {
        resJson = value;
        resJson['token'] = token;
        resJson['user'] = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          country: user.country,
          avatar: user.avatar,
          status: user.status,
          account_type: user.account_type,
          zipcode: user.zipcode,
          statusAccount: user.statusAccount,
          typePayment: user.typePayment,
          surveyId: survey,
          customerId: user.customerId,
          statusCard: user.statusCard,
        };
        return res.json(resJson);
      });
    });
  })(req, res);
});

router.post('/login/google', function(req, res, next) {
  passport.authenticate(
    'local-google',
    { session: false },
    (err, user, info) => {
      if (err) {
        console.log(err, 'err');
        return next(err);
      }

      if (!user) {
        console.log('not user');
        return res.status(200).send(info);
      }

      req.login(user, { session: false }, (err) => {
        let survey = user.survey;
        if (survey !== 'In progress') {
          survey = JSON.parse(survey);
        }
        const token = jwt.sign(
          {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name,
              country: user.country,
              avatar: user.avatar,
              status: user.status,
              account_type: user.account_type,
              zipcode: user.zipcode,
              statusAccount: user.statusAccount,
              typePayment: user.typePayment,
              surveyId: survey,
              customerId: user.customerId,
              statusCard: user.statusCard,
            },
          },
          'secret',
          { expiresIn: '22h' },
        );
        const resJson = userController.verifyMail(user);
        resJson['token'] = token;
        resJson['user'] = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          country: user.country,
          avatar: user.avatar,
          status: user.status,
          account_type: user.account_type,
          zipcode: user.zipcode,
          statusAccount: user.statusAccount,
          typePayment: user.typePayment,
          surveyId: survey,
          customerId: user.customerId,
          statusCard: user.statusCard,
        };
        return res.json(resJson);
      });
    },
  )(req, res);
});

router.post('/admin/login', function(req, res, next) {
  passport.authenticate(
    'admin-local',
    { session: false },
    (err, admin, info) => {
      if (err) {
        //console.log(err, 'err');
        return next(err);
      }

      if (!admin) {
        //console.log('not admin');
        return res.status(200).send(info);
      }

      req.login(admin, { session: false }, (err) => {
        const token = jwt.sign(
          {
            admin: {
              id: admin.id,
              email: admin.email,
              fullName: admin.full_name,
            },
          },
          'secret',
          { expiresIn: '22h' },
        );
        return res.json({
          error: false,
          typeError: '',
          message: 'Login Success',
          redirect: false,
          redirectTo: '',
          token: token,
          admin: {
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
          },
        });
      });
    },
  )(req, res);
});

router.get('/zohocrm', passport.authenticate('zoho-crm'));

router.get('/zohocrm/callback', function(req, res) {
  // Successful authentication, redirect home.
  console.log('oki');
  res.redirect('/');
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get('/google/callback', passport.authenticate('google'), function(
  req,
  res,
) {
  // Successful authentication, redirect home.
  res.send('done google');
});

module.exports = router;
