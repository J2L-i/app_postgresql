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
const Survey = require('../models/survey.model');
//Import Organization Model
const Organzation = require('../models/organization.model');
//Import Gloabal Function
const global = require('./global');
//Import Event Model
const Event = require('../models/event.model');
//Import Plan Model
const Plan = require('../models/plan.model');
//Import Mail Setup Model
const MailS = require('../models/mail.model');
//Import Article Model
const Article = require('../models/article.model');

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
  return (
    year +
    '-' +
    this.treatNumber(month + 1) +
    '-' +
    this.treatNumber(date) +
    ' ' +
    this.treatNumber(hours) +
    ':' +
    this.treatNumber(minite) +
    ':' +
    this.treatNumber(second)
  );
};

exports.getAdmin = (req, res, next) => {
  if (req.user) {
    const admin = req.user;
    res.json({
      error: false,
      typeError: '',
      message: 'Success',
      redirect: false,
      redirectTo: '',
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        country: admin.country,
        avatar: admin.avatar,
      },
    });
  } else {
    res.json({
      error: true,
      typeError: 'backend',
      message: 'Something went wrong. Please try again after some time!',
      redirect: false,
      redirectTo: '',
    });
  }
};

exports.updateAdmin = (req, res, next) => {
  if (req.user) {
    const admin = req.user;

    const full_name = req.body.full_name;
    const country = req.body.country;
    const avatar = req.body.avatar;
    const last_login = this.getCurrentDate();

    if (full_name !== undefined) {
      if (full_name.length === 0) {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Sorry there is an empty field ',
          redirect: false,
          redirectTo: '',
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
          redirectTo: '',
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
          redirectTo: '',
        });
      }
    }

    Admin.findByPk(admin.id)
      .then(async (admin) => {
        if (full_name !== undefined) {
          admin.full_name = full_name;
        }
        if (country !== undefined) {
          admin.country = country;
        }
        if (avatar !== undefined) {
          admin.avatar = avatar;
        }
        if (req.body.password !== undefined) {
          const password = req.body.password;
          const salt = bcryptjs.genSaltSync(10);
          admin.password = bcryptjs.hashSync(password, salt);
        }

        admin.last_login = last_login;
        await Admin.update(admin.id, { admin });

        return res.json({
          error: false,
          typeError: '',
          message: 'Successful Update. Thank you!',
          redirect: false,
          redirectTo: '',
          admin: {
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
            country: admin.country,
            avatar: admin.avatar,
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
    res.json({
      error: true,
      typeError: 'backend',
      message: 'Something went wrong. Please try again after some time!',
      redirect: false,
      redirectTo: '',
    });
  }
};

exports.saveApiStripe = (req, res, next) => {
  const api_key = req.body.api_key;
  const secret_key = req.body.secret_key;

  if (api_key === undefined || secret_key === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (api_key.length === 0 || secret_key.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    const stripeKey = new StripeKey({
      api_key: api_key,
      secret_key: secret_key,
      created_at: this.getCurrentDate(),
    });

    StripeKey.findOne()
      .then((stripe) => {
        if (stripe) {
          stripe.api_key = api_key;
          stripe.secret_key = secret_key;
          stripe.save();
          return res.json({
            error: false,
            typeError: '',
            message: 'Successfully Stripe Key Updated',
            redirect: false,
            redirectTo: '',
          });
        } else {
          stripeKey
            .save()
            .then((result) => {
              return res.json({
                error: false,
                typeError: '',
                message: 'Successfully Stripe Key inserted',
                redirect: false,
                redirectTo: '',
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
        }
      })
      .catch((err) => {
        return res.json({
          error: true,
          typeError: 'backend',
          message: 'Something went wrong. Please try again after some time!',
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.testApiStripe = (req, res, next) => {
  if (req.user) {
    const admin = req.user;
    StripeKey.findAll()
      .then((stripes) => {
        //console.log(stripe);
        if (stripes.length > 0) {
          const stripeConfig = stripes[0];
          const stripe = require('stripe')(stripeConfig.api_key);
          stripe.charges
            .retrieve('ch_1A9a6oKFK5HDU7JvtkO9cKlA', {
              api_key: stripeConfig.secret_key,
            })
            .then((result) => {
              if (result.status === 'succeeded') {
                return res.json({
                  error: false,
                  typeError: '',
                  message: 'Everything worked as expected.',
                  redirect: false,
                  redirectTo: '',
                });
              } else {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: "Failure to connect to Stripe's API.",
                  redirect: false,
                  redirectTo: '',
                });
              }
            })
            .catch((err) => {
              if (err.statusCode === 400) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'The request was unacceptable, often due to missing a required parameter.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.statusCode === 401) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: 'No valid API key provided.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.statusCode === 402) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: 'The parameters were valid but the request failed.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.statusCode === 404) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: "The requested resource doesn't exist.",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.statusCode === 409) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'The request conflicts with another request (perhaps due to using the same idempotent key).',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.statusCode === 429) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (
                err.statusCode === 500 ||
                err.statusCode === 502 ||
                err.statusCode === 503 ||
                err.statusCode === 504
              ) {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    "Something went wrong on Stripe's end. (These are rare.)",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'api_connection_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: "Failure to connect to Stripe's API.",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'api_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    "API errors cover any other type of problem (e.g., a temporary problem with Stripe's servers), and are extremely uncommon.",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'authentication_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'Failure to properly authenticate yourself in the request.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'card_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    "Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can't be charged for some reason.",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'idempotency_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    "Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request's API endpoint and parameters.",
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'invalid_request_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'Invalid request errors arise when your request has invalid parameters.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'rate_limit_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message: 'Too many requests hit the API too quickly.',
                  redirect: false,
                  redirectTo: '',
                });
              } else if (err.type === 'validation_error') {
                return res.json({
                  error: true,
                  typeError: 'client',
                  message:
                    'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                  redirect: false,
                  redirectTo: '',
                });
              } else {
                return res.json({
                  error: true,
                  typeError: 'backend',
                  message:
                    'Something went wrong. Please try again after some time!',
                  messageErr: err,
                  redirect: false,
                  redirectTo: '',
                });
              }
            });
        } else {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Plase add Stripe krys',
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
  } else {
    return res.json({
      error: true,
      typeError: 'backend',
      message: 'Something went wrong. Please try again after some time!',
      redirect: false,
      redirectTo: '',
    });
  }
};

exports.getAllUsers = (req, res, next) => {
  if (req.user) {
    const admin = req.user;
    let allUser = [];
    User.findAll({
      include: [
        {
          model: Survey,
        },
      ],
    })
      .then((users) => {
        let regEUser = new Promise(function(resolve, reject) {
          for (let i = 0; i < users.length; i++) {
            let userSelect = users[i];
            let oneuser = {};
            let promiseEventUser = global.eventUser(userSelect.id);
            promiseEventUser.then(function(eventUser) {
              let survey = userSelect.surveyId;

              if (userSelect.surveyId) {
                survey = userSelect.surveyId;
              }
              if (eventUser.error === true) {
                oneuser = {
                  id: userSelect.id,
                  email: userSelect.email,
                  fullName: userSelect.full_name,
                  country: userSelect.country,
                  avatar: userSelect.avatar,
                  status: userSelect.status,
                  account_type: userSelect.account_type,
                  statusAccount: userSelect.statusAccount,
                  zipcode: userSelect.zipcode,
                  typePayment: userSelect.typePayment,
                  surveyId: survey,
                  events: [],
                  statusCard: userSelect.statusCard,
                  last_login: userSelect.last_login,
                  created_at: userSelect.created_at,
                  packageDetails: {},
                };
              } else {
                oneuser = {
                  id: userSelect.id,
                  email: userSelect.email,
                  fullName: userSelect.full_name,
                  country: userSelect.country,
                  avatar: userSelect.avatar,
                  status: userSelect.status,
                  account_type: userSelect.account_type,
                  statusAccount: userSelect.statusAccount,
                  zipcode: userSelect.zipcode,
                  typePayment: userSelect.typePayment,
                  surveyId: survey,
                  events: eventUser.event,
                  statusCard: userSelect.statusCard,
                  last_login: userSelect.last_login,
                  created_at: userSelect.created_at,
                  packageDetails: {},
                };
              }

              let promiseCheckSubsUser = global.checkSubscriptionUser(
                userSelect,
              );
              promiseCheckSubsUser.then(function(resSubSUser) {
                if (resSubSUser.error === true) {
                  resolve(resSubSUser);
                } else {
                  if (resSubSUser.typePay === 'membership') {
                    console.log(resSubSUser.plan);
                    oneuser.packageDetails = resSubSUser.plan;
                    allUser.push(oneuser);
                  } else {
                    allUser.push(oneuser);
                  }
                }

                if (allUser.length === users.length) {
                  resolve({
                    error: false,
                    allUser: allUser,
                  });
                }
              });
            });
          }
        });

        regEUser.then(function(value) {
          return res.json({
            error: false,
            typeError: '',
            message: 'Succeess',
            users: value.allUser,
            redirect: false,
            redirectTo: '',
          });
        });
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
  } else {
    return res.json({
      error: true,
      typeError: 'backend',
      message: 'Something went wrong. Please try again after some time!',
      redirect: false,
      redirectTo: '',
    });
  }
};

exports.setOrganization = (req, res, next) => {
  const name = req.body.name;
  let shortName = req.body.shortName;
  const email = req.body.email;
  const phone = req.body.phone;
  let website = req.body.website;
  const businessDesc = req.body.businessDesc;
  let cancellationPolicy = req.body.cancellationPolicy;
  let privacyNotice = req.body.privacyNotice;
  const country = req.body.country;
  const language = req.body.language;
  const currency = req.body.currency;
  const zipCode = req.body.zipCode;
  const skypePseudo = req.body.skypePseudo;
  const timeWork = req.body.timeWork;
  const kmMin = req.body.kmMin;

  if (
    kmMin === undefined ||
    zipCode === undefined ||
    skypePseudo === undefined ||
    name === undefined ||
    email === undefined ||
    phone === undefined ||
    businessDesc === undefined ||
    country === undefined ||
    language === undefined ||
    currency === undefined
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    kmMin.length === 0 ||
    zipCode.length === 0 ||
    skypePseudo.length === 0 ||
    name.length === 0 ||
    email.length === 0 ||
    phone.length === 0 ||
    businessDesc.length === 0 ||
    country.length === 0 ||
    currency.length === 0 ||
    language.length === 0
  ) {
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
  } else if (
    website !== undefined &&
    website.length > 0 &&
    global.validURL(website) === false
  ) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry this url website is not valid',
      redirect: false,
      redirectTo: '',
    });
  } else {
    if (shortName === undefined || shortName.length === 0) {
      shortName = '';
    }
    if (website === undefined || website.length === 0) {
      website = '';
    }
    if (cancellationPolicy === undefined || cancellationPolicy.length === 0) {
      cancellationPolicy = '';
    }
    if (privacyNotice === undefined || privacyNotice.length === 0) {
      privacyNotice = '';
    }

    const saveOrganization = new Organzation({
      name: name,
      shortName: shortName,
      email: email,
      phone: phone,
      website: website,
      businessDesc: businessDesc,
      cancellationPolicy: cancellationPolicy,
      privacyNotice: privacyNotice,
      country: country,
      language: language,
      currency: currency,
      timeWork: [],
      zipCode: zipCode,
      kmMin: kmMin,
      skypePseudo: skypePseudo,
      created_at: this.getCurrentDate(),
    });

    Organzation.findAll()
      .then((organizations) => {
        if (organizations) {
          if (organizations.length > 0) {
            const organization = organizations[0];
            Organzation.findByPk(organization.id)
              .then((organizationUpdate) => {
                organizationUpdate.name = name;
                organizationUpdate.shortName = shortName;
                organizationUpdate.email = email;
                organizationUpdate.phone = phone;
                organizationUpdate.website = website;
                organizationUpdate.businessDesc = businessDesc;
                organizationUpdate.country = country;
                organizationUpdate.language = language;
                organizationUpdate.currency = currency;
                if (timeWork !== undefined && typeof timeWork === 'object') {
                  organizationUpdate.timeWork = timeWork;
                }
                organizationUpdate.zipCode = zipCode;
                organizationUpdate.kmMin = kmMin;
                organizationUpdate.skypePseudo = skypePseudo;
                organizationUpdate.save();
                return res.json({
                  error: false,
                  typeError: 'client',
                  message: 'Successfully Organization Update',
                  redirect: false,
                  redirectTo: '',
                });
              })
              .catch((err) => {
                return res.json({
                  error: true,
                  typeError: 'backend',
                  message:
                    'Something went wrong. Please try again after some time!',
                  messageErr: err,
                  redirect: false,
                  redirectTo: '',
                });
              });
          } else {
            saveOrganization
              .save()
              .then((organization) => {
                return res.json({
                  error: false,
                  typeError: 'client',
                  message: 'Successfully Organization inserted',
                  redirect: false,
                  redirectTo: '',
                });
              })
              .catch((err) => {
                return res.json({
                  error: true,
                  typeError: 'backend',
                  message:
                    'Something went wrong. Please try again after some time!',
                  messageErr: err,
                  redirect: false,
                  redirectTo: '',
                });
              });
          }
        } else {
          saveOrganization
            .save()
            .then((organization) => {
              return res.json({
                error: false,
                typeError: 'client',
                message: 'Successfully Stripe Key inserted',
                redirect: false,
                redirectTo: '',
              });
            })
            .catch((err) => {
              return res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: '',
              });
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
  }
};

exports.setTimeWork = (req, res, next) => {
  if (req.user) {
    const timeWork = req.body.timeWork;
    if (timeWork === undefined) {
      return res.json({
        error: true,
        typeError: 'tech',
        message: 'Sorry there field You did not send it',
        redirect: false,
        redirectTo: '',
      });
    } else if (typeof timeWork !== 'object') {
      return res.json({
        error: true,
        typeError: 'client',
        message: 'Sorry there is an not object ',
        redirect: false,
        redirectTo: '',
      });
    } else {
      Organzation.findAll()
        .then((organizations) => {
          if (organizations.length > 0) {
            const organization = organizations[0];
            Organzation.findByPk(organization.id)
              .then((organizationUpdate) => {
                if (
                  Array.isArray(organizationUpdate.timeWork) &&
                  organizationUpdate.timeWork.length === 0
                ) {
                  organizationUpdate.timeWork = timeWork;
                  organizationUpdate.save();
                  return res.json({
                    error: false,
                    typeError: 'client',
                    message: 'Successfully TimeWork Insert',
                    redirect: false,
                    redirectTo: '',
                  });
                } else {
                  organizationUpdate.timeWork = timeWork;
                  organizationUpdate.save();
                  return res.json({
                    error: false,
                    typeError: 'client',
                    message: 'Successfully TimeWork Update',
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
                  messageErr: err,
                  redirect: false,
                  redirectTo: '',
                });
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
    }
  } else {
    return res.json({
      error: true,
      typeError: 'backend Not Access Admin',
      message: 'Something went wrong. Please try again after some time!',
      redirect: false,
      redirectTo: '',
    });
  }
};

exports.saveService = (req, res, next) => {
  const name = req.body.name;
  const pubDes = req.body.pubDes;
  const duration = req.body.duration;
  const location = req.body.location;
  const color = req.body.color;
  const customeCancellation = req.body.customeCancellation;
  const customeNotice = req.body.customeNotice;
  const price = req.body.price;
  const quantity = 0;
  const status = 'active';
  const type = req.body.type;
  const dateString = this.getCurrentDate();

  if (
    type === undefined ||
    name === undefined ||
    pubDes === undefined ||
    duration === undefined ||
    location === undefined ||
    color === undefined ||
    customeCancellation === undefined ||
    price === undefined
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    type.length === 0 ||
    name.length === 0 ||
    pubDes.length === 0 ||
    duration.length === 0 ||
    location.length === 0 ||
    color.length === 0 ||
    customeCancellation.length === 0 ||
    price.length === 0
  ) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validDuration(duration + '') === false) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Please insert duration like this form (00:00)',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    location !== 'phone' &&
    location !== 'skype' &&
    location !== 'zoom' &&
    location !== 'In Person'
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert location in between this options (phone, skype, zoom, In Person)',
      redirect: false,
      redirectTo: '',
    });
  } else if (type !== 'normal' && type !== 'short session') {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert location in between this options (phone, skype, zoom, In Person)',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validColr(color) === false) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry must insert color valid',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    customeCancellation !== 'allowed' &&
    customeCancellation !== 'not allowed'
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert customer Cancellation in between this options (allowed, not allowed)',
      redirect: false,
      redirectTo: '',
    });
  } else {
    if (customeCancellation === 'allowed') {
      if (customeNotice === undefined) {
        return res.json({
          error: true,
          typeError: 'tech',
          message: 'Sorry there field You did not send it',
          redirect: false,
          redirectTo: '',
        });
      } else if (customeNotice.length === 0) {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Sorry there is an empty field ',
          redirect: false,
          redirectTo: '',
        });
      } else if (
        customeNotice === '1h' ||
        customeNotice === '6h' ||
        customeNotice === '12h' ||
        customeNotice === '24h' ||
        customeNotice === '2d' ||
        customeNotice === '1w'
      ) {
        const saveServiceC = new Service({
          name: name,
          pubDes: pubDes,
          duration: duration,
          location: location,
          color: color,
          customeCancellation: customeCancellation,
          customeNotice: customeNotice,
          price: price,
          quantity: quantity,
          status: status,
          type: type,
          created_at: dateString,
        });
        Service.findOne({ where: { name: name } })
          .then((serEx) => {
            if (serEx) {
              return res.json({
                error: true,
                typeError: 'client',
                message: 'Sorry Name already exists',
                redirect: false,
                redirectTo: '',
              });
            } else {
              saveServiceC
                .save()
                .then((service) => {
                  return res.json({
                    error: false,
                    typeError: 'client',
                    message: 'Successfully Service Insert',
                    redirect: false,
                    redirectTo: '',
                  });
                })
                .catch((err) => {
                  return res.json({
                    error: true,
                    typeError: 'backend',
                    message:
                      'Something went wrong. Please try again after some time!',
                    messageErr: err,
                    redirect: false,
                    redirectTo: '',
                  });
                });
            }
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend serEx',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: err,
              redirect: false,
              redirectTo: '',
            });
          });
      } else {
        return res.json({
          error: true,
          typeError: 'tech',
          message:
            'Sorry must insert customer notice in between this options (1h,6h,12h,24h,2d,1w)',
          redirect: false,
          redirectTo: '',
        });
      }
    } else {
      const saveService = new Service({
        name: name,
        pubDes: pubDes,
        duration: duration,
        location: location,
        color: color,
        customeCancellation: customeCancellation,
        customeNotice: '',
        price: price,
        quantity: quantity,
        status: status,
        type: type,
        created_at: dateString,
      });
      Service.findOne({ where: { name: name } })
        .then((serEx) => {
          if (serEx) {
            return res.json({
              error: true,
              typeError: 'client',
              message: 'Sorry Name already exists',
              redirect: false,
              redirectTo: '',
            });
          } else {
            saveService
              .save()
              .then((service) => {
                return res.json({
                  error: false,
                  typeError: 'client',
                  message: 'Successfully Service Insert',
                  redirect: false,
                  redirectTo: '',
                });
              })
              .catch((err) => {
                return res.json({
                  error: true,
                  typeError: 'backend',
                  message:
                    'Something went wrong. Please try again after some time!',
                  messageErr: err,
                  redirect: false,
                  redirectTo: '',
                });
              });
          }
        })
        .catch((err) => {
          return res.json({
            error: true,
            typeError: 'backend serEx',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: err,
            redirect: false,
            redirectTo: '',
          });
        });
    }
  }
};

exports.deleteService = (req, res, next) => {
  const idService = req.body.idService;
  if (idService === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (idService.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    Service.findByPk(idService)
      .then((service) => {
        service.status = 'not active';
        service.save();
        return res.json({
          error: false,
          typeError: 'client',
          message: 'Successfully Deactivate Service',
          redirect: false,
          redirectTo: '',
        });
      })
      .catch((err) => {
        return res.json({
          error: true,
          typeError: 'backend Not Access Admin',
          message: 'Something went wrong. Please try again after some time!',
          messageErr: err,
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.activeService = (req, res, next) => {
  const idService = req.body.idService;
  if (idService === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (idService.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    Service.findByPk(idService)
      .then((service) => {
        service.status = 'active';
        service.save();
        return res.json({
          error: false,
          typeError: 'client',
          message: 'Successfully Active Service',
          redirect: false,
          redirectTo: '',
        });
      })
      .catch((err) => {
        return res.json({
          error: true,
          typeError: 'backend Not Access Admin',
          message: 'Something went wrong. Please try again after some time!',
          messageErr: err,
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.updateService = (req, res, next) => {
  const name = req.body.name;
  const pubDes = req.body.pubDes;
  const duration = req.body.duration;
  const location = req.body.location;
  const color = req.body.color;
  const customeCancellation = req.body.customeCancellation;
  const customeNotice = req.body.customeNotice;
  const price = req.body.price;
  const status = req.body.status;
  const idService = req.body.idService;
  const type = req.body.type;

  if (
    idService === undefined ||
    type === undefined ||
    name === undefined ||
    pubDes === undefined ||
    duration === undefined ||
    location === undefined ||
    color === undefined ||
    customeCancellation === undefined ||
    price === undefined
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    idService.length === 0 ||
    type.length === 0 ||
    name.length === 0 ||
    pubDes.length === 0 ||
    duration.length === 0 ||
    location.length === 0 ||
    color.length === 0 ||
    customeCancellation.length === 0 ||
    price.length === 0
  ) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validDuration(duration + '') === false) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Please insert duration like this form (00:00)',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    location !== 'phone' &&
    location !== 'skype' &&
    location !== 'zoom' &&
    location !== 'In Person'
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert location in between this options (phone, skype, zoom, In Person)',
      redirect: false,
      redirectTo: '',
    });
  } else if (type !== 'normal' && type !== 'short session') {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert location in between this options (phone, skype, zoom, In Person)',
      redirect: false,
      redirectTo: '',
    });
  } else if (global.validColr(color) === false) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry must insert color valid',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    customeCancellation !== 'allowed' &&
    customeCancellation !== 'not allowed'
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert customer Cancellation in between this options (allowed, not allowed)',
      redirect: false,
      redirectTo: '',
    });
  } else {
    if (customeCancellation === 'allowed') {
      if (customeNotice === undefined) {
        return res.json({
          error: true,
          typeError: 'tech',
          message: 'Sorry there field You did not send it',
          redirect: false,
          redirectTo: '',
        });
      } else if (customeNotice.length === 0) {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Sorry there is an empty field ',
          redirect: false,
          redirectTo: '',
        });
      } else if (
        customeNotice === '1h' ||
        customeNotice === '6h' ||
        customeNotice === '12h' ||
        customeNotice === '24h' ||
        customeNotice === '2d' ||
        customeNotice === '1w'
      ) {
        Service.findByPk(idService)
          .then((serEx) => {
            if (serEx) {
              serEx.name = name;
              serEx.pubDes = pubDes;
              serEx.duration = duration;
              serEx.location = location;
              serEx.color = color;
              serEx.customeCancellation = customeCancellation;
              serEx.customeNotice = customeNotice;
              serEx.price = price;
              serEx.status = status;
              serEx.type = type;
              serEx.save();
              return res.json({
                error: false,
                typeError: 'client',
                message: 'Successfully Service Update',
                redirect: false,
                redirectTo: '',
              });
            } else {
              return res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                messageErr: 'Service Not Find',
                redirect: false,
                redirectTo: '',
              });
            }
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend serEx',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: err,
              redirect: false,
              redirectTo: '',
            });
          });
      } else {
        return res.json({
          error: true,
          typeError: 'tech',
          message:
            'Sorry must insert customer notice in between this options (1h,6h,12h,24h,2d,1w)',
          redirect: false,
          redirectTo: '',
        });
      }
    } else {
      Service.findByPk(idService)
        .then((serEx) => {
          if (serEx) {
            serEx.name = name;
            serEx.pubDes = pubDes;
            serEx.duration = duration;
            serEx.location = location;
            serEx.color = color;
            serEx.customeCancellation = customeCancellation;
            serEx.customeNotice = customeNotice;
            serEx.price = price;
            serEx.status = status;
            serEx.type = type;
            serEx.save();
            return res.json({
              error: false,
              typeError: 'client',
              message: 'Successfully Service Update',
              redirect: false,
              redirectTo: '',
            });
          } else {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: 'Service Not Find',
              redirect: false,
              redirectTo: '',
            });
          }
        })
        .catch((err) => {
          return res.json({
            error: true,
            typeError: 'backend serEx',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: err,
            redirect: false,
            redirectTo: '',
          });
        });
    }
  }
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

exports.getAllEvents = (req, res, next) => {
  Event.findAll({ status: { $ne: 'refuse' } })
    .then((events) => {
      for (var i = 0; i < events.length; i++) {
        if (events[i].status === 'cancelled') {
          if (events[i].canceledBy === 'admin') {
            events.splice(i, 1);
          }
        }
      }

      return res.json({
        error: false,
        typeError: '',
        message: 'Succeess',
        events: events,
        redirect: false,
        redirectTo: '',
      });
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: 'In Query Get All Event',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.cancledByAdmin = (req, res, next) => {
  const idEvent = req.body.idEvent;
  const message = req.body.message;
  let dateString = '';
  if (idEvent === undefined || message === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (idEvent.length === 0 || message.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    let promiseCurrentDate = global.getCurrentDateuUTC();
    promiseCurrentDate.then(function(currentDateUTC) {
      dateString = currentDateUTC.currentDate;
      dateString = new Date(dateString);
      Event.findByPk(idEvent)
        .then((event) => {
          const idService = event.service._id;
          let dateEvent = event.event.start;
          dateEvent = dateEvent.replace('T', ' ');
          dateEvent = new Date(dateEvent);

          if (event.status === 'cancelled') {
            return res.json({
              error: false,
              typeError: '',
              message: 'Sorry this appointment is really cancelled',
              redirect: false,
              redirectTo: '',
            });
          } else {
            if (event.status === 'accept') {
              Service.findByPk(idService)
                .then((service) => {
                  if (service.customeCancellation === 'allowed') {
                    if (service.customeNotice === '1h') {
                      dateEvent = dateEvent.setHours(dateEvent.getHours() - 1);
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();

                                  let stDtM = eventRef.event.start;
                                  stDtM = stDtM.replace('T', ' ');
                                  let enDtM = eventRef.event.end;
                                  enDtM = enDtM.replace('T', ' ');

                                  global.sendMailEventRefuseEvent(
                                    userUpdate,
                                    stDtM,
                                    enDtM,
                                  );

                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();

                              User.findByPk(userId)
                                .then((userMail) => {
                                  let stDtM = event.event.start;
                                  stDtM = stDtM.replace('T', ' ');
                                  let enDtM = event.event.end;
                                  enDtM = enDtM.replace('T', ' ');

                                  global.sendMailEventRefuseEvent(
                                    userMail,
                                    stDtM,
                                    enDtM,
                                  );

                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr:
                                      'User Not Find In Send Mail Cancel By Admin',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    } else if (service.customeNotice === '6h') {
                      dateEvent = dateEvent.setHours(dateEvent.getHours() - 6);
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();

                                  let stDtM = eventRef.event.start;
                                  stDtM = stDtM.replace('T', ' ');
                                  let enDtM = eventRef.event.end;
                                  enDtM = enDtM.replace('T', ' ');

                                  global.sendMailEventRefuseEvent(
                                    userUpdate,
                                    stDtM,
                                    enDtM,
                                  );

                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();
                              return res.json({
                                error: false,
                                typeError: '',
                                message: 'Successful',
                                messageErr: '',
                                redirect: false,
                                redirectTo: '',
                              });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    } else if (service.customeNotice === '12h') {
                      dateEvent = dateEvent.setHours(dateEvent.getHours() - 12);
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();
                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();

                              User.findByPk(userId)
                                .then((userMail) => {
                                  let stDtM = event.event.start;
                                  stDtM = stDtM.replace('T', ' ');
                                  let enDtM = event.event.end;
                                  enDtM = enDtM.replace('T', ' ');

                                  global.sendMailEventRefuseEvent(
                                    userMail,
                                    stDtM,
                                    enDtM,
                                  );

                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr:
                                      'User Not Find In Send Mail Cancel By Admin',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    } else if (service.customeNotice === '24h') {
                      dateEvent = dateEvent.setHours(dateEvent.getHours() - 24);
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();
                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();
                              return res.json({
                                error: false,
                                typeError: '',
                                message: 'Successful',
                                messageErr: '',
                                redirect: false,
                                redirectTo: '',
                              });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    } else if (service.customeNotice === '2d') {
                      dateEvent = dateEvent.setHours(dateEvent.getHours() - 48);
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();
                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();
                              return res.json({
                                error: false,
                                typeError: '',
                                message: 'Successful',
                                messageErr: '',
                                redirect: false,
                                redirectTo: '',
                              });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    } else if (service.customeNotice === '1w') {
                      dateEvent = dateEvent.setHours(
                        dateEvent.getHours() - 168,
                      );
                      if (dateEvent >= dateString) {
                        if (event.paymentType === 'cart') {
                          let indexSubscription = event.indexSubscription;
                          let userId = event.userId;
                          event.status = 'cancelled';
                          event.canceledBy = 'admin';
                          event.message = message;
                          event
                            .save()
                            .then((eventRef) => {
                              User.findByPk(userId)
                                .then((userUpdate) => {
                                  let subs = userUpdate.subscriptions;
                                  if (service.type === 'normal') {
                                    subs[indexSubscription].consAppNor =
                                      subs[indexSubscription].consAppNor - 1;
                                  } else {
                                    subs[indexSubscription].consAppShort =
                                      subs[indexSubscription].consAppShort - 1;
                                  }
                                  userUpdate.subscriptions = subs;
                                  userUpdate.save();
                                  return res.json({
                                    error: false,
                                    typeError: '',
                                    message: 'Successful',
                                    messageErr: '',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                })
                                .catch((err) => {
                                  return res.json({
                                    error: true,
                                    typeError: 'backend',
                                    message:
                                      'Something went wrong. Please try again after some time!',
                                    messageErr: 'User Not Update Refuse',
                                    redirect: false,
                                    redirectTo: '',
                                  });
                                });
                            })
                            .catch((err) => {
                              return res.json({
                                error: true,
                                typeError: 'backend',
                                message:
                                  'Something went wrong. Please try again after some time!',
                                messageErr: 'Event Not Update Refuse',
                                redirect: false,
                                redirectTo: '',
                              });
                            });
                        } else {
                          let userId = event.userId;
                          let chargeId = event.chargeId;
                          let promiseRefundCharge = global.refundCharge(
                            chargeId,
                          );
                          promiseRefundCharge.then(function(resRefCharge) {
                            if (resRefCharge.error === true) {
                              return res.json(resRefCharge);
                            } else {
                              event.status = 'cancelled';
                              event.canceledBy = 'admin';
                              event.message = message;
                              event.save();
                              return res.json({
                                error: false,
                                typeError: '',
                                message: 'Successful',
                                messageErr: '',
                                redirect: false,
                                redirectTo: '',
                              });
                            }
                          });
                        }
                      } else {
                        return res.json({
                          error: false,
                          typeError: '',
                          message:
                            'Has become a time late to cancelled appointment',
                          messageErr: '',
                          redirect: false,
                          redirectTo: '',
                        });
                      }
                    }
                  } else {
                    return res.json({
                      error: true,
                      typeError: '',
                      message:
                        "Sorry this appointment type not can't cancelled",
                      messageErr: 'Service Not Allowed',
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
                    message:
                      'Something went wrong. Please try again after some time!',
                    messageErr: 'Service Not Find',
                    redirect: false,
                    redirectTo: '',
                  });
                });
            } else {
              return res.json({
                error: false,
                typeError: '',
                message: 'Sorry this appointment is not accepted',
                redirect: false,
                redirectTo: '',
              });
            }
          }
        })
        .catch((err) => {
          return res.json({
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: 'Event Not Find',
            redirect: false,
            redirectTo: '',
          });
        });
    });
  }
};

exports.getEventsProgress = (req, res, next) => {
  Event.findAll({ status: 'In Progress' })
    .then((events) => {
      return res.json({
        error: false,
        typeError: '',
        message: 'Success',
        events: events,
        redirect: false,
        redirectTo: '',
      });
    })
    .catch((err) => {
      return res.json({
        error: true,
        typeError: 'backend',
        message: 'Something went wrong. Please try again after some time!',
        messageErr: 'Event In Progress Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.acceptEvent = (req, res, next) => {
  const idEvent = req.body.idEvent;
  Event.findByPk(idEvent)
    .then((event) => {
      if (event.status === 'In Progress') {
        event.status = 'accept';
        event.save();

        User.findByPk(event.userId)
          .then((userMail) => {
            let stDtM = event.event.start;
            stDtM = stDtM.replace('T', ' ');
            let enDtM = event.event.end;
            enDtM = enDtM.replace('T', ' ');

            global.sendMailEventAcceptEvent(userMail, stDtM, enDtM);

            return res.json({
              error: false,
              typeError: '',
              event: event,
              message: 'Success',
              redirect: false,
              redirectTo: '',
            });
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: 'User Not Find In Send Mail Accept Event',
              redirect: false,
              redirectTo: '',
            });
          });

        return res.json({
          error: false,
          typeError: '',
          event: event,
          message: 'Success',
          redirect: false,
          redirectTo: '',
        });
      } else {
        return res.json({
          error: false,
          typeError: '',
          message: "Sorry Status not can't changed",
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
        messageErr: 'Event Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.refuseEvent = (req, res, next) => {
  const idEvent = req.body.idEvent;
  Event.findByPk(idEvent)
    .then((event) => {
      if (event.status === 'In Progress') {
        if (event.paymentType === 'cart') {
          let indexSubscription = event.indexSubscription;
          let userId = event.userId;
          let serviceId = event.service.id;
          event.status = 'refuse';
          event
            .save()
            .then((eventRef) => {
              Service.findByPk(serviceId)
                .then((service) => {
                  User.findByPk(userId)
                    .then((userUpdate) => {
                      let subs = userUpdate.subscriptions;
                      if (service.type === 'normal') {
                        subs[indexSubscription].consAppNor =
                          subs[indexSubscription].consAppNor - 1;
                      } else {
                        subs[indexSubscription].consAppShort =
                          subs[indexSubscription].consAppShort - 1;
                      }
                      userUpdate.subscriptions = subs;
                      userUpdate.save();

                      let stDtM = eventRef.event.start;
                      stDtM = stDtM.replace('T', ' ');
                      let enDtM = eventRef.event.end;
                      enDtM = enDtM.replace('T', ' ');

                      global.sendMailEventRefuseEvent(userUpdate, stDtM, enDtM);

                      return res.json({
                        error: false,
                        typeError: '',
                        event: event,
                        message: 'Success',
                        redirect: false,
                        redirectTo: '',
                      });
                    })
                    .catch((err) => {
                      return res.json({
                        error: true,
                        typeError: 'backend',
                        message:
                          'Something went wrong. Please try again after some time!',
                        messageErr: 'User Not Update Refuse',
                        redirect: false,
                        redirectTo: '',
                      });
                    });
                })
                .catch((err) => {
                  return res.json({
                    error: true,
                    typeError: 'backend',
                    message:
                      'Something went wrong. Please try again after some time!',
                    messageErr: 'Service Not Find',
                    redirect: false,
                    redirectTo: '',
                  });
                });
            })
            .catch((err) => {
              return res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                messageErr: 'Event Not Update Refuse',
                redirect: false,
                redirectTo: '',
              });
            });
        } else {
          let userId = event.userId;
          let chargeId = event.chargeId;
          let promiseRefundCharge = global.refundCharge(chargeId);
          promiseRefundCharge.then(function(resRefCharge) {
            if (resRefCharge.error === true) {
              return res.json(resRefCharge);
            } else {
              event.status = 'refuse';
              event.save();

              User.findByPk(userId)
                .then((userMail) => {
                  let stDtM = event.event.start;
                  stDtM = stDtM.replace('T', ' ');
                  let enDtM = event.event.end;
                  enDtM = enDtM.replace('T', ' ');

                  global.sendMailEventRefuseEvent(userMail, stDtM, enDtM);

                  return res.json({
                    error: false,
                    typeError: '',
                    event: event,
                    message: 'Success',
                    redirect: false,
                    redirectTo: '',
                  });
                })
                .catch((err) => {
                  return res.json({
                    error: true,
                    typeError: 'backend',
                    message:
                      'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find In Send Mail Refuse else Cart',
                    redirect: false,
                    redirectTo: '',
                  });
                });
            }
          });
        }
      } else {
        return res.json({
          error: false,
          typeError: '',
          message: "Sorry Status not can't changed",
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
        messageErr: 'Event Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.deactivateUser = (req, res, next) => {
  const userId = req.body.userId;

  if (userId === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (userId.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    User.findByPk(userId)
      .then((user) => {
        if (user.statusAccount === 'active') {
          user.statusAccount = 'not active';
          user.save();
          return res.json({
            error: false,
            typeError: '',
            message: 'Success this account is deactivate now',
            redirect: false,
            redirectTo: '',
          });
        } else {
          return res.json({
            error: false,
            typeError: '',
            message: 'Sorry this account is really deactivate',
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
          messageErr: 'User Not Find',
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.activeUser = (req, res, next) => {
  const userId = req.body.userId;

  if (userId === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (userId.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    User.findByPk(userId)
      .then((user) => {
        if (user.statusAccount === 'not active') {
          user.statusAccount = 'active';
          user.save();
          return res.json({
            error: false,
            typeError: '',
            message: 'Success this account is active now',
            redirect: false,
            redirectTo: '',
          });
        } else {
          return res.json({
            error: false,
            typeError: '',
            message: 'Sorry this account is really active',
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
          messageErr: 'User Not Find',
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.createProduct = (req, res, next) => {
  //normal
  //short session

  const name = req.body.name;
  const description = req.body.description;
  const image = req.body.image;
  const interval = req.body.interval;
  const numAppNor = req.body.numAppNor;
  const numAppShort = req.body.numAppShort;
  const features = req.body.features;
  const benefits = req.body.benefits;
  const price = req.body.price;
  const dateString = this.getCurrentDate();
  const planId = req.body.planId;

  if (
    image === undefined ||
    description === undefined ||
    interval === undefined ||
    name === undefined ||
    numAppNor === undefined ||
    numAppShort === undefined ||
    features === undefined ||
    benefits === undefined ||
    price === undefined
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (typeof features !== 'object' || typeof benefits !== 'object') {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You must is object',
      redirect: false,
      redirectTo: '',
    });
  } else if (typeof parseInt(price) !== 'number') {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You must is number',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    image.length === 0 ||
    name.length === 0 ||
    description.length === 0
  ) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    interval !== 'day' &&
    interval !== 'week' &&
    interval !== 'month' &&
    interval !== 'year'
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message:
        'Sorry must insert location in between this options (day, week, month, year)',
      redirect: false,
      redirectTo: '',
    });
  } else {
    if (planId === undefined) {
      let planSave = new Plan({
        name: name,
        image: image,
        description: description,
        interval: interval,
        numAppNor: numAppNor,
        numAppShort: numAppShort,
        features: features,
        benefits: benefits,
        price: parseInt(price) * 100,
        status: 'active',
        productId: '',
        planId: '',
        created_at: dateString,
      });
      let promiseCreatePlan = global.createProdPlans(planSave);
      promiseCreatePlan.then(function(resPlanSave) {
        if (resPlanSave.error === true) {
          return res.json(resPlanSave);
        } else {
          planSave.productId = resPlanSave.product.id;
          planSave.planId = resPlanSave.plan.id;
          planSave
            .save()
            .then((plan) => {
              return res.json({
                error: false,
                typeError: '',
                message: 'Success this plan is saved',
                redirect: false,
                redirectTo: '',
              });
            })
            .catch((err) => {
              return res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                messageErr: 'Plan Not Save',
                redirect: false,
                redirectTo: '',
              });
            });
        }
      });
    } else {
      if (planId.length === 0) {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Sorry there is an empty field ',
          redirect: false,
          redirectTo: '',
        });
      } else {
        Plan.findByPk(planId)
          .then((plan) => {
            plan.name = name;
            plan.image = image;
            plan.description = description;
            plan.interval = interval;
            plan.numAppNor = numAppNor;
            plan.numAppShort = numAppShort;
            plan.features = features;
            plan.benefits = benefits;
            plan.price = parseInt(price) * 100;
            plan.status = 'active';
            plan
              .save()
              .then((planSave) => {
                let promiseCreatePlan = global.updateProdPlans(planSave);
                promiseCreatePlan.then(function(resPlanSave) {
                  if (resPlanSave.error === true) {
                    return res.json(resPlanSave);
                  } else {
                    planSave.planId = resPlanSave.plan.id;
                    planSave.save();
                    return res.json({
                      error: false,
                      typeError: '',
                      message: 'Success',
                      plan: planSave,
                      redirect: false,
                      redirectTo: '',
                    });
                  }
                });
              })
              .catch((err) => {
                return res.json({
                  error: true,
                  typeError: 'backend',
                  message:
                    'Something went wrong. Please try again after some time!',
                  messageErr: 'Plan Not Update',
                  redirect: false,
                  redirectTo: '',
                });
              });
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: 'Plan Not Find',
              redirect: false,
              redirectTo: '',
            });
          });
      }
    }
  }
};

exports.setupMail = (req, res, next) => {
  const apiKey = req.body.apiKey;
  const domain = req.body.domain;
  const currentDate = this.getCurrentDate();

  if (apiKey === undefined || domain === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (apiKey.length === 0 || domain.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    const mailgun = require('mailgun-js')({ apiKey: apiKey, domain: domain });
    const dataMail = {
      from: 'kriaa.oussama123@gmail.com',
      to: 'kriaa.oussama123@gmail.com',
      subject: 'test',
      body: 'test',
      html: '<br>',
    };

    mailgun.messages().send(dataMail, function(error, body) {
      if (error) {
        if (error.statusCode === 401) {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry this apikey or domain invalid',
            messageErr: error,
            redirect: false,
            redirectTo: '',
          });
        } else if (error.statusCode === 404) {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry this domain invalid',
            messageErr: error,
            redirect: false,
            redirectTo: '',
          });
        } else {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry this apikey or domain invalid',
            messageErr: error,
            redirect: false,
            redirectTo: '',
          });
        }
      } else {
        const mailSave = new MailS({
          apiKey: apiKey,
          domain: domain,
          created_at: currentDate,
        });

        MailS.findOne()
          .then((mailEx) => {
            if (mailEx) {
              mailEx.apiKey = apiKey;
              mailEx.domain = domain;
              mailEx.save();
              return res.json({
                error: false,
                typeError: '',
                message: 'Success Update',
                redirect: false,
                redirectTo: '',
              });
            } else {
              mailSave
                .save()
                .then((mail) => {
                  return res.json({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    redirect: false,
                    redirectTo: '',
                  });
                })
                .catch((err) => {
                  return res.json({
                    error: true,
                    typeError: 'backend',
                    message:
                      'Something went wrong. Please try again after some time!',
                    messageErr: 'Mail Not Save',
                    redirect: false,
                    redirectTo: '',
                  });
                });
            }
          })
          .catch((err) => {
            return res.json({
              error: true,
              typeError: 'backend',
              message:
                'Something went wrong. Please try again after some time!',
              messageErr: 'Mail Not Find',
              redirect: false,
              redirectTo: '',
            });
          });
      }
    });
  }
};

exports.getAllAPackages = (req, res, next) => {
  Plan.findAll()
    .then((plans) => {
      let promiseFPlans = global.filterPlan(plans);
      promiseFPlans.then(function(resFPlans) {
        return res.json({
          error: false,
          typeError: '',
          message: 'Success',
          plansActive: resFPlans.planActive,
          plansDEactive: resFPlans.planDEactive,
          redirect: false,
          redirectTo: '',
        });
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

exports.deactivatePackage = (req, res, next) => {
  const planId = req.body.planId;
  if (planId === undefined) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (planId.length === 0) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else {
    Plan.findByPk(planId)
      .then((plan) => {
        let deactivateProPla = global.deactivePrPlan(
          plan.productId,
          plan.planId,
        );
        deactivateProPla.then(function(resDeaProdPlan) {
          if (resDeaProdPlan.error === true) {
            return res.json(resDeaProdPlan);
          } else {
            plan.status = 'not active';
            plan.save();
            resDeaProdPlan['plan'] = plan;
            return res.json(resDeaProdPlan);
          }
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
  }
};

exports.postArticle = (req, res, next) => {
  const title = req.body.title;
  const image = req.body.image;
  const description = req.body.description;
  const share = req.body.share;
  //const status = req.body.status;
  const dateString = this.getCurrentDate();

  if (
    title === undefined ||
    description === undefined ||
    image === undefined ||
    share === undefined
  ) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry there field You did not send it',
      redirect: false,
      redirectTo: '',
    });
  } else if (
    image.length === 0 ||
    title.length === 0 ||
    description.length === 0
  ) {
    return res.json({
      error: true,
      typeError: 'client',
      message: 'Sorry there is an empty field ',
      redirect: false,
      redirectTo: '',
    });
  } else if (share !== true && share !== false) {
    return res.json({
      error: true,
      typeError: 'tech',
      message: 'Sorry must insert share in between this options (true, false)',
      redirect: false,
      redirectTo: '',
    });
  } else {
    Article.findOne({ where: { title: title } })
      .then((article) => {
        if (article) {
          return res.json({
            error: true,
            typeError: 'tech',
            message: 'Sorry title already exists',
            redirect: false,
            redirectTo: '',
          });
        } else {
          const articleSave = new Article({
            title: title,
            description: description,
            image: image,
            share: share,
            status: 'active',
            created_at: dateString,
          });

          articleSave
            .save()
            .then((art) => {
              return res.json({
                error: false,
                typeError: '',
                message: 'Success',
                article: art,
                redirect: false,
                redirectTo: '',
              });
            })
            .catch((err) => {
              return res.json({
                error: true,
                typeError: 'backend',
                message:
                  'Something went wrong. Please try again after some time!',
                messageErr: 'Article Not Save',
                redirect: false,
                redirectTo: '',
              });
            });
        }
      })
      .catch((err) => {
        return res.json({
          error: true,
          typeError: 'backend',
          message: 'Something went wrong. Please try again after some time!',
          messageErr: 'Article Not Find By Title',
          redirect: false,
          redirectTo: '',
        });
      });
  }
};

exports.deactivateArticle = (req, res, next) => {
  const artId = req.body.artId;

  Article.findByPk(artId)
    .then((article) => {
      if (article) {
        if (article.status === 'not active') {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry tis article already deactivated',
            redirect: false,
            redirectTo: '',
          });
        } else {
          article.status = 'not active';
          article.save();
          return res.json({
            error: false,
            typeError: '',
            message: 'Successful deactivated article',
            article: article,
            redirect: false,
            redirectTo: '',
          });
        }
      } else {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Article with this id not exicte',
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
        messageErr: 'Article Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};

exports.activateArticle = (req, res, next) => {
  const artId = req.body.artId;

  Article.findByPk(artId)
    .then((article) => {
      if (article) {
        if (article.status === 'active') {
          return res.json({
            error: true,
            typeError: 'client',
            message: 'Sorry tis article already active',
            redirect: false,
            redirectTo: '',
          });
        } else {
          article.status = 'active';
          article.save();
          return res.json({
            error: false,
            typeError: '',
            message: 'Successful active article',
            article: article,
            redirect: false,
            redirectTo: '',
          });
        }
      } else {
        return res.json({
          error: true,
          typeError: 'client',
          message: 'Article with this id not exicte',
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
        messageErr: 'Article Not Find',
        redirect: false,
        redirectTo: '',
      });
    });
};
