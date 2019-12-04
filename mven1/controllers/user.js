//Import User Model
const User = require("../models/user.model");
//Import Admin Model
const Admin = require("../models/admin.model");
//Import Survey Model
const Survey = require("../models/survey.model");
//Import Organization Model
const Organization = require("../models/organization.model");
//Import Service Model
const Service = require("../models/service.model");
//Import Event Model
const Event = require("../models/event.model");
//Import Passport
const passport = require('passport');
const bcryptjs = require('bcryptjs');
//Import Json Web Token
const jwt = require('jsonwebtoken');
//Import Request to execut url
const request = require('request');
//Import Global Functions
const globalFunc = require('../controllers/global');
//Get Config Key
const keys = require('../config/keys');
//Import Content Model
const ContentModel = require('../models/content.model');
//Import Plans ModelsendMailEvent
const Plan = require('../models/plan.model');
//Import MailS Model
const MailS = require('../models/mail.model');
//Import Article Model
const Article = require('../models/article.model');

const Sequelize = require("sequelize")
const Op = Sequelize.Op;

exports.sendingMailConfirmation = (email, subject, body, token) => {

    MailS.findOne().then(mail => {
        if (mail) {

            const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
            const dataMail = {
                from: 'kriaa.oussama123@gmail.com',
                to: email,
                subject: subject,
                body: body,
                html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\">Confirm your email address</td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">You must perform a simple check before creating your APP account. Is this email address yours? Please confirm that this is the correct address to use for your new account.</td></tr><tr class=\"action\" style=\" text-align: center;\"><td><a class=\"link\" style=\" background: #2199e8;color: white;padding: 10px 30px;text-decoration: none;font-size: 20px;\" href='https://frontend.fictiontomission.com/verifyMail/" + token + "'>Verify</a></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
            };

            mailgun.messages().send(dataMail, function (error, body) {
                return 'Success';
            });


        }

    }).catch(err => console.log(err, 'mail'));
};

exports.treatNumber = (number) => {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
};

exports.getCurrentDate = () => {
    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minite = currentDate.getMinutes();
    const second = currentDate.getSeconds();
    return year + "-" + this.treatNumber((month + 1)) + "-" + this.treatNumber(date) + ' ' + this.treatNumber(hours) + ':' + this.treatNumber(minite) + ':' + this.treatNumber(second);
};

exports.verifyMail = (user) => {
    return new Promise(function (resolve, reject) {
        if (user.status === 'survey') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'survey'
            });
        } else if (user.status === 'uploadImage') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'uploadImage'
            });
        } else if (user.status === 'mailConfirm') {
            User.findByPk(user.id).then(userV => {
                let tokenEmail = userV.tokenEmail;
                let created_at_token_mail = new Date(userV.created_at_token_mail);
                tokenEmail = Buffer.from(tokenEmail, 'base64').toString('ascii');
                tokenEmail = tokenEmail.split('/');
                let expirationHours = parseInt(tokenEmail[1].match(/\d/g).join(""));
                let dateExpiration = created_at_token_mail.setHours(created_at_token_mail.getHours() + 1);
                let currentDate = new Date(globalFunc.getCurrentDate());
                if (dateExpiration > currentDate) {
                    globalFunc.sendingMailConfirmation(userV.email, 'Confirm your email address', 'Confirm your email address', userV.tokenEmail);
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        redirect: true,
                        redirectTo: 'mailConfirm'
                    });
                } else {
                    const pinNumber = Math.floor(1000 + Math.random() * 9000);
                    const tokenMailV = Buffer.from(userV.id + "/" + "5h" + "/" + pinNumber).toString('base64');
                    const currentDateV = globalFunc.getCurrentDate();
                    userV.tokenEmail = tokenMailV;
                    userV.created_at_token_mail = currentDateV;
                    userV.save();
                    globalFunc.sendingMailConfirmation(userV.email, 'Confirm your email address', 'Confirm your email address', tokenMailV);
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'We sent you mail for confirm account ,Please check your mail',
                        redirect: true,
                        redirectTo: 'mailConfirm'
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: err,
                    redirect: false,
                    redirectTo: ''
                });
            });
        } else if (user.status === 'typePayment') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'membership'
            });
        } else if (user.status === 'active') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'home'
            });
        } else {
            resolve({
                error: false,
                typeError: '',
                message: 'Error Compte is not active',
                redirect: true,
                redirectTo: 'logout'
            });
        }
    });
    /*


    *  else if (user.status === 'insertCard') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'insertCard'
            });
        }
        else if (user.status === 'typePayment') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'typePayment'
            });
        }
        else if (user.status === 'choosePackage') {
            resolve({
                error: false,
                typeError: '',
                message: 'Success',
                redirect: true,
                redirectTo: 'choosePackage'
            });
        } */
};

exports.getHashPassword = (password) => {

    var salt = bcryptjs.genSaltSync(10);
    var hash = bcryptjs.hashSync(password, salt);
    return hash;
};

exports.verifyPassword = (password, hash) => {
    return bcryptjs.compareSync(password, hash);
};

exports.getClient = (req, res, next) => {
    const userId = req.user.id;
    User.findOne({
      where: { id: userId },
      include: [
        {
          model: Survey,
        },
      ],
    })
      .then((user) => {


        let resSTU = this.checkStatususerClient(user);
        console.log(resSTU)
        if (resSTU.error === true) {

          return res.json(resSTU);
        } else {
          let promiseCheckSubsUser = globalFunc.checkSubscriptionUser(user);
          promiseCheckSubsUser.then(function(resSubSUser) {
            if (resSubSUser.error === true) {

              return res.json(resSubSUser);
            } else {
              if (resSubSUser.typePay === 'membership') {
                return res.json({
                  error: false,
                  typeError: '',
                  message: 'Success',
                  redirect: false,
                  redirectTo: '',
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
                    survey: user.survey,
                    customerId: user.customerId,
                    statusCard: user.statusCard,
                    packageDetails: resSubSUser.plan,

                  },
                });
              } else {
                return res.json({
                  error: false,
                  typeError: '',
                  message: 'Success',
                  redirect: false,
                  redirectTo: '',
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
                    survey: user.survey,
                    statusCard: user.statusCard,
                    customerId: user.customerId,
                  },
                });
              }
            }
          });
        }
      })
      .catch((err) => {
        return res.json({
          error: true,
          typeError: 'backend',
          message: 'Sorry there field You did not send it',
          messageErr: { error: err },
          user: userId,
          redirect: false,
          redirectTo: '',
        });
      });
};

exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.saveUser = (req, res, next) => {

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const country = req.body.country;
    const password = req.body.password;
    const zipCode = req.body.zipcode;

    if (first_name === undefined || last_name === undefined || email === undefined || country === undefined || password === undefined || zipCode === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (first_name.length === 0 || last_name.length === 0 || email.length === 0 || country.length === 0 || password.length === 0 || zipCode.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else if (this.validateEmail(email) === false) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry this email is not valid',
            redirect: false,
            redirectTo: ''
        });
    } else if (password.length < 6) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'password invalide (min6)',
            redirect: false,
            redirectTo: ''
        });
    } else {
        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync(password, salt);
        let dateString = '';
        const user = new User();
        let promiseDate = globalFunc.getCurrentDateuUTC();
        promiseDate.then(function (currentDateRes) {
            dateString = currentDateRes.currentDate;

            User.findOne({ where: {
              [Op.or]: [{email: email}, {full_name: first_name + ' ' + last_name}]
            }})
                .then(users => {
                  //  console.log(".................................")
                    if (users) {
                        return res.json({
                            error: true,
                            typeError: 'client',
                            message: 'Email is already taken or Full name exist',
                            redirect: false,
                            redirectTo: ''
                        });
                    } else {
                        let promisezoho = globalFunc.zohoCrmV2({
                            firstName: first_name,
                            lastName: last_name,
                            email: email,
                            country: country
                        });
                        promisezoho.then(function (valuZoho) {
                            // console.log('..........promisezoho............');
                            console.log(valuZoho)
                            if (valuZoho.error === true) {
                                const userSave = new User({
                                    full_name: first_name + ' ' + last_name,
                                    email: email,
                                    country: country,
                                    password: hash,
                                    status: 'survey',
                                    avatar: '',
                                    account_type: 'normal',
                                    // survey: 'In progress',
                                    zipcode: zipCode,
                                    tokenEmail: 'In progress',
                                    tokenPassword: '',
                                    created_at_token_password: '',
                                    customerId: '',
                                    statusCard: 'false',
                                    // subscriptions: [],
                                    statusAccount: 'active',
                                    typePayment: '',
                                    created_at_token_mail: dateString,
                                    last_login: dateString,
                                    createdAt: dateString

                                });
                                userSave.save().then(result => {
                                    // console.log(
                                      // '..........userSave............',
                                    // );
                                    passport.authenticate('local', {session: false}, (err, user, info) => {
                                        // console.log(
                                          // '..........passport............',
                                        // );
                                        if (err) {
                                            console.log(err, 'err');
                                            return next(err);
                                        }
                                        if (!user) {
                                            console.log('not user');
                                            return res.status(200).send(info);
                                        }
                                        req.login(user, {session: false}, err => {
                                            const token = jwt.sign({
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
                                                    // survey: user.survey,
                                                    customerId: user.customerId,
                                                    statusCard: user.statusCard
                                                }
                                            }, 'secret', {expiresIn: '22h'});
                                            return res.json({
                                                error: false,
                                                typeError: '',
                                                message: 'Account created successfully',
                                                redirect: true,
                                                redirectTo: 'survey',
                                                token: token,
                                                zoho: valuZoho,
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
                                                    // survey: user.survey,
                                                    customerId: user.customerId,
                                                    statusCard: user.statusCard
                                                }
                                            });
                                        });
                                    })(req, res);
                                }).catch(err => {
                                    return res.json({
                                        error: true,
                                        typeError: 'backend',
                                        message: 'Something went wrong. Please try again after some time!',
                                        redirect: false,
                                        redirectTo: '',
                                        zoho: valuZoho
                                    });
                                });
                            } else {
                              // console.log('..........userSave--2............');
                                const userSave = new User({
                                    full_name: first_name + ' ' + last_name,
                                    email: email,
                                    country: country,
                                    password: hash,
                                    status: 'survey',
                                    avatar: '',
                                    account_type: 'normal',
                                    // survey: 'In progress',
                                    zipcode: zipCode,
                                    tokenEmail: 'In progress',
                                    tokenPassword: '',
                                    created_at_token_password: '',
                                    customerId: '',
                                    statusCard: 'false',
                                    // subscriptions: [],
                                    statusAccount: 'active',
                                    typePayment: '',
                                    created_at_token_mail: dateString,
                                    last_login: dateString,
                                    createdAt: dateString

                                });
                                userSave.save().then(result => {
                                    passport.authenticate('local', {session: false}, (err, user, info) => {
                                        if (err) {
                                            console.log(err, 'err');
                                            return next(err);
                                        }
                                        if (!user) {
                                            console.log('not user');
                                            return res.status(200).send(info);
                                        }
                                        req.login(user, {session: false}, err => {
                                            const token = jwt.sign({
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
                                                    // survey: user.survey,
                                                    customerId: user.customerId,
                                                    statusCard: user.statusCard
                                                }
                                            }, 'secret', {expiresIn: '22h'});
                                            return res.json({
                                                error: false,
                                                typeError: '',
                                                message: 'Account created successfully',
                                                redirect: true,
                                                redirectTo: 'survey',
                                                token: token,
                                                zoho: valuZoho,
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
                                                    // survey: user.survey,
                                                    customerId: user.customerId,
                                                    statusCard: user.statusCard
                                                }
                                            });
                                        });
                                    })(req, res);
                                }).catch(err => {
                                    console.log(err)
                                    return res.json({
                                        error: true,
                                        typeError: 'backend',
                                        message: 'Something went wrong. Please try again after some time!',
                                        redirect: false,
                                        redirectTo: '',
                                        zoho: valuZoho
                                    });
                                });
                            }

                        });


                    }
                }).catch(err => {
                  console.log(err);
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    redirect: false,
                    redirectTo: ''
                });
            });

        });


    }
};

exports.confirmAccount = (req, res, next) => {
    const userID = req.user.id;
    const tokenMail = req.body.tokenMail


    User.findOne({id: userID}).then(user => {


        let resSTUser = this.checkStatususer(user);
        if (resSTUser.error === true) {
            if (resSTUser.messageErr === 'mailConfirm') {
                const tokenMailUser = user.tokenEmail;
                if (tokenMailUser === tokenMail) {
                    let tokenEmail = user.tokenEmail;
                    let created_at_token_mail = new Date(user.created_at_token_mail);
                    tokenEmail = Buffer.from(tokenEmail, 'base64').toString('ascii');
                    tokenEmail = tokenEmail.split('/');
                    let expirationHours = parseInt(tokenEmail[1].match(/\d/g).join(""));
                    let dateExpiration = created_at_token_mail.setHours(created_at_token_mail.getHours() + 1);
                    let currentDate = new Date(this.getCurrentDate());
                    if (dateExpiration > currentDate) {
                        user.tokenEmail = 'done';
                        user.status = 'typePayment';
                        user.created_at_token_mail = this.getCurrentDate();
                        user.save();
                        return res.json({
                            error: false,
                            typeError: '',
                            message: 'this account is confirmed,thank you.',
                            redirect: true,
                            redirectTo: 'membership'
                        });
                    } else {
                        const vm = this.verifyMail(user);
                        return res.json({
                            error: true,
                            typeError: 'client',
                            message: 'Sorry this token is expired , we send new confirmation .Please check mail!',
                            redirect: false,
                            redirectTo: 'mailConfirm'
                        });
                    }
                } else {
                    const vm = this.verifyMail(user);
                    return res.json({
                        error: true,
                        typeError: 'client',
                        message: 'Token Mail is invalid',
                        redirect: false,
                        redirectTo: 'mailConfirm'
                    });
                }
            } else {
                return res.json(resSTUser);
            }

        } else {
            const tokenMailUser = user.tokenEmail;
            if (tokenMailUser === tokenMail) {
                let tokenEmail = user.tokenEmail;
                let created_at_token_mail = new Date(user.created_at_token_mail);
                tokenEmail = Buffer.from(tokenEmail, 'base64').toString('ascii');
                tokenEmail = tokenEmail.split('/');
                let expirationHours = parseInt(tokenEmail[1].match(/\d/g).join(""));
                let dateExpiration = created_at_token_mail.setHours(created_at_token_mail.getHours() + 1);
                let currentDate = new Date(this.getCurrentDate());
                if (dateExpiration > currentDate) {
                    user.tokenEmail = 'done';
                    user.status = 'typePayment';
                    user.created_at_token_mail = this.getCurrentDate();
                    user.save();
                    return res.json({
                        error: false,
                        typeError: '',
                        message: 'this account is confirmed,thank you.',
                        redirect: true,
                        redirectTo: 'membership'
                    });
                } else {
                    const vm = this.verifyMail(user);
                    return res.json({
                        error: true,
                        typeError: 'client',
                        message: 'Sorry this token is expired , we send new confirmation .Please check mail!',
                        redirect: false,
                        redirectTo: 'mailConfirm'
                    });
                }
            } else {
                const vm = this.verifyMail(user);
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Token Mail is invalid',
                    redirect: false,
                    redirectTo: 'mailConfirm'
                });
            }
        }


    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: err,
            redirect: false,
            redirectTo: ''
        });
    });


};

exports.refreshTokenMail = (req, res, next) => {
    const user = req.user;
    const pinNumber = Math.floor(1000 + Math.random() * 9000);
    const tokenMail = Buffer.from(user.id + "/" + "1h" + "/" + pinNumber).toString('base64');
    if (user.status === 'mailConfirm') {
        User.findByPk(user.id)
          .then((user) => {
            user.tokenEmail = tokenMail;
            return user.save();
          })
          .then((result) => {
            this.sendingMailConfirmation(
              user.email,
              'Confirm your email address',
              'Confirm your email address',
              tokenMail,
            );
            return res.json({
              error: false,
              typeError: '',
              message:
                'We sent you mail for confirm account ,Please check your mail',
              redirect: true,
              redirectTo: 'mailConfirm',
            });
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              redirect: false,
              redirectTo: '',
            });
          });
    } else {
        return res.json({
            error: false,
            typeError: '',
            message: 'this account is confirmed,thank you.',
            redirect: true,
            redirectTo: 'home'
        });
    }


};

exports.saveSurvey = (req, res, next) => {
    const user = req.user;
    const data = req.body.data;

    console.log(data)

    if (data === undefined || user === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (data.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else {


        User.findOne({
          where: { id: user.id },
          include: [
            {
              model: Survey,
            },
          ],
        })
          .then((user) => {
            if (user) {
              // Checking if survey exists
              // If not then create a new one
              if (!user.surveyId) {
                // Create new survey
                Survey.create(data).then(res => {
                  user.setSurvey(res);
                })
              } else {
                // Update Survey
                user.survey.update(data)
              }

              if (user.avatar === '' || user.avatar.length === 0) {
                user.status = 'uploadImage';
                user.save();
                return res.json({
                  error: false,
                  typeError: '',
                  message: 'Successful insert, Thank you',
                  redirect: true,
                  redirectTo: 'uploadImage',
                });
              } else {
                if (user.status === 'active') {
                  user.save();
                  return res.json({
                    error: false,
                    typeError: '',
                    message: 'Successful Update, Thank you',
                    redirect: false,
                    redirectTo: '',
                  });
                } else if (user.account_type === 'google') {
                  user.status = 'active';
                  user.save();
                  return res.json({
                    error: false,
                    typeError: '',
                    message: 'Successful Insert, Thank you',
                    redirect: false,
                    redirectTo: '',
                  });
                } else {
                  user.status = 'mailConfirm';
                  const pinNumber = Math.floor(1000 + Math.random() * 9000);
                  const tokenMail = Buffer.from(
                    user.id + '/' + '5h' + '/' + pinNumber,
                  ).toString('base64');
                  user.tokenEmail = tokenMail;
                  user.created_at_token_mail = this.getCurrentDate();
                  user.save();
                  this.sendingMailConfirmation(
                    user.email,
                    'Confirm your email address',
                    'Confirm your email address',
                    tokenMail,
                  );
                  return res.json({
                    error: false,
                    typeError: '',
                    message: 'Successful insert, Thank you',
                    redirect: true,
                    redirectTo: 'mailConfirm',
                  });
                }
              }
            } else {
              res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                redirect: false,
                redirectTo: '',
              });
            }
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              redirect: false,
              redirectTo: '',
            });
          });


    }
};

exports.uploadFile = (req, res, next) => {
    const user = req.user;
    const pinNumber = Math.floor(1000 + Math.random() * 9000);
    const tokenMail = Buffer.from(user.id + "/" + "1h" + "/" + pinNumber).toString('base64');
    User.findByPk(user.id).then(user => {


        if (user.account_type === 'google') {
            user.tokenEmail = 'done';
            user.created_at_token_mail = this.getCurrentDate();
            user.status = 'typePayment';
            user.avatar = 'https://image.flaticon.com/icons/png/512/149/149071.png';
            user.save();
            return res.json({
                error: false,
                typeError: '',
                message: ' Successful Upload Image',
                redirect: true,
                redirectTo: 'membership'
            });
        } else {
            user.tokenEmail = tokenMail;
            user.created_at_token_mail = this.getCurrentDate();
            user.status = 'mailConfirm';
            user.avatar = 'https://image.flaticon.com/icons/png/512/149/149071.png';
            user.save();
            this.sendingMailConfirmation(user.email, 'Confirm your email address', 'Confirm your email address', tokenMail);
            return res.json({
                error: false,
                typeError: '',
                message: ' Successful Upload Image',
                redirect: true,
                redirectTo: 'mailConfirm'
            });
        }

    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            redirect: false,
            redirectTo: ''
        });
    });
};

exports.updateUser = (req, res, next) => {
    const user = req.user;

    if (user) {

        const full_name = req.body.full_name;
        const country = req.body.country;
        const avatar = req.body.avatar;
        const survey = req.body.survey;
        const zipcode = req.body.zipcode;
        const last_login = this.getCurrentDate();

        if (full_name !== undefined) {
            if (full_name.length === 0) {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an empty field ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }
        if (country !== undefined) {
            if (country.length === 0) {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an empty field ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }
        if (avatar !== undefined) {
            if (avatar.length === 0) {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an empty field ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }
        if (zipcode !== undefined) {
            if (zipcode.length === 0) {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an empty field ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }
        if (survey !== undefined) {
            if (JSON.stringify(survey).length === 0) {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an empty field ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }

        User.findOne({
          where: { id: user.id },
          include: [
            {
              model: Survey,
            },
          ],
        })
          .then((user) => {
            if (full_name !== undefined) {
              user.full_name = full_name;
            }
            if (country !== undefined) {
              user.country = country;
            }
            if (avatar !== undefined) {
              user.avatar = avatar;
            }
            if (req.body.password !== undefined) {
              const password = req.body.password;
              const salt = bcryptjs.genSaltSync(10);
              user.password = bcryptjs.hashSync(password, salt);
            }
            if (zipcode !== undefined) {
              user.zipcode = zipcode;
            }
            if (survey !== undefined) {
              // Check if survey exists
              // If not then create a new one
              if (!user.surveyId) {
                // Create new survey
                Survey.create(survey).then((res) => {
                  user.setSurvey(res);
                });
              } else {
                // Update Survey
                user.survey.update(survey);
              }
            }
            user.last_login = last_login;
            user.save();

            return res.json({
              error: false,
              typeError: '',
              message: 'Successful Update. Thank you!',
              redirect: false,
              redirectTo: '',
              user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                country: user.country,
                avatar: user.avatar,
                survey: user.survey,
                zipcode: user.zipcode,
                status: user.status,
              },
            });
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'tech',
              message: 'Something went wrong. Please make a login.',
              messageErr: err,
              redirect: false,
              redirectTo: '',
            });
          });

    } else {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Something went wrong. Please make a login.',
            redirect: false,
            redirectTo: ''
        });
    }
};

exports.getAllService = (req, res, next) => {
    const userId = req.user.id;
    User.findByPk(userId).then(user => {
        let zipCodeUser = user.zipcode;
        Organization.findOne().then(organization => {
            let zipCodeOrg = organization.zipCode;
            let kmMin = organization.kmMin;
            let distance = 'false';
            if (zipCodeUser.length > 0 && zipCodeOrg.length > 0) {
                const zip_code1 = zipCodeUser;
                const zip_code2 = zipCodeOrg;
                let promisedistance = new Promise(function (resolve, reject) {
                    request('http://www.zipcodeapi.com/rest/' + keys.zipcodeApi + '/distance.json/' + zip_code1 + '/' + zip_code2 + '/km', {json: true}, (err, res, body) => {
                        if (err) {
                            resolve({
                                error: true
                            });
                        }
                        resolve({
                            error: false,
                            distance: body.distance
                        });
                    });

                });
                promisedistance.then(function (value) {
                    if (value.error === true) {
                        Service.findAll({location: {$ne: 'In Person'}}).then(services => {
                            return res.json({
                                error: false,
                                typeError: '',
                                message: 'Succeess',
                                services: services,
                                redirect: false,
                                redirectTo: ''
                            });
                        })
                            .catch(err => {
                                return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message: 'Something went wrong. Please try again after some time!',
                                    messageErr: 'In Query Get All Services',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            });
                    } else {

                        if (parseInt(value.distance) <= parseInt(kmMin)) {
                            Service.findAll().then(services => {
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Succeess',
                                    services: services,
                                    redirect: false,
                                    redirectTo: ''
                                });
                            })
                                .catch(err => {
                                    return res.json({
                                        error: true,
                                        typeError: 'backend',
                                        message: 'Something went wrong. Please try again after some time!',
                                        messageErr: 'In Query Get All Services',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                });
                        } else {
                            Service.findAll({location: {$ne: 'In Person'}}).then(services => {
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Succeess',
                                    services: services,
                                    redirect: false,
                                    redirectTo: ''
                                });
                            })
                                .catch(err => {
                                    return res.json({
                                        error: true,
                                        typeError: 'backend',
                                        message: 'Something went wrong. Please try again after some time!',
                                        messageErr: 'In Query Get All Services',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                });
                        }

                    }


                });
            } else {
                Service.findAll({location: {$ne: 'In Person'}}).then(services => {
                    return res.json({
                        error: false,
                        typeError: '',
                        message: 'Succeess',
                        services: services,
                        redirect: false,
                        redirectTo: ''
                    });
                })
                    .catch(err => {
                        return res.json({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messageErr: 'In Query Get All Services',
                            redirect: false,
                            redirectTo: ''
                        });
                    });
            }


        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'organization Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: ''
        });
    });


};

exports.postEvent = (req, res, next) => {
    const userId = req.user.id;
    const eventFR = req.body.event;
    const serviceId = req.body.serviceId;
    const token = req.body.token;
    const dateString = this.getCurrentDate();
    let currentDate = dateString;

    if (eventFR === undefined || serviceId === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (serviceId.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else if (typeof eventFR !== 'object') {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an not object ',
            redirect: false,
            redirectTo: ''
        });
    } else {


        let startDCurrent = new Date(eventFR.start.toString().replace('T', ' '));
        let todayDCurrent = new Date(currentDate);
        if (startDCurrent >= todayDCurrent) {
            User.findByPk(userId).then(user => {

                Service.findByPk(serviceId).then(service => {


                    const dateRech = eventFR.start.toString().substr(0, 10);
                    const startProgress = eventFR.start.toString().substr(11, 8);
                    const endProgress = eventFR.end.toString().substr(11, 8);
                    Event.findOne({ where: {"event.start": {$regex: '.*' + dateRech + '.*'}}}).then(events => {

                        let checkDuration = globalFunc.checkDuration(events, startProgress, endProgress, dateRech);
                        checkDuration.then(function (resDuration) {
                            if (resDuration.res === true) {
                                if (token !== undefined) {
                                    if (typeof token !== 'object') {
                                        return res.json({
                                            error: true,
                                            typeError: 'client',
                                            message: 'Sorry there is an not object ',
                                            redirect: false,
                                            redirectTo: ''
                                        });
                                    } else if (token.id === undefined) {
                                        return res.json({
                                            error: true,
                                            typeError: 'tech',
                                            message: 'Token is not valid',
                                            messageErr: 'Token is not valid',
                                            redirect: false,
                                            redirectTo: ''
                                        });
                                    } else {

                                        let promiseCreateCustomer = globalFunc.createCustomer(token, user);
                                        promiseCreateCustomer.then(function (resCustomer) {

                                            if (resCustomer.error === true) {
                                                return res.json(resCustomer);
                                            } else {
                                                let promiseEventCharge = globalFunc.postEventCharge(resCustomer.customer.id, user.email, service);
                                                promiseEventCharge.then(function (resEventCharge) {
                                                    if (resEventCharge.error === true) {
                                                        return res.json(resEventCharge);
                                                    } else {
                                                        User.findByPk(user.id).then(userUpdate => {
                                                            userUpdate.customerId = resCustomer.customer.id;
                                                            userUpdate.save();
                                                            const eventSave = new Event({
                                                                event: eventFR,
                                                                userId: userId,
                                                                service: service,
                                                                status: 'In Progress',
                                                                paymentType: 'purchase',
                                                                chargeId: resEventCharge.charge.id,
                                                                indexSubscription: -1,
                                                                createdAt: dateString
                                                            });
                                                            eventSave.save().then(event => {
                                                                return res.json({
                                                                    error: false,
                                                                    typeError: '',
                                                                    message: 'Success',
                                                                    event: event,
                                                                    user: userUpdate,
                                                                    redirect: false,
                                                                    redirectTo: ''
                                                                });
                                                            })
                                                                .catch(err => {
                                                                    return res.json({
                                                                        error: true,
                                                                        typeError: 'backend',
                                                                        message: 'Something went wrong. Please try again after some time!',
                                                                        messageErr: 'Event Not Save',
                                                                        redirect: false,
                                                                        redirectTo: ''
                                                                    });
                                                                });
                                                        })
                                                            .catch(err => {
                                                                return res.json({
                                                                    error: true,
                                                                    typeError: 'backend',
                                                                    message: 'Something went wrong. Please try again after some time!',
                                                                    messageErr: 'User Not Update',
                                                                    redirect: false,
                                                                    redirectTo: ''
                                                                });
                                                            });
                                                    }
                                                });
                                            }

                                        });

                                    }

                                } else {
                                    let promiseEventCharge = globalFunc.postEventCharge(user.customerId, user.email, service);
                                    promiseEventCharge.then(function (resEventCharge) {
                                        if (resEventCharge.error === true) {
                                            return res.json(resEventCharge);
                                        } else {
                                            const eventSave = new Event({
                                                event: eventFR,
                                                userId: userId,
                                                service: service,
                                                status: 'In Progress',
                                                paymentType: 'purchase',
                                                chargeId: resEventCharge.charge.id,
                                                indexSubscription: -1,
                                                createdAt: dateString
                                            });
                                            eventSave.save().then(event => {
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Success',
                                                    event: event,
                                                    user: user,
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'Event Not Save',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });
                                        }
                                    });
                                }
                            } else {
                                return res.json({
                                    error: false,
                                    typeError: 'client',
                                    message: 'Sorry this date is reserved!',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            }
                        });
                    }).catch(err => {
                        return res.json({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messageErr: 'Event Not Find By Date',
                            redirect: false,
                            redirectTo: ''
                        });
                    });

                }).catch(err => {
                    return res.json({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messageErr: 'Service Not Find',
                        redirect: false,
                        redirectTo: ''
                    });
                });
            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        } else {
            return res.json({
                error: true,
                typeError: 'client',
                message: 'Invalid Date',
                redirect: false,
                redirectTo: ''
            });
        }


    }


};

exports.postEventV3 = (req, res, next) => {
    const userId = req.user.id;
    const eventFR = req.body.event;
    const serviceId = req.body.serviceId;
    const token = req.body.token;
    const dateString = this.getCurrentDate();
    let currentDate = dateString;

    if (eventFR === undefined || serviceId === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (serviceId.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else if (typeof eventFR !== 'object') {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an not object ',
            redirect: false,
            redirectTo: ''
        });
    } else {


        let startDCurrent = new Date(eventFR.start.toString().replace('T', ' '));
        let todayDCurrent = new Date(currentDate);
        if (startDCurrent >= todayDCurrent) {
            User.findByPk(userId).then(user => {
                let resSTU = this.checkStatususer(user);
                if (resSTU.error === true) {
                    return res.json(resSTU);
                } else {
                    Service.findByPk(serviceId).then(service => {


                        const dateRech = eventFR.start.toString().substr(0, 10);
                        const startProgress = eventFR.start.toString().substr(11, 8);
                        const endProgress = eventFR.end.toString().substr(11, 8);
                        Event.findAll({"event.start": {$regex: '.*' + dateRech + '.*'}}).then(events => {

                            let checkDuration = globalFunc.checkDuration(events, startProgress, endProgress, dateRech);
                            checkDuration.then(function (resDuration) {
                                if (resDuration.res === true) {
                                    if (token !== undefined) {
                                        if (typeof token !== 'object') {
                                            return res.json({
                                                error: true,
                                                typeError: 'client',
                                                message: 'Sorry there is an not object ',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        } else if (token.id === undefined) {
                                            return res.json({
                                                error: true,
                                                typeError: 'tech',
                                                message: 'Token is not valid',
                                                messageErr: 'Token is not valid',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        } else {

                                            if (user.customerId.length === 0) {
                                                let promiseCreateCustomer = globalFunc.createCustomer(token, user);
                                                promiseCreateCustomer.then(function (resCustomer) {

                                                    if (resCustomer.error === true) {
                                                        return res.json(resCustomer);
                                                    } else {
                                                        let promiseEventCharge = globalFunc.postEventCharge(resCustomer.customer.id, user.email, service);
                                                        promiseEventCharge.then(function (resEventCharge) {
                                                            if (resEventCharge.error === true) {
                                                                return res.json(resEventCharge);
                                                            } else {
                                                              User.findByPk(user.id).then(userUpdate => {
                                                                    userUpdate.customerId = resCustomer.customer.id;
                                                                    userUpdate.save();
                                                                    const eventSave = new Event({
                                                                        event: eventFR,
                                                                        userId: userId,
                                                                        service: service,
                                                                        status: 'In Progress',
                                                                        paymentType: 'purchase',
                                                                        chargeId: resEventCharge.charge.id,
                                                                        indexSubscription: -1,
                                                                        createdAt: dateString
                                                                    });
                                                                    eventSave.save().then(event => {
                                                                        let stDtM = event.event.start;
                                                                        stDtM = stDtM.replace('T', ' ');
                                                                        let enDtM = event.event.end;
                                                                        enDtM = enDtM.replace('T', ' ');

                                                                        globalFunc.sendMailEvent(userUpdate, stDtM, enDtM);
                                                                        return res.json({
                                                                            error: false,
                                                                            typeError: '',
                                                                            message: 'Success',
                                                                            event: event,
                                                                            user: userUpdate,
                                                                            redirect: false,
                                                                            redirectTo: ''
                                                                        });
                                                                    })
                                                                        .catch(err => {
                                                                            return res.json({
                                                                                error: true,
                                                                                typeError: 'backend',
                                                                                message: 'Something went wrong. Please try again after some time!',
                                                                                messageErr: 'Event Not Save',
                                                                                redirect: false,
                                                                                redirectTo: ''
                                                                            });
                                                                        });
                                                                })
                                                                    .catch(err => {
                                                                        return res.json({
                                                                            error: true,
                                                                            typeError: 'backend',
                                                                            message: 'Something went wrong. Please try again after some time!',
                                                                            messageErr: 'User Not Update',
                                                                            redirect: false,
                                                                            redirectTo: ''
                                                                        });
                                                                    });
                                                            }
                                                        });
                                                    }

                                                });
                                            } else {
                                                let promiseCreateCustomer = globalFunc.updateCustomerToken(token, user.customerId);
                                                promiseCreateCustomer.then(function (resCustomer) {

                                                    if (resCustomer.error === true) {
                                                        return res.json(resCustomer);
                                                    } else {
                                                        let promiseEventCharge = globalFunc.postEventCharge(resCustomer.customer.id, user.email, service);
                                                        promiseEventCharge.then(function (resEventCharge) {
                                                            if (resEventCharge.error === true) {
                                                                return res.json(resEventCharge);
                                                            } else {
                                                                User.findByPk(user.id).then(userUpdate => {
                                                                    userUpdate.customerId = resCustomer.customer.id;
                                                                    userUpdate.save();
                                                                    const eventSave = new Event({
                                                                        event: eventFR,
                                                                        userId: userId,
                                                                        service: service,
                                                                        status: 'In Progress',
                                                                        paymentType: 'purchase',
                                                                        chargeId: resEventCharge.charge.id,
                                                                        indexSubscription: -1,
                                                                        createdAt: dateString
                                                                    });
                                                                    eventSave.save().then(event => {
                                                                        let stDtM = event.event.start;
                                                                        stDtM = stDtM.replace('T', ' ');
                                                                        let enDtM = event.event.end;
                                                                        enDtM = enDtM.replace('T', ' ');

                                                                        globalFunc.sendMailEvent(userUpdate, stDtM, enDtM);
                                                                        return res.json({
                                                                            error: false,
                                                                            typeError: '',
                                                                            message: 'Success',
                                                                            event: event,
                                                                            user: userUpdate,
                                                                            redirect: false,
                                                                            redirectTo: ''
                                                                        });
                                                                    })
                                                                        .catch(err => {
                                                                            return res.json({
                                                                                error: true,
                                                                                typeError: 'backend',
                                                                                message: 'Something went wrong. Please try again after some time!',
                                                                                messageErr: 'Event Not Save',
                                                                                redirect: false,
                                                                                redirectTo: ''
                                                                            });
                                                                        });
                                                                })
                                                                    .catch(err => {
                                                                        return res.json({
                                                                            error: true,
                                                                            typeError: 'backend',
                                                                            message: 'Something went wrong. Please try again after some time!',
                                                                            messageErr: 'User Not Update',
                                                                            redirect: false,
                                                                            redirectTo: ''
                                                                        });
                                                                    });
                                                            }
                                                        });
                                                    }

                                                });
                                            }


                                        }

                                    } else {
                                        let promiseEventCharge = globalFunc.postEventCharge(user.customerId, user.email, service);
                                        promiseEventCharge.then(function (resEventCharge) {
                                            if (resEventCharge.error === true) {
                                                return res.json(resEventCharge);
                                            } else {
                                                const eventSave = new Event({
                                                    event: eventFR,
                                                    userId: userId,
                                                    service: service,
                                                    status: 'In Progress',
                                                    paymentType: 'purchase',
                                                    chargeId: resEventCharge.charge.id,
                                                    indexSubscription: -1,
                                                    createdAt: dateString
                                                });
                                                eventSave.save().then(event => {
                                                    let stDtM = event.event.start;
                                                    stDtM = stDtM.replace('T', ' ');
                                                    let enDtM = event.event.end;
                                                    enDtM = enDtM.replace('T', ' ');

                                                    globalFunc.sendMailEvent(user, stDtM, enDtM);
                                                    return res.json({
                                                        error: false,
                                                        typeError: '',
                                                        message: 'Success',
                                                        event: event,
                                                        user: user,
                                                        redirect: false,
                                                        redirectTo: ''
                                                    });
                                                }).catch(err => {
                                                    return res.json({
                                                        error: true,
                                                        typeError: 'backend',
                                                        message: 'Something went wrong. Please try again after some time!',
                                                        messageErr: 'Event Not Save',
                                                        redirect: false,
                                                        redirectTo: ''
                                                    });
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: 'client',
                                        message: 'Sorry this date is reserved!',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            });
                        }).catch(err => {
                            return res.json({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Find By Date',
                                redirect: false,
                                redirectTo: ''
                            });
                        });

                    }).catch(err => {
                        return res.json({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messageErr: 'Service Not Find',
                            redirect: false,
                            redirectTo: ''
                        });
                    });
                }


            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        } else {
            return res.json({
                error: true,
                typeError: 'client',
                message: 'Invalid Date',
                redirect: false,
                redirectTo: ''
            });
        }


    }


};

exports.postEventV2 = (req, res, next) => {
    const userId = req.user.id;
    const eventFR = req.body.event;
    const serviceId = req.body.serviceId;
    const token = req.body.token;
    const dateString = this.getCurrentDate();

    if (eventFR === undefined || serviceId === undefined || token === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (serviceId.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else if (typeof eventFR !== 'object' || typeof token !== 'object') {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an not object ',
            redirect: false,
            redirectTo: ''
        });
    } else {
      User.findByPk(userId).then(user => {

            Service.findByPk(serviceId).then(service => {


                let promiseCustomer = globalFunc.regCustomer(user, token, service);
                promiseCustomer.then(function (value) {


                    if (value.error === true) {
                        return res.json({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messageErr: 'Stripe Charge',
                            value: value,
                            redirect: false,
                            redirectTo: ''
                        });
                    } else {
                        if (value.charge.status === 'succeeded') {
                            service.quantity = service.quantity + 1;
                            service.save();
                            const eventSave = new Event({
                                event: eventFR,
                                userId: user.id,
                                service: service,
                                canceledBy: '',
                                message: '',
                                status: 'In Progress',
                                createdAt: dateString
                            });
                            eventSave.save().then(event => {
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful Event Insert',
                                    event: event,
                                    redirect: false,
                                    redirectTo: ''
                                });
                            }).catch(err => {
                                return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message: 'Something went wrong. Please try again after some time!',
                                    messageErr: 'Event Not Find',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            });

                        } else {
                            return res.json({
                                error: true,
                                typeError: 'client',
                                message: 'Warning: verify your card details!',
                                value: value,
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    }

                });

            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Service Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'User Not Find',
                redirect: false,
                redirectTo: ''
            });
        });


    }


};

exports.addToCart = (req, res, next) => {
    const userSess = req.user;
    const eventFR = req.body.event;
    const serviceId = req.body.serviceId;
    const dateString = this.getCurrentDate();
    let currentDate = dateString;

    if (eventFR === undefined || serviceId === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (serviceId.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else if (typeof eventFR !== 'object') {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an not object ',
            redirect: false,
            redirectTo: ''
        });
    } else {
      User.findByPk(userSess.id).then(user => {

            let resSTU = this.checkStatususer(user);
            if (resSTU.error === true) {
                return res.json(resSTU);
            } else {
                if (user.typePayment === 'membership') {
                    let startDCurrent = new Date(eventFR.start.toString().replace('T', ' '));
                    let todayDCurrent = new Date(currentDate);
                    if (startDCurrent >= todayDCurrent) {
                        Service.findByPk(serviceId).then(service => {


                            const dateRech = eventFR.start.toString().substr(0, 10);
                            const startProgress = eventFR.start.toString().substr(11, 8);
                            const endProgress = eventFR.end.toString().substr(11, 8);
                            Event.findAll({"event.start": {$regex: '.*' + dateRech + '.*'}}).then(events => {

                                let checkDuration = globalFunc.checkDuration(events, startProgress, endProgress, dateRech);
                                checkDuration.then(function (resDuration) {
                                    if (resDuration.res === true) {

                                        let subscriptions = user.subscriptions;
                                        if (subscriptions.length > 0) {

                                            let promiseCheckSub = globalFunc.checkSubscription(subscriptions[subscriptions.length - 1], service.type, user);
                                            promiseCheckSub.then(function (resCheckSubscription) {
                                                if (resCheckSubscription.error === true) {
                                                    return res.json(resCheckSubscription);
                                                } else {
                                                    const eventSave = new Event({
                                                        event: eventFR,
                                                        userId: user.id,
                                                        service: service,
                                                        canceledBy: '',
                                                        message: '',
                                                        status: 'In Progress',
                                                        paymentType: 'cart',
                                                        chargeId: '',
                                                        indexSubscription: subscriptions.length - 1,
                                                        createdAt: dateString
                                                    });

                                                    eventSave.save().then(event => {
                                                        let stDtM = event.event.start;
                                                        stDtM = stDtM.replace('T', ' ');
                                                        let enDtM = event.event.end;
                                                        enDtM = enDtM.replace('T', ' ');

                                                        globalFunc.sendMailEvent(userSess, stDtM, enDtM);
                                                        let subs = user.subscriptions;
                                                        if (service.type === 'normal') {
                                                            subs[subs.length - 1].consAppNor = subs[subs.length - 1].consAppNor + 1;
                                                        } else {
                                                            subs[subs.length - 1].consAppShort = subs[subs.length - 1].consAppShort + 1;
                                                        }
                                                        User.findByPk(userSess.id).then(userUpdate => {
                                                            userUpdate.subscriptions = subs;
                                                            userUpdate.save();
                                                            return res.json({
                                                                error: false,
                                                                typeError: '',
                                                                message: 'Success',
                                                                event: event,
                                                                redirect: false,
                                                                redirectTo: ''
                                                            });
                                                        }).catch(err => {
                                                            return res.json({
                                                                error: true,
                                                                typeError: 'backend',
                                                                message: 'Something went wrong. Please try again after some time!',
                                                                messageErr: 'Subscription Event Valid User Not Update',
                                                                redirect: false,
                                                                redirectTo: ''
                                                            });
                                                        });
                                                    }).catch(err => {
                                                        return res.json({
                                                            error: true,
                                                            typeError: 'backend',
                                                            message: 'Something went wrong. Please try again after some time!',
                                                            messageErr: 'Event Not Save',
                                                            redirect: false,
                                                            redirectTo: ''
                                                        });
                                                    })

                                                }

                                            });


                                        } else {
                                            return res.json({
                                                error: true,
                                                typeError: 'client',
                                                message: 'Please choose package',
                                                redirect: true,
                                                redirectTo: 'choosePackage'
                                            });
                                        }
                                    } else {
                                        return res.json({
                                            error: false,
                                            typeError: 'client',
                                            message: 'Sorry this date is reserved!',
                                            redirect: false,
                                            redirectTo: ''
                                        });
                                    }
                                });
                            }).catch(err => {
                                return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message: 'Something went wrong. Please try again after some time!',
                                    messageErr: 'Event Not Find By Date',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            });

                        }).catch(err => {
                            return res.json({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messageErr: 'Service Not Find',
                                redirect: false,
                                redirectTo: ''
                            });
                        });

                    } else {
                        return res.json({
                            error: true,
                            typeError: 'client',
                            message: 'Invalid Date',
                            redirect: false,
                            redirectTo: ''
                        });
                    }


                } else {
                    return res.json({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry this action is valid just for membership',
                        messageErr: 'Valid Just Membership',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }
        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'User Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    }


};

exports.getAllEventUser = (req, res, next) => {
    const user = req.user;
    if (user) {

        Event.findAll({userId: user.id}).then(eventUser => {
            Event.findAll({
                userId: {$ne: user.id},
                $or: [{status: {$ne: 'refuse'}}, {status: {$ne: 'cancelled'}}]
            }).then(events => {

                for (var i = 0; i < events.length; i++) {
                    events[i].event.title = 'reserved';
                    events[i].event['color'] = '#D7D7D7';
                    events[i].event['reserved'] = true;
                }
                for (var i = 0; i < eventUser.length; i++) {
                    if (eventUser[i].status === 'cancelled') {
                        if (eventUser.canceledBy === 'admin') {
                            eventUser[i].event.title = 'cancelled';
                            eventUser[i].event['color'] = 'orange';
                        } else {
                            eventUser.splice(i, 1);
                        }
                    } else if (eventUser[i].status === 'refuse') {
                        eventUser[i].event.title = 'refuse';
                        eventUser[i].event['color'] = 'red';
                    } else if (eventUser[i].status === 'In Progress') {
                        eventUser[i].event['color'] = 'green';
                    } else {
                        eventUser[i].event['color'] = eventUser[i].service.color;
                    }

                }


                return res.json({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    messageErr: '',
                    eventUser: eventUser,
                    events: events,
                    redirect: false,
                    redirectTo: ''
                });
            }).catch(err => {
                console.log(err);
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'All Event Differnt User ID',
                    redirect: false,
                    redirectTo: ''
                });
            });
        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'eventUser Not Find',
                redirect: false,
                redirectTo: ''
            });
        });

    } else {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Something went wrong. Please make a login.',
            messageErr: 'User Not Exicte',
            redirect: false,
            redirectTo: ''
        });
    }
};

exports.postContent = (req, res, next) => {

    const content = req.body.content;
    const title = req.body.title;
    const subject = req.body.subject;
    let tags = req.body.tags;

    if (content === undefined || title === undefined || subject === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (content.length === 0 || title.length === 0 || subject.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else {
        if (tags !== undefined) {
            if (typeof tags !== 'object') {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry there is an not object ',
                    redirect: false,
                    redirectTo: ''
                });
            }
        } else {
            tags = [];
        }

        const contentSave = new ContentModel({
            content: content,
            title: title,
            subject: subject,
            tags: tags,
            userId: req.user.id,
            createdAt: this.getCurrentDate()
        });
        contentSave.save().then(content => {
            return res.json({
                error: false,
                typeError: '',
                message: 'Success',
                content: content,
                redirect: false,
                redirectTo: ''
            });

        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Content Not Save',
                redirect: false,
                redirectTo: ''
            });
        });

    }


};

exports.getContentUser = (req, res, next) => {
    const user = req.user;

    ContentModel.findAll({userId: user.id}).then(contents => {
        return res.json({
            error: false,
            typeError: '',
            contents: contents,
            redirect: false,
            redirectTo: ''
        });
    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'Get Content Not Find',
            redirect: false,
            redirectTo: ''
        });
    });

};

exports.cancledByUser = (req, res, next) => {
    const idEvent = req.body.idEvent;
    const message = req.body.message;
    const userSession = req.user;
    let dateString = '';
    if (idEvent === undefined || message === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (idEvent.length === 0 || message.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else {

        let promiseCurrentDate = globalFunc.getCurrentDateuUTC();
        promiseCurrentDate.then(function (currentDateUTC) {
            dateString = currentDateUTC.currentDate;
            dateString = new Date(dateString);
            Event.findByPk(idEvent).then(event => {
                const idService = event.service._id;
                let dateEvent = event.event.start;
                dateEvent = dateEvent.replace("T", " ");
                dateEvent = new Date(dateEvent);
                if (event.status === 'cancelled') {
                    return res.json({
                        error: false,
                        typeError: '',
                        message: 'Sorry this appointment is really cancelled',
                        redirect: false,
                        redirectTo: ''
                    });
                } else {
                    Service.findByPk(idService).then(service => {
                        if (service.customeCancellation === 'allowed') {
                            if (service.customeNotice === '1h') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 1);
                                if (dateEvent >= dateString) {


                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();

                                                let stDtM = event.event.start;
                                                stDtM = stDtM.replace('T', ' ');
                                                let enDtM = event.event.end;
                                                enDtM = enDtM.replace('T', ' ');

                                                globalFunc.sendMailEventCBUser(userUpdate, stDtM, enDtM);

                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();

                                                let stDtM = event.event.start;
                                                stDtM = stDtM.replace('T', ' ');
                                                let enDtM = event.event.end;
                                                enDtM = enDtM.replace('T', ' ');

                                                globalFunc.sendMailEventCBUser(userSession, stDtM, enDtM);


                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }


                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            } else if (service.customeNotice === '6h') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 6);
                                if (dateEvent >= dateString) {
                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            } else if (service.customeNotice === '12h') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 12);
                                if (dateEvent >= dateString) {
                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            } else if (service.customeNotice === '24h') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 24);
                                if (dateEvent >= dateString) {
                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            } else if (service.customeNotice === '2d') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 48);
                                if (dateEvent >= dateString) {
                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            } else if (service.customeNotice === '1w') {
                                dateEvent = dateEvent.setHours(dateEvent.getHours() - 168);
                                if (dateEvent >= dateString) {
                                    if (event.paymentType === 'cart') {

                                        let indexSubscription = event.indexSubscription;
                                        let userId = event.userId;
                                        event.status = 'cancelled';
                                        event.canceledBy = 'user';
                                        event.message = message;
                                        event.save().then(eventRef => {
                                            User.findByPk(userId).then(userUpdate => {
                                                let subs = userUpdate.subscriptions;
                                                if (service.type === 'normal') {
                                                    subs[indexSubscription].consAppNor = subs[indexSubscription].consAppNor - 1;
                                                } else {
                                                    subs[indexSubscription].consAppShort = subs[indexSubscription].consAppShort - 1;
                                                }
                                                userUpdate.subscriptions = subs;
                                                userUpdate.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });

                                            }).catch(err => {
                                                return res.json({
                                                    error: true,
                                                    typeError: 'backend',
                                                    message: 'Something went wrong. Please try again after some time!',
                                                    messageErr: 'User Not Update Refuse',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            });

                                        }).catch(err => {
                                            return res.json({
                                                error: true,
                                                typeError: 'backend',
                                                message: 'Something went wrong. Please try again after some time!',
                                                messageErr: 'Event Not Update Refuse',
                                                redirect: false,
                                                redirectTo: ''
                                            });
                                        });


                                    } else {

                                        let userId = event.userId;
                                        let chargeId = event.chargeId;
                                        let promiseRefundCharge = globalFunc.refundCharge(chargeId);
                                        promiseRefundCharge.then(function (resRefCharge) {
                                            if (resRefCharge.error === true) {
                                                return res.json(resRefCharge);
                                            } else {
                                                event.status = 'cancelled';
                                                event.canceledBy = 'user';
                                                event.message = message;
                                                event.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Successful',
                                                    messageErr: '',
                                                    redirect: false,
                                                    redirectTo: ''
                                                });
                                            }
                                        });

                                    }
                                } else {
                                    return res.json({
                                        error: false,
                                        typeError: '',
                                        message: 'Has become a time late to cancelled appointment',
                                        messageErr: '',
                                        redirect: false,
                                        redirectTo: ''
                                    });
                                }
                            }
                        } else {
                            return res.json({
                                error: true,
                                typeError: '',
                                message: "Sorry this appointment type not can't cancelled",
                                messageErr: 'Service Not Allowed',
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    })
                        .catch(err => {
                            console.log(err);
                            return res.json({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messageErr: 'Service Not Find',
                                redirect: false,
                                redirectTo: ''
                            });
                        });
                }

            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Event Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }
};

exports.insertCard = (req, res, next) => {
    const userSess = req.user;

    const token = req.body.token;

    if (token === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (typeof token !== 'object') {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an not object ',
            redirect: false,
            redirectTo: ''
        });
    } else if (token.id === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Token is not valid',
            messageErr: 'Token is not valid',
            redirect: false,
            redirectTo: ''
        });
    } else {

        User.findByPk(userSess.id).then(user => {


            let resSTU = this.checkStatususer(user);
            if (resSTU.error === true) {
                if (resSTU.messageErr === 'membership') {
                    if (user.customerId.length === 0) {
                        let promiseCustomer = globalFunc.createCustomer(token, userSess);
                        promiseCustomer.then(function (resCustomer) {
                            if (resCustomer.error === true) {
                                return res.json(resCustomer);
                            } else {
                                user.customerId = resCustomer.customer.id;
                                user.statusCard = 'false';
                                user.typePayment = 'individual';
                                user.save();
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Success',
                                    redirect: false,
                                    redirectTo: ''
                                });


                            }
                        });
                    } else {
                        let promiseCustomer = globalFunc.updateCustomerToken(token, user.customerId);
                        promiseCustomer.then(function (resCustomer) {
                            if (resCustomer.error === true) {
                                return res.json(resCustomer);
                            } else {
                                user.customerId = resCustomer.customer.id;
                                user.statusCard = 'false';
                                user.typePayment = 'individual';
                                user.save();
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Success',
                                    redirect: false,
                                    redirectTo: ''
                                });


                            }
                        });
                    }
                } else {
                    return res.json(resSTU);
                }

            } else {
                if (user.customerId.length === 0) {
                    let promiseCustomer = globalFunc.createCustomer(token, userSess);
                    promiseCustomer.then(function (resCustomer) {
                        if (resCustomer.error === true) {
                            return res.json(resCustomer);
                        } else {
                            user.customerId = resCustomer.customer.id;
                            user.statusCard = 'false';
                            user.typePayment = 'individual';
                            user.save();
                            return res.json({
                                error: false,
                                typeError: '',
                                message: 'Success',
                                redirect: false,
                                redirectTo: ''
                            });


                        }
                    });
                } else {
                    let promiseCustomer = globalFunc.updateCustomerToken(token, user.customerId);
                    promiseCustomer.then(function (resCustomer) {
                        if (resCustomer.error === true) {
                            return res.json(resCustomer);
                        } else {
                            user.customerId = resCustomer.customer.id;
                            user.statusCard = 'false';
                            user.typePayment = 'individual';
                            user.save();
                            return res.json({
                                error: false,
                                typeError: '',
                                message: 'Success',
                                redirect: false,
                                redirectTo: ''
                            });


                        }
                    });
                }
            }


        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'User Not Find',
                redirect: false,
                redirectTo: ''
            });
        });


    }


};

exports.confirmPayment = (req, res, next) => {

    const userSess = req.user;

    if (userSess) {
        const payment = req.body.payment;

        if (payment === undefined) {
            return res.json({
                error: true,
                typeError: 'tech',
                message: 'Sorry there field You did not send it',
                redirect: false,
                redirectTo: ''
            });
        } else if (payment.length === 0) {
            return res.json({
                error: true,
                typeError: 'client',
                message: 'Sorry there is an empty field ',
                redirect: false,
                redirectTo: ''
            });
        } else if (payment !== 'individual') {
            return res.json({
                error: true,
                typeError: 'tech',
                message: 'Sorry must insert payment type in between this options (individual)',
                redirect: false,
                redirectTo: ''
            });
        } else {

            User.findByPk(userSess.id).then(user => {


                let resSTU = this.checkStatususer(user);
                if (resSTU.error === true) {
                    if (resSTU.messageErr === 'membership') {
                        user.typePayment = 'individual';
                        user.status = 'active';
                        user.save();
                        return res.json({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            redirect: true,
                            redirectTo: 'home'
                        });
                    } else {
                        return res.json(resSTU);
                    }

                } else {
                    user.typePayment = 'individual';
                    user.status = 'active';
                    user.save();
                    return res.json({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        redirect: true,
                        redirectTo: 'home'
                    });
                }


            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Service Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        }
    } else {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Something went wrong. Please make a login.',
            messageErr: 'User Not Exicte',
            redirect: false,
            redirectTo: ''
        });
    }
};

exports.createSubscription = (req, res, next) => {

    const planId = req.body.planId;
    const userSess = req.user;
    let dateString = this.getCurrentDate();
    if (planId === undefined) {
        return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry there field You did not send it',
            redirect: false,
            redirectTo: ''
        });
    } else if (planId.length === 0) {
        return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry there is an empty field ',
            redirect: false,
            redirectTo: ''
        });
    } else {

        User.findByPk(userSess.id).then(user => {


            let resSTU = this.checkStatususer(user);
            if (resSTU.error === true) {
                if (resSTU.messageErr === 'membership') {
                    if (user.customerId.length > 0) {
                        Plan.findByPk(planId).then(plan => {


                            let listSubs = user.subscriptions;
                            if (listSubs.length === 0) {
                                let promiseCharge = globalFunc.postCharge(user, plan);
                                promiseCharge.then(function (resCharge) {
                                    if (resCharge.error === true) {
                                        return res.json(resCharge);
                                    } else {

                                        let promiseSubscription = globalFunc.subscriptions(user, plan);
                                        promiseSubscription.then(function (resSubscription) {
                                            if (resSubscription.error === true) {
                                                return res.json(resSubscription);
                                            } else {

                                                user.subscriptions = [{
                                                    start_date: dateString,
                                                    status: 'active',
                                                    plan: plan,
                                                    chargeId: resCharge.charge.id,
                                                    subscriptionId: resSubscription.subscription.id,
                                                    consAppNor: 0,
                                                    consAppShort: 0
                                                }];
                                                user.typePayment = 'membership';
                                                user.statusCard = 'true';
                                                user.status = 'active';

                                                user.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Success',
                                                    redirect: true,
                                                    redirectTo: 'home'
                                                });
                                            }
                                        });

                                    }
                                });
                            } else {
                                let subs = listSubs[listSubs.length - 1];
                                if (subs.status === 'not active') {
                                    let promiseCharge = globalFunc.postCharge(user, plan);
                                    promiseCharge.then(function (resCharge) {
                                        if (resCharge.error === true) {
                                            return res.json(resCharge);
                                        } else {

                                            let promiseSubscription = globalFunc.subscriptions(user, plan);
                                            promiseSubscription.then(function (resSubscription) {
                                                if (resSubscription.error === true) {
                                                    return res.json(resSubscription);
                                                } else {

                                                    listSubs[listSubs.length] = {
                                                        start_date: dateString,
                                                        status: 'active',
                                                        plan: plan,
                                                        chargeId: resCharge.charge.id,
                                                        subscriptionId: resSubscription.subscription.id,
                                                        consAppNor: 0,
                                                        consAppShort: 0
                                                    }
                                                    user.subscriptions = listSubs;
                                                    user.typePayment = 'membership';
                                                    user.statusCard = 'true';
                                                    user.status = 'active';

                                                    user.save();
                                                    return res.json({
                                                        error: false,
                                                        typeError: '',
                                                        message: 'Success',
                                                        redirect: true,
                                                        redirectTo: 'home'
                                                    });
                                                }
                                            });

                                        }
                                    });
                                } else {

                                    let promiseDeactveSubs = globalFunc.deactiveSubscription(subs.subscriptionId);
                                    promiseDeactveSubs.then(function (resDectSubs) {
                                        if (resDectSubs.error === true) {
                                            return res.json(resDectSubs);
                                        } else {
                                            listSubs[listSubs.length - 1].status = 'not active';
                                            let promiseCharge = globalFunc.postCharge(user, plan);
                                            promiseCharge.then(function (resCharge) {
                                                if (resCharge.error === true) {
                                                    return res.json(resCharge);
                                                } else {

                                                    console.log('postCharge');

                                                    let promiseSubscription = globalFunc.subscriptions(user, plan);
                                                    promiseSubscription.then(function (resSubscription) {
                                                        if (resSubscription.error === true) {
                                                            return res.json(resSubscription);
                                                        } else {
                                                            listSubs[listSubs.length] = {
                                                                start_date: dateString,
                                                                status: 'active',
                                                                plan: plan,
                                                                chargeId: resCharge.charge.id,
                                                                subscriptionId: resSubscription.subscription.id,
                                                                consAppNor: 0,
                                                                consAppShort: 0
                                                            };
                                                          User.findByPk(userSess.id).then(userUpdate => {
                                                                console.log(listSubs);
                                                                userUpdate.subscriptions = listSubs;
                                                                userUpdate.typePayment = 'membership';
                                                                userUpdate.statusCard = 'true';
                                                                userUpdate.status = 'active';
                                                                userUpdate.save();
                                                                return res.json({
                                                                    error: false,
                                                                    typeError: '',
                                                                    message: 'Success',
                                                                    redirect: false,
                                                                    redirectTo: ''
                                                                });
                                                            }).catch(err => {
                                                                return res.json({
                                                                    error: true,
                                                                    typeError: 'backend',
                                                                    message: 'Something went wrong. Please try again after some time!',
                                                                    messageErr: 'User Update Not Work',
                                                                    redirect: false,
                                                                    redirectTo: ''
                                                                });
                                                            });

                                                        }
                                                    });

                                                }
                                            });

                                        }
                                    });
                                }
                            }


                        }).catch(err => {
                            return res.json({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messageErr: 'Plan Not Find',
                                redirect: false,
                                redirectTo: ''
                            });
                        });
                    } else {
                        user.status = 'typePayment';
                        user.card = {};
                        user.save();
                        return res.json({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            redirect: true,
                            redirectTo: 'insertCard'
                        });
                    }
                } else {
                    return res.json(resSTU);
                }

            } else {
                if (user.customerId.length > 0) {
                    Plan.findByPk(planId).then(plan => {


                        let listSubs = user.subscriptions;
                        if (listSubs.length === 0) {
                            let promiseCharge = globalFunc.postCharge(user, plan);
                            promiseCharge.then(function (resCharge) {
                                if (resCharge.error === true) {
                                    return res.json(resCharge);
                                } else {

                                    let promiseSubscription = globalFunc.subscriptions(user, plan);
                                    promiseSubscription.then(function (resSubscription) {
                                        if (resSubscription.error === true) {
                                            return res.json(resSubscription);
                                        } else {

                                            user.subscriptions = [{
                                                start_date: dateString,
                                                status: 'active',
                                                plan: plan,
                                                chargeId: resCharge.charge.id,
                                                subscriptionId: resSubscription.subscription.id,
                                                consAppNor: 0,
                                                consAppShort: 0
                                            }];
                                            user.typePayment = 'membership';
                                            user.statusCard = 'true';
                                            user.status = 'active';

                                            user.save();
                                            return res.json({
                                                error: false,
                                                typeError: '',
                                                message: 'Success',
                                                redirect: true,
                                                redirectTo: 'home'
                                            });
                                        }
                                    });

                                }
                            });
                        } else {
                            let subs = listSubs[listSubs.length - 1];
                            if (subs.status === 'not active') {
                                let promiseCharge = globalFunc.postCharge(user, plan);
                                promiseCharge.then(function (resCharge) {
                                    if (resCharge.error === true) {
                                        return res.json(resCharge);
                                    } else {

                                        let promiseSubscription = globalFunc.subscriptions(user, plan);
                                        promiseSubscription.then(function (resSubscription) {
                                            if (resSubscription.error === true) {
                                                return res.json(resSubscription);
                                            } else {

                                                listSubs[listSubs.length] = {
                                                    start_date: dateString,
                                                    status: 'active',
                                                    plan: plan,
                                                    chargeId: resCharge.charge.id,
                                                    subscriptionId: resSubscription.subscription.id,
                                                    consAppNor: 0,
                                                    consAppShort: 0
                                                }
                                                user.subscriptions = listSubs;
                                                user.typePayment = 'membership';
                                                user.statusCard = 'true';
                                                user.status = 'active';

                                                user.save();
                                                return res.json({
                                                    error: false,
                                                    typeError: '',
                                                    message: 'Success',
                                                    redirect: true,
                                                    redirectTo: 'home'
                                                });
                                            }
                                        });

                                    }
                                });
                            } else {

                                let promiseDeactveSubs = globalFunc.deactiveSubscription(subs.subscriptionId);
                                promiseDeactveSubs.then(function (resDectSubs) {
                                    if (resDectSubs.error === true) {
                                        return res.json(resDectSubs);
                                    } else {
                                        listSubs[listSubs.length - 1].status = 'not active';
                                        let promiseCharge = globalFunc.postCharge(user, plan);
                                        promiseCharge.then(function (resCharge) {
                                            if (resCharge.error === true) {
                                                return res.json(resCharge);
                                            } else {

                                                console.log('postCharge');

                                                let promiseSubscription = globalFunc.subscriptions(user, plan);
                                                promiseSubscription.then(function (resSubscription) {
                                                    if (resSubscription.error === true) {
                                                        return res.json(resSubscription);
                                                    } else {
                                                        listSubs[listSubs.length] = {
                                                            start_date: dateString,
                                                            status: 'active',
                                                            plan: plan,
                                                            chargeId: resCharge.charge.id,
                                                            subscriptionId: resSubscription.subscription.id,
                                                            consAppNor: 0,
                                                            consAppShort: 0
                                                        };
                                                      User.findByPk(userSess.id).then(userUpdate => {
                                                            console.log(listSubs);
                                                            userUpdate.subscriptions = listSubs;
                                                            userUpdate.typePayment = 'membership';
                                                            userUpdate.statusCard = 'true';
                                                            userUpdate.status = 'active';
                                                            userUpdate.save();
                                                            return res.json({
                                                                error: false,
                                                                typeError: '',
                                                                message: 'Success',
                                                                redirect: false,
                                                                redirectTo: ''
                                                            });
                                                        }).catch(err => {
                                                            return res.json({
                                                                error: true,
                                                                typeError: 'backend',
                                                                message: 'Something went wrong. Please try again after some time!',
                                                                messageErr: 'User Update Not Work',
                                                                redirect: false,
                                                                redirectTo: ''
                                                            });
                                                        });

                                                    }
                                                });

                                            }
                                        });

                                    }
                                });
                            }
                        }


                    }).catch(err => {
                        return res.json({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messageErr: 'Plan Not Find',
                            redirect: false,
                            redirectTo: ''
                        });
                    });
                } else {
                    user.status = 'typePayment';
                    user.card = {};
                    user.save();
                    return res.json({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        redirect: true,
                        redirectTo: 'insertCard'
                    });
                }
            }


        }).catch(err => {
            return res.json({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'User Not Find',
                redirect: false,
                redirectTo: ''
            });
        });


    }


};

exports.getCart = (req, res, next) => {

    const userSess = req.user;
    let indexSubscription = userSess.subscriptions.length - 1;
    Event.findAll({userId: userSess.id, paymentType: 'cart', indexSubscription: indexSubscription}).then(events => {
        return res.json({
            error: false,
            typeError: '',
            message: 'Success',
            events: events,
            redirect: false,
            redirectTo: ''
        });
    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'Event Not Find',
            redirect: false,
            redirectTo: ''
        });
    });

};

exports.checkStatususer = (user) => {

    //survey//uploadImage//mailConfirm//membership//home
    if (user.survey === 'In progress') {
        return {
            error: true,
            typeError: 'client',
            message: 'Please enter survey data ',
            messageErr: 'Survey',
            redirect: true,
            redirectTo: 'survey'
        };
    } else if (user.avatar.length === 0) {
        return {
            error: true,
            typeError: 'client',
            message: 'Please enter upload image',
            messageErr: 'uploadImage',
            redirect: true,
            redirectTo: 'uploadImage'
        };
    } else if (user.tokenEmail !== 'done') {

        if (user.account_type === 'google') {
            let updateTMD = globalFunc.updateEmailUser(user.id);
            return {
                error: true,
                typeError: 'client',
                message: 'Please submit method payment',
                messageErr: 'membership',
                redirect: true,
                redirectTo: 'membership'
            };

        } else {
            let tokenEmail = user.tokenEmail;
            let created_at_token_mail = new Date(user.created_at_token_mail);
            tokenEmail = Buffer.from(tokenEmail, 'base64').toString('ascii');
            tokenEmail = tokenEmail.split('/');
            let expirationHours = parseInt(tokenEmail[1].match(/\d/g).join(""));
            let dateExpiration = created_at_token_mail.setHours(created_at_token_mail.getHours() + 1);
            let currentDate = new Date(globalFunc.getCurrentDate());
            if (dateExpiration > currentDate) {
                globalFunc.sendingMailConfirmation(user.email, 'Confirm your email address', 'Confirm your email address', user.tokenEmail);
            } else {
                const pinNumber = Math.floor(1000 + Math.random() * 9000);
                const tokenMailV = Buffer.from(user.id + "/" + "5h" + "/" + pinNumber).toString('base64');
                const currentDateV = globalFunc.getCurrentDate();
                globalFunc.updateTokenMail(user.id, currentDateV, tokenMailV);
                globalFunc.sendingMailConfirmation(user.email, 'Confirm your email address', 'Confirm your email address', tokenMailV);
            }
            return {
                error: true,
                typeError: 'client',
                message: 'Please verify account check mail',
                messageErr: 'mailConfirm',
                redirect: true,
                redirectTo: 'mailConfirm'
            };
        }

    } else if (user.typePayment !== 'membership' && user.typePayment !== 'individual') {
        return {
            error: true,
            typeError: 'client',
            message: 'Please submit method payment',
            messageErr: 'membership',
            redirect: true,
            redirectTo: 'membership'
        };
    } else {
        return {
            error: false
        }
    }


};

exports.checkStatususerClient = (user) => {



    //survey//uploadImage//mailConfirm//membership//home
    if (!user.surveyId) {
        return {
            error: true,
            typeError: 'client',
            message: 'Please enter survey data ',
            messageErr: 'Survey',
            redirect: true,
            redirectTo: 'survey',
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
                survey: user.survey,
                customerId: user.customerId,
                statusCard: user.statusCard

            }
        };
    } else if (user.avatar.length === 0) {
        return {
            error: true,
            typeError: 'client',
            message: 'Please enter upload image',
            messageErr: 'uploadImage',
            redirect: true,
            redirectTo: 'uploadImage',
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
                survey: user.survey,
                customerId: user.customerId,
                statusCard: user.statusCard

            }
        };
    } else if (user.tokenEmail !== 'done') {

        if (user.account_type === 'google') {
            let updateTMD = globalFunc.updateEmailUser(user.id);
            return {
                error: true,
                typeError: 'client',
                message: 'Please submit method payment',
                messageErr: 'membership',
                redirect: true,
                redirectTo: 'membership'
            };

        } else {
            let tokenEmail = user.tokenEmail;
            let created_at_token_mail = new Date(user.created_at_token_mail);
            tokenEmail = Buffer.from(tokenEmail, 'base64').toString('ascii');
            tokenEmail = tokenEmail.split('/');
            let expirationHours = parseInt(tokenEmail[1].match(/\d/g).join(""));
            let dateExpiration = created_at_token_mail.setHours(created_at_token_mail.getHours() + 1);
            let currentDate = new Date(globalFunc.getCurrentDate());
            if (dateExpiration > currentDate) {
                globalFunc.sendingMailConfirmation(user.email, 'Confirm your email address', 'Confirm your email address', user.tokenEmail);
            } else {
                const pinNumber = Math.floor(1000 + Math.random() * 9000);
                const tokenMailV = Buffer.from(user.id + "/" + "5h" + "/" + pinNumber).toString('base64');
                const currentDateV = globalFunc.getCurrentDate();
                globalFunc.updateTokenMail(user.id, currentDateV, tokenMailV);
                globalFunc.sendingMailConfirmation(user.email, 'Confirm your email address', 'Confirm your email address', tokenMailV);
            }
            return {
                error: true,
                typeError: 'client',
                message: 'Please verify account check mail',
                messageErr: 'mailConfirm',
                redirect: true,
                redirectTo: 'mailConfirm'
            };
        }
    } else if (user.typePayment !== 'membership' && user.typePayment !== 'individual') {
        return {
            error: true,
            typeError: 'client',
            message: 'Please submit method payment',
            messageErr: 'membership',
            redirect: true,
            redirectTo: 'membership',
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
                survey: user.survey,
                customerId: user.customerId,
                statusCard: user.statusCard

            }
        };
    } else {
        return {
            error: false
        }
    }
};

exports.getAllPackages = (req, res, next) => {

    Plan.findAll({status: 'active'}).then(plans => {

        for (let i = 0; i < plans.length; i++) {
            plans[i].price = plans[i].price / 100;
        }

        return res.json({
            error: false,
            typeError: '',
            message: 'Success',
            plans: plans,
            redirect: false,
            redirectTo: ''
        });

    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'Plan Not Find',
            redirect: false,
            redirectTo: ''
        });
    });

};

exports.cancledSubscription = (req, res, next) => {
    const userSession = req.user;

    User.findByPk(userSession.id).then(user => {

        let subscription = user.subscriptions[user.subscriptions.length - 1];
        if (subscription.status === 'not active') {
            return res.json({
                error: true,
                typeError: 'client',
                message: 'Sorry subscription already cancelled',
                redirect: false,
                redirectTo: ''
            });
        } else {
            if (subscription.consAppShort === 0 && subscription.consAppNor === 0) {
                let promiseRefundCharge = globalFunc.refundCharge(subscription.chargeId);
                promiseRefundCharge.then(function (refChargeId) {
                    if (refChargeId.error === true) {
                        return res.json(refChargeId);
                    } else {
                        let promiseDeactSubs = globalFunc.deactiveSubscription(subscription.subscriptionId);
                        promiseDeactSubs.then(function (resDeactSubs) {
                            if (resDeactSubs.error === true) {
                                return res.json(resDeactSubs);
                            } else {
                                return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful cancelled subscription ',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            }
                        });
                    }
                });
            } else {


            }
        }


    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: ''
        });
    });

};


exports.getAllArticle = (req, res, next) => {

    const  userSession = req.user;

    User.findByPk(userSession.id).then(user => {

        if(user.typePayment === 'membership'){
            Article.findAll({status: 'active'}).then(articles => {
                return res.json({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    articles: articles,
                    redirect: false,
                    redirectTo: ''
                });
            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Articles Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        }else{
            Article.findAll({status: 'active',share: true}).then(articles => {
                return res.json({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    articles: articles,
                    redirect: false,
                    redirectTo: ''
                });
            }).catch(err => {
                return res.json({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Articles Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });


        }

    }).catch(err => {
        return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'User Not Find',
            redirect: false,
            redirectTo: ''
        });
    });



};
