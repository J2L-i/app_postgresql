//Import Admin Model
const Admin = require('../models/admin.model');
//Import Stripe Model
const StripeKey = require('../models/stripe.model');
//Import Service Model
const Service = require('../models/service.model');
//Import Config Keys
const config = require('./../config/keys');
//Import Passport
const passport = require('passport');
//Import Bcryptjs
const bcryptjs = require('bcryptjs');
//Import Json Web Token
const jwt = require('jsonwebtoken');
//Import User Model
const User = require('../models/user.model');
//Import Survey Model
const Survey = require('../models/stripe.model');
//Import Organization Model
const Organzation = require('../models/organization.model');
//Import Gloabal Function
const global = require('./global');
//Import Events Model
const Event = require('../models/event.model');
//Import Plan Model
const Plan = require('../models/plan.model');
// Import Product Model
const Product = require('../models/product.model');
//Import Mails Model
const MailS = require('../models/mail.model');

exports.getOrganization = (req, res, next) => {
  Organzation.findAll()
    .then((organizations) => {
      if (organizations.length > 0) {
        const OrgSend = organizations[0];
        return res.json({
          error: false,
          typeError: '',
          message: 'Success',
          organization: OrgSend,
          redirect: false,
          redirectTo: '',
        });
      } else {
        return res.json({
          error: true,
          typeError: 'tech',
          message: 'Sorry must insert or less an organization',
          redirect: false,
          redirectTo: '',
        });
      }
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: err,
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.getTimeWork = (req, res, next) => {
  Organzation.findAll()
    .then((organizations) => {
      if (organizations.length > 0) {
        const OrgSend = organizations[0];
        return res.json({
          error: false,
          typeError: '',
          message: 'Success',
          timeWork: OrgSend.timeWork,
          redirect: false,
          redirectTo: '',
        });
      } else {
        return res.json({
          error: true,
          typeError: 'tech',
          message: 'Sorry must insert or less an organization',
          redirect: false,
          redirectTo: '',
        });
      }
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: err,
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.getAllService = (req, res, next) => {
  Service.findAll()
    .then((services) => {
      return res.json({
        error: false,
        typeError: '',
        message: 'Succeess',
        services: services,
        redirect: false,
        redirectTo: '',
      });
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: 'In Query Get All Services',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.forgetUser = (req, res, next) => {
  const email = req.body.email;
  let dateString = '';

  if (email === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (email.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validateEmail(email) === false) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry this email is not valid',
      redirect: false,
      redirectTo: '',
    });
  } else {
    let promiseDate = global.getCurrentDateuUTC();
    promiseDate.then(function(currentDateRes) {
      dateString = currentDateRes.currentDate;

      User.findAllOne({ email: email })
        .then((userUpdate) => {
          if (userUpdate) {
            let pinNumber = Math.floor(1000 + Math.random() * 9000);
            let tokenPassword = Buffer.from(
              userUpdate.id + '/' + '5h' + '/' + pinNumber,
            ).toString('base64');
            userUpdate.tokenPassword = tokenPassword;
            userUpdate.created_at_token_password = dateString;
            userUpdate.save();
            global.sendingResetPasswordMail(
              email,
              'Reset Password',
              'Reset Password',
              tokenPassword,
            );
            return res.json({
              error: false,
              typeError: '',
              message: 'we send new confirmation .Please check mail!',
              redirect: false,
              redirectTo: '',
            });
          } else {
            return res.json({
              error: true,
              typeError: 'client',
              message: 'Sorry this email not exist. Thank You',
              redirect: false,
              redirectTo: '',
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: '',
          });
        });
    });
  }
};

exports.confirmTokenPassUser = (req, res, next) => {
  const password = req.body.password;
  let tokenPassword = req.body.tokenPassword;
  let dateString = '';

  if (password === undefined || tokenPassword === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (password.length === 0 || tokenPassword.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    let promiseDate = global.getCurrentDateuUTC();
    promiseDate.then(function(currentDateRes) {
      dateString = currentDateRes.currentDate;
      let tokenDecode = Buffer.from(tokenPassword, 'base64').toString('ascii');
      tokenDecode = tokenDecode.split('/');
      let userId = tokenDecode[0];
      User.findAllByPk(userId)
        .then((user) => {
          if (tokenPassword === user.tokenPassword) {
            let created_at_token_password = new Date(
              user.created_at_token_password,
            );
            let expirationHours = parseInt(
              tokenDecode[1].match(/\d/g).join(''),
            );
            let dateExpiration = created_at_token_password.setHours(
              created_at_token_password.getHours() + 1,
            );
            let currentDate = new Date(dateString);
            if (dateExpiration > currentDate) {
              user.tokenPassword = '';
              user.created_at_token_password = '';
              const salt = bcryptjs.genSaltSync(10);
              const hash = bcryptjs.hashSync(password, salt);
              user.password = hash;
              user.save();
              return res.json({
                error: false,
                typeError: '',
                message: 'Success Reset Password,thank you.',
                redirect: false,
                redirectTo: '',
              });
            } else {
              global.forgetUserG(user.email);
              return res.json({
                error: true,
                typeError: 'client',
                message:
                  'Sorry this token Password is expired , we send new confirmation .Please check mail!',
                redirect: false,
                redirectTo: 'mailConfirm',
              });
            }
          } else {
            global.forgetUserG(user.email);
            return res.json({
              error: true,
              typeError: 'client',
              message: 'Token Password is invalid',
              redirect: false,
              redirectTo: 'mailConfirm',
            });
          }
        })
        .catch((err) => {
          return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: '',
          });
        });
    });
  }
};

exports.forgetAdmin = (req, res, next) => {
  const email = req.body.email;
  let dateString = '';

  if (email === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (email.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validateEmail(email) === false) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry this email is not valid',
      redirect: false,
      redirectTo: '',
    });
  } else {
    let promiseDate = global.getCurrentDateuUTC();
    promiseDate.then(function(currentDateRes) {
      dateString = currentDateRes.currentDate;

      Admin.findAllOne({ email: email })
        .then((adminUpdate) => {
          if (adminUpdate) {
            let pinNumber = Math.floor(1000 + Math.random() * 9000);
            let tokenPassword = Buffer.from(
              adminUpdate.id + '/' + '5h' + '/' + pinNumber,
            ).toString('base64');
            adminUpdate.tokenPassword = tokenPassword;
            adminUpdate.created_at_token_password = dateString;
            adminUpdate.save();
            global.sendingResetPasswordMail(
              email,
              'Reset Password',
              'Reset Password',
              tokenPassword,
            );
            return res.json({
              error: false,
              typeError: '',
              message: 'we send new confirmation .Please check mail!',
              redirect: false,
              redirectTo: '',
            });
          } else {
            return res.json({
              error: true,
              typeError: 'client',
              message: 'Sorry this email not exist. Thank You',
              redirect: false,
              redirectTo: '',
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: '',
          });
        });
    });
  }
};

exports.confirmTokenPassAdmin = (req, res, next) => {
  const password = req.body.password;
  let tokenPassword = req.body.tokenPassword;
  let dateString = '';

  if (password === undefined || tokenPassword === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (password.length === 0 || tokenPassword.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    let promiseDate = global.getCurrentDateuUTC();
    promiseDate.then(function(currentDateRes) {
      dateString = currentDateRes.currentDate;
      let tokenDecode = Buffer.from(tokenPassword, 'base64').toString('ascii');
      tokenDecode = tokenDecode.split('/');
      let adminId = tokenDecode[0];
      Admin.findAllByPk(adminId)
        .then((admin) => {
          if (tokenPassword === admin.tokenPassword) {
            let created_at_token_password = new Date(
              admin.created_at_token_password,
            );
            let expirationHours = parseInt(
              tokenDecode[1].match(/\d/g).join(''),
            );
            let dateExpiration = created_at_token_password.setHours(
              created_at_token_password.getHours() + 1,
            );
            let currentDate = new Date(dateString);
            if (dateExpiration > currentDate) {
              admin.tokenPassword = '';
              admin.created_at_token_password = '';
              const salt = bcryptjs.genSaltSync(10);
              const hash = bcryptjs.hashSync(password, salt);
              admin.password = hash;
              admin.save();
              return res.json({
                error: false,
                typeError: '',
                message: 'Success Reset Password,thank you.',
                redirect: false,
                redirectTo: '',
              });
            } else {
              global.forgetAdminG(admin.email);
              return res.json({
                error: true,
                typeError: 'client',
                message:
                  'Sorry this token Password is expired , we send new confirmation .Please check mail!',
                redirect: false,
                redirectTo: 'mailConfirm',
              });
            }
          } else {
            global.forgetAdminG(admin.email);
            return res.json({
              error: true,
              typeError: 'client',
              message: 'Token Password is invalid',
              redirect: false,
              redirectTo: 'mailConfirm',
            });
          }
        })
        .catch((err) => {
          return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: '',
          });
        });
    });
  }
};

exports.getStripePublicKey = (req, res, next) => {
  StripeKey.findAllOne()
    .then((stripe) => {
      if (stripe) {
        return res.json({
          error: false,
          typeError: '',
          message: 'Success',
          api_key: stripe.api_key,
          redirect: false,
          redirectTo: '',
        });
      } else {
        return res.json({
          error: true,
          typeError: 'tech',
          message: 'Sorry but before this stripe not installer',
          messageErr: 'Stripe Not Exicte',
          redirect: false,
          redirectTo: '',
        });
      }
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: 'Stripe Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.getAllPackages = (req, res, next) => {
  Plan.findAll()
    .then((plans) => {
      for (let i = 0; i < plans.length; i++) {
        plans[i].price = plans[i].price / 100;
      }

      return res.json({
        error: false,
        typeError: '',
        message: 'Success',
        plans: plans,
        redirect: false,
        redirectTo: '',
      });
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: 'Plan Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};
