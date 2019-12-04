const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Survey = require('../models/survey.model');
const config = require('./../config/keys');
const passport = require('passport');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
//Get Config Key
const keys = require('../config/keys');
//Lib For Check String is Color Or Not
const isColor = require('is-color');

const request = require('request');
const moment = require('moment');
//Import Event Model
const Event = require('../models/event.model');
//Import Stripe Model
const StripeKey = require('../models/stripe.model');
//Import Service Model
const Service = require('../models/service.model');
//Import Plans Model
const Plans = require('../models/plan.model');

//Import Mails Model
const MailS = require('../models/mail.model');


exports.getErrStripe = (err) => {
    if (err.statusCode === 400) {
        return {
            error: true,
            typeError: 'client',
            message: 'The request was unacceptable, often due to missing a required parameter.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 401) {
        return {
            error: true,
            typeError: 'client',
            message: 'No valid API key provided.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 402) {
        return {
            error: true,
            typeError: 'client',
            message: 'The parameters were valid but the request failed.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 404) {
        return {
            error: true,
            typeError: 'client',
            message: 'The requested resource doesn\'t exist.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 409) {
        return {
            error: true,
            typeError: 'client',
            message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 429) {
        return {
            error: true,
            typeError: 'client',
            message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
        return {
            error: true,
            typeError: 'client',
            message: 'Something went wrong on Stripe\'s end. (These are rare.)',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'api_connection_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Failure to connect to Stripe\'s API.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'api_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'authentication_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Failure to properly authenticate yourself in the request.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'card_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'idempotency_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'invalid_request_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Invalid request errors arise when your request has invalid parameters.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'rate_limit_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Too many requests hit the API too quickly.',
            redirect: false,
            redirectTo: ''
        };
    } else if (err.type === 'validation_error') {
        return {
            error: true,
            typeError: 'client',
            message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
            redirect: false,
            redirectTo: ''
        };
    } else {
        return {
            error: true,
            typeError: 'backend',
            message: 'Something went wrong. Please try again after some time!',
            messageErr: err,
            redirect: false,
            redirectTo: ''
        };
    }
};

exports.sendingMailConfirmation = (email, subject, body, token) => {
    const api_key = keys.mailgun.apiKey;
    const domain = keys.mailgun.domain;
    const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
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
};

exports.sendingResetPasswordMail = (email, subject, body, token) => {

    MailS.findOne().then(mail => {
        if (mail) {

            const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
            const dataMail = {
                from: 'kriaa.oussama123@gmail.com',
                to: email,
                subject: subject,
                body: body,
                html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\"> Reset Password </td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">Reset Password</td></tr><tr class=\"action\" style=\" text-align: center;\"><td><a class=\"link\" style=\" background: #2199e8;color: white;padding: 10px 30px;text-decoration: none;font-size: 20px;\" href='https://frontend.fictiontomission.com/resetPassword/" + token + "'>Reset</a></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
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
                    this.sendingMailConfirmation(userV.email, 'Confirm your email address', 'Confirm your email address', userV.tokenEmail);
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
                    this.sendingMailConfirmation(userV.email, 'Confirm your email address', 'Confirm your email address', tokenMailV);
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'We sent you mail for confirm account ,Please check your mail',
                        redirect: true,
                        redirectTo: 'mailConfirm'
                    });
                }
            }).catch(err => {
                console.log(err);
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: err,
                    redirect: false,
                    redirectTo: ''
                });
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

};

exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.validURL = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(url);
};

exports.validDuration = (duration) => {
    if (duration.length < 5) {
        return false;
    } else {
        let pos = duration.indexOf(':');
        if (pos > 1) {
            let data = duration.split(':');
            if (Number.isInteger(parseInt(data[0])) && Number.isInteger(parseInt(data[1]))) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};

exports.validColr = (color) => {
    return isColor(color);
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

exports.getCurrentDateuUTC = () => {

    function treatNumber(number) {
        if (number < 10) {
            return '0' + number;
        } else {
            return number;
        }
    };


    return new Promise(function (resolve, reject) {
        const currentDate = new Date();
        let date = currentDate.getDate();
        if (parseInt(date) < 10) {
            date = '0' + date;
        }
        let month = currentDate.getMonth() + 1;
        if (parseInt(month) < 10) {
            month = '0' + month;
        }
        const year = currentDate.getFullYear();

        let hours = currentDate.getHours();
        if (parseInt(hours) < 10) {
            hours = '0' + hours;
        }
        let minite = currentDate.getMinutes();
        if (parseInt(minite) < 10) {
            minite = '0' + minite;
        }
        let second = currentDate.getSeconds();
        if (parseInt(second) < 10) {
            second = '0' + second;
        }
        resolve({
            currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
        });

    });

};

exports.getAuthTokenZoho = () => {
    return new Promise(function (resolve, reject) {
        request('https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoCRM/crmapi&EMAIL_ID=' + keys.zohocrm.email + '&PASSWORD=' + keys.zohocrm.password + '&DISPLAY_NAME=' + keys.zohocrm.password, {json: true}, (err, res, body) => {
            if (err) {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagePos: 'Zoho First Api',
                    messageErr: err,
                    authToken: true,
                    redirect: false,
                    redirectTo: ''
                });
            }
            const startIndex = body.indexOf('AUTHTOKEN');
            const finIndex = body.indexOf('RESULT');
            const length = finIndex - startIndex;
            let authToken = body.substr(startIndex, length);
            authToken = authToken.replace("AUTHTOKEN=", "");
            resolve({
                error: false,
                authToken: authToken,
            });
        });

    });
};

exports.getAccessTokenZoho = (authToken) => {
    const dataForm = {
        client_id: keys.zohocrm.clientID,
        client_secret: keys.zohocrm.clientSecret,
        grant_type: keys.zohocrm.grant_type,
        authtoken: authToken,
        scope: keys.zohocrm.scope
    };
    return new Promise(function (resolve, reject) {
        request({
            uri: "https://accounts.zoho.com/oauth/v2/token/self/authtooauth",
            method: "POST",
            headers: {},
            form: {
                client_id: keys.zohocrm.clientID,
                client_secret: keys.zohocrm.clientSecret,
                grant_type: keys.zohocrm.grant_type,
                authtoken: authToken,
                scope: keys.zohocrm.scope
            }
        }, function (error, response, body) {
            if (error) {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagePos: 'Zoho Second Api Access Token',
                    messageErr: error,
                    authToken: true,
                    redirect: false,
                    redirectTo: ''
                });
            } else {
                console.log(body);
                let resBody = JSON.parse(body);
                console.log(resBody, 'resbody');
                let accessToken = resBody.access_token;
                resolve({
                    error: false,
                    accessToken: accessToken
                });
            }
        });
    });
};

exports.postLeadZoho = (authToken, accessToken, user) => {

    const dataFormUser = {
        "data": [{
            Company: '',
            Last_Name: user.lastName,
            First_Name: user.firstName,
            Email: user.email,
            State: user.country
        }]
    };

    return new Promise(function (resolve, reject) {

        request({
            uri: "https://www.zohoapis.com/crm/v2/Leads",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Zoho-oauthtoken ' + accessToken
            },
            json: dataFormUser
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagePos: 'Zoho Theard Api post Lead',
                    messageErr: error,
                    authToken: true,
                    redirect: false,
                    redirectTo: ''
                });
            } else {
                let resBody = body;
                if (resBody.data) {
                    if (resBody.data[0].code === 'SUCCESS') {
                        resolve({
                            error: false,
                            message: 'success'
                        });
                    } else {
                        resolve({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messagePos: 'Zoho Theard Api post Lead not success',
                            messageErr: error,
                            authToken: true,
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                } else {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Theard Api post Lead not success',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }
        });
    });
};

exports.zohoCrm = (user) => {
    let authTokenRes = '';
    let accessTokenRes = '';
    let currentDate = '';


    function getCurrentDateuTC() {

        return new Promise(function (resolve, reject) {
            const currentDate = new Date();
            let date = currentDate.getDate();
            if (parseInt(date) < 10) {
                date = '0' + date;
            }
            let month = currentDate.getMonth() + 1;
            if (parseInt(month) < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear();

            let hours = currentDate.getHours();
            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }
            let minite = currentDate.getMinutes();
            if (parseInt(minite) < 10) {
                minite = '0' + minite;
            }
            let second = currentDate.getSeconds();
            if (parseInt(second) < 10) {
                second = '0' + second;
            }
            resolve({
                currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
            });

        });
    }

    function getAuthTokenZoho() {
        return new Promise(function (resolve, reject) {
            request('https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoCRM/crmapi&EMAIL_ID=' + keys.zohocrm.email + '&PASSWORD=' + keys.zohocrm.password + '&DISPLAY_NAME=' + keys.zohocrm.password, {json: true}, (err, res, body) => {
                if (err) {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho First Api',
                        messageErr: err,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                }
                const startIndex = body.indexOf('AUTHTOKEN');
                const finIndex = body.indexOf('RESULT');
                const length = finIndex - startIndex;
                let authToken = body.substr(startIndex, length);
                authToken = authToken.replace("AUTHTOKEN=", "");
                resolve({
                    error: false,
                    authToken: authToken,
                });
            });

        });
    }

    function getAccessTokenZoho(authToken) {
        const dataForm = {
            client_id: keys.zohocrm.clientID,
            client_secret: keys.zohocrm.clientSecret,
            grant_type: keys.zohocrm.grant_type,
            authtoken: authToken,
            scope: keys.zohocrm.scope
        };
        console.log(authToken, 'authToken');
        return new Promise(function (resolve, reject) {
            request({
                uri: "https://accounts.zoho.com/oauth/v2/token/self/authtooauth",
                method: "POST",
                headers: {},
                form: {
                    client_id: keys.zohocrm.clientID,
                    client_secret: keys.zohocrm.clientSecret,
                    grant_type: keys.zohocrm.grant_type,
                    authtoken: authToken,
                    scope: keys.zohocrm.scope
                }
            }, function (error, response, body) {
                if (error) {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Second Api Access Token',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                } else {
                    console.log(body);
                    let resBody = JSON.parse(body);
                    console.log(resBody, 'resbody');
                    let accessToken = resBody.access_token;
                    resolve({
                        error: false,
                        accessToken: accessToken
                    });
                }
            });
        });
    }

    function postLeadZoho(authToken, accessToken, user) {
        const dataFormUser = {
            "data": [{
                Company: '',
                Last_Name: user.lastName,
                First_Name: user.firstName,
                Email: user.email,
                State: user.country
            }]
        };

        return new Promise(function (resolve, reject) {

            request({
                uri: "https://www.zohoapis.com/crm/v2/Leads",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Zoho-oauthtoken ' + accessToken
                },
                json: dataFormUser
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Theard Api post Lead',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                } else {
                    let resBody = body;
                    if (resBody.data) {
                        if (resBody.data[0].code === 'SUCCESS') {
                            resolve({
                                error: false,
                                message: 'success'
                            });
                        } else {
                            resolve({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messagePos: 'Zoho Theard Api post Lead not success',
                                messageErr: error,
                                authToken: true,
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    } else {
                        resolve({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messagePos: 'Zoho Theard Api post Lead not success',
                            messageErr: error,
                            authToken: true,
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                }
            });
        });
    }

    return new Promise(function (resolve, reject) {

        let promiseDate = getCurrentDateuTC();
        promiseDate.then(function (currentDateRes) {
            currentDate = currentDateRes.currentDate;

            Admin.findOne().then(admin => {

                if (admin.authToken === 'In Progress') {

                    let promiseAuth = getAuthTokenZoho();
                    promiseAuth.then(function (value) {
                        console.log(value);
                        if (value.error === true) {
                            resolve(value);
                        } else {
                            authTokenRes = value.authToken.replace("\n", '');
                            let promiseAcessToken = getAccessTokenZoho(authTokenRes);
                            promiseAcessToken.then(function (valueAcess) {
                                if (valueAcess.error === true) {
                                    resolve(valueAcess);
                                } else {
                                    accessTokenRes = valueAcess.accessToken;
                                    console.log(authTokenRes, accessTokenRes);
                                    let promisePostLead = postLeadZoho(authTokenRes, accessTokenRes, user);
                                    promisePostLead.then(function (valueLead) {
                                        if (valueLead.error === true) {
                                            resolve(valueLead);
                                        } else {
                                            admin.authToken = authTokenRes;
                                            admin.access_token = accessTokenRes;
                                            admin.date_Token = currentDate;
                                            admin.save();
                                            resolve({
                                                error: false,
                                                message: 'Success'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    let date_token = new Date(admin.date_Token);
                    let current_Date = new Date(currentDate);
                    date_token = date_token.setMinutes(date_token.getMinutes() + 40);
                    if (date_token > current_Date) {
                        authTokenRes = admin.authToken;
                        accessTokenRes = admin.access_token;
                        let promisePostLead = this.postLeadZoho(authTokenRes, accessTokenRes, user);
                        promisePostLead.then(function (valueLead) {
                            console.log(authTokenRes, accessTokenRes, 'sss');
                            if (valueLead.error === true) {
                                resolve(valueLead);
                            } else {
                                resolve({
                                    error: false,
                                    message: 'Success'
                                });
                            }
                        });

                    } else {
                        let promiseAuth = getAuthTokenZoho();
                        promiseAuth.then(function (value) {
                            if (value.error === true) {
                                resolve(value);
                            } else {
                                authTokenRes = value.authToken.replace("\n", '');
                                let promiseAcessToken = getAccessTokenZoho(authTokenRes);
                                promiseAcessToken.then(function (valueAcess) {
                                    if (valueAcess.error === true) {
                                        resolve(valueAcess);
                                    } else {
                                        accessTokenRes = valueAcess.accessToken;
                                        let promisePostLead = postLeadZoho(authTokenRes, accessTokenRes, user);
                                        promisePostLead.then(function (valueLead) {
                                            if (valueLead.error === true) {
                                                resolve(valueLead);
                                            } else {
                                                admin.authToken = authTokenRes;
                                                admin.access_token = accessTokenRes;
                                                admin.date_Token = currentDate;
                                                admin.save();
                                                resolve({
                                                    error: false,
                                                    message: 'Success'
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
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagepos: 'Admin Not Find',
                    messageErr: err,
                    authToken: true,
                    redirect: false,
                    redirectTo: ''
                });
            });
        });


    });

};

exports.forgetUserG = (email) => {

    let dateString = '';

    function getCurrentDateuTC() {
        return new Promise(function (resolve, reject) {
            const currentDate = new Date();
            let date = currentDate.getDate();
            if (parseInt(date) < 10) {
                date = '0' + date;
            }
            let month = currentDate.getMonth() + 1;
            if (parseInt(month) < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear();

            let hours = currentDate.getHours();
            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }
            let minite = currentDate.getMinutes();
            if (parseInt(minite) < 10) {
                minite = '0' + minite;
            }
            let second = currentDate.getSeconds();
            if (parseInt(second) < 10) {
                second = '0' + second;
            }
            resolve({
                currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
            });

        });
    }

    function sendingResetPasswordMail(email, subject, body, token) {
        const api_key = keys.mailgun.apiKey;
        const domain = keys.mailgun.domain;
        const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
        const dataMail = {
            from: 'kriaa.oussama123@gmail.com',
            to: email,
            subject: subject,
            body: body,
            html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\"> Reset Password </td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">Reset Password</td></tr><tr class=\"action\" style=\" text-align: center;\"><td><a class=\"link\" style=\" background: #2199e8;color: white;padding: 10px 30px;text-decoration: none;font-size: 20px;\" href='https://frontend.fictiontomission.com/resetPassword/" + token + "'>Reset</a></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
        };

        mailgun.messages().send(dataMail, function (error, body) {
            return 'Success';
        });
    };

    let promiseDate = getCurrentDateuUTC();
    promiseDate.then(function (currentDateRes) {
        dateString = currentDateRes.currentDate;

        User.findOne({ where: {email: email}}).then(user => {
            if (user) {
                let pinNumber = Math.floor(1000 + Math.random() * 9000);
                let tokenPassword = Buffer.from(user.id + "/" + "5h" + "/" + pinNumber).toString('base64');
                user.tokenPassword = tokenPassword;
                user.created_at_token_password = dateString;
                user.save();
                sendingResetPasswordMail(email, 'Reset Password', 'Reset Password', tokenPassword);
                return res.json({
                    error: false,
                    typeError: '',
                    message: 'we send new confirmation .Please check mail!',
                    redirect: false,
                    redirectTo: ''
                });
            } else {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry this email not exist. Thank You',
                    redirect: false,
                    redirectTo: ''
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

    });
};

exports.forgetAdminG = (email) => {

    let dateString = '';

    function getCurrentDateuTC() {
        return new Promise(function (resolve, reject) {
            const currentDate = new Date();
            let date = currentDate.getDate();
            if (parseInt(date) < 10) {
                date = '0' + date;
            }
            let month = currentDate.getMonth() + 1;
            if (parseInt(month) < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear();

            let hours = currentDate.getHours();
            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }
            let minite = currentDate.getMinutes();
            if (parseInt(minite) < 10) {
                minite = '0' + minite;
            }
            let second = currentDate.getSeconds();
            if (parseInt(second) < 10) {
                second = '0' + second;
            }
            resolve({
                currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
            });

        });
    }

    function sendingResetPasswordMail(email, subject, body, token) {
        const api_key = keys.mailgun.apiKey;
        const domain = keys.mailgun.domain;
        const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
        const dataMail = {
            from: 'kriaa.oussama123@gmail.com',
            to: email,
            subject: subject,
            body: body,
            html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\"> Reset Password </td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">Reset Password</td></tr><tr class=\"action\" style=\" text-align: center;\"><td><a class=\"link\" style=\" background: #2199e8;color: white;padding: 10px 30px;text-decoration: none;font-size: 20px;\" href='https://frontend.fictiontomission.com/resetPassword/" + token + "'>Reset</a></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
        };

        mailgun.messages().send(dataMail, function (error, body) {
            return 'Success';
        });
    };

    let promiseDate = getCurrentDateuUTC();
    promiseDate.then(function (currentDateRes) {
        dateString = currentDateRes.currentDate;

      Admin.findOne({ where: { email: email}}).then(admin => {
            if (admin) {
                let pinNumber = Math.floor(1000 + Math.random() * 9000);
                let tokenPassword = Buffer.from(admin.id + "/" + "5h" + "/" + pinNumber).toString('base64');
                admin.tokenPassword = tokenPassword;
                admin.created_at_token_password = dateString;
                admin.save();
                sendingResetPasswordMail(email, 'Reset Password', 'Reset Password', tokenPassword);
                return res.json({
                    error: false,
                    typeError: '',
                    message: 'we send new confirmation .Please check mail!',
                    redirect: false,
                    redirectTo: ''
                });
            } else {
                return res.json({
                    error: true,
                    typeError: 'client',
                    message: 'Sorry this email not exist. Thank You',
                    redirect: false,
                    redirectTo: ''
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

    });
};

exports.regCustomer = (userId, tokenStripe, service) => {
    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);
                stripeNode.charges.create({
                        amount: parseInt(service.price),
                        currency: "usd",
                        source: tokenStripe.id,
                        description: "Charge for" + service.name
                    },
                    function (err, charge) {

                        console.log(err);
                        if (err) {
                            resolve({
                                error: true,
                                typeError: 'Client',
                                message: 'Sorry Plase verify stripe accoun there is problem',
                                messageErr: 'Creat Charge',
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                        resolve({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            charge: charge,
                            redirect: false,
                            redirectTo: ''
                        });
                    });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });


    });
};

exports.zohoCrmV2 = (user) => {
    let authTokenRes = '';
    let accessTokenRes = '';
    let refreshTokenRes = '';
    let currentDate = '';


    function getCurrentDateuTC() {
        return new Promise(function (resolve, reject) {
            const currentDate = new Date();
            let date = currentDate.getDate();
            if (parseInt(date) < 10) {
                date = '0' + date;
            }
            let month = currentDate.getMonth() + 1;
            if (parseInt(month) < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear();

            let hours = currentDate.getHours();
            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }
            let minite = currentDate.getMinutes();
            if (parseInt(minite) < 10) {
                minite = '0' + minite;
            }
            let second = currentDate.getSeconds();
            if (parseInt(second) < 10) {
                second = '0' + second;
            }
            resolve({
                currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
            });

        });
    }

    function getAuthTokenZoho() {
        return new Promise(function (resolve, reject) {
            request('https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoCRM/crmapi&EMAIL_ID=' + keys.zohocrm.email + '&PASSWORD=' + keys.zohocrm.password + '&DISPLAY_NAME=' + keys.zohocrm.password, {json: true}, (err, res, body) => {
                if (err) {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho First Api',
                        messageErr: err,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                }
                const startIndex = body.indexOf('AUTHTOKEN');
                const finIndex = body.indexOf('RESULT');
                const length = finIndex - startIndex;
                let authToken = body.substr(startIndex, length);
                authToken = authToken.replace("AUTHTOKEN=", "");
                resolve({
                    error: false,
                    authToken: authToken,
                });
            });

        });
    }

    function getAccessTokenZoho(authToken) {
        const dataForm = {
            client_id: keys.zohocrm.clientID,
            client_secret: keys.zohocrm.clientSecret,
            grant_type: keys.zohocrm.grant_type,
            authtoken: authToken,
            scope: keys.zohocrm.scope
        };
        return new Promise(function (resolve, reject) {
            request({
                uri: "https://accounts.zoho.com/oauth/v2/token/self/authtooauth",
                method: "POST",
                headers: {},
                form: {
                    client_id: keys.zohocrm.clientID,
                    client_secret: keys.zohocrm.clientSecret,
                    grant_type: keys.zohocrm.grant_type,
                    authtoken: authToken,
                    scope: keys.zohocrm.scope
                }
            }, function (error, response, body) {
                if (error) {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Second Api Access Token',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                } else {
                    console.log(body);
                    let resBody = JSON.parse(body);
                    console.log(resBody, 'resbody');
                    let accessToken = resBody.access_token;
                    let refreshToken = resBody.refresh_token;
                    resolve({
                        error: false,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    });
                }
            });
        });
    }

    function getAccessTokenByRefrechToken(refrechToken) {
        return new Promise(function (resolve, reject) {
            request({
                uri: "https://accounts.zoho.com/oauth/v2/token?refresh_token=" + refrechToken + "&client_id=" + keys.zohocrm.clientID + "&client_secret=" + keys.zohocrm.clientSecret + "&grant_type=refresh_token",
                method: "POST",
                headers: {}
            }, function (error, response, body) {
                if (error) {
                    console.log('refrecttoken', error);
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Api Refrech Token',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                } else {

                    let resBody = JSON.parse(body);
                    let accessToken = resBody.access_token;
                    resolve({
                        error: false,
                        accessToken: accessToken,
                    });
                }
            });
        });
    }

    function postLeadZoho(authToken, accessToken, user) {
        const dataFormUser = {
            "data": [{
                Company: '',
                Last_Name: user.lastName,
                First_Name: user.firstName,
                Email: user.email,
                State: user.country
            }]
        };

        return new Promise(function (resolve, reject) {

            request({
                uri: "https://www.zohoapis.com/crm/v2/Leads",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Zoho-oauthtoken ' + accessToken
                },
                json: dataFormUser
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Zoho Theard Api post Lead',
                        messageErr: error,
                        authToken: true,
                        redirect: false,
                        redirectTo: ''
                    });
                } else {
                    let resBody = body;
                    if (resBody.data) {
                        if (resBody.data[0].code === 'SUCCESS') {
                            resolve({
                                error: false,
                                message: 'success'
                            });
                        } else {
                            resolve({
                                error: true,
                                typeError: 'backend',
                                message: 'Something went wrong. Please try again after some time!',
                                messagePos: 'Zoho Theard Api post Lead not success',
                                messageErr: error,
                                authToken: true,
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    } else {
                        resolve({
                            error: true,
                            typeError: 'backend',
                            message: 'Something went wrong. Please try again after some time!',
                            messagePos: 'Zoho Theard Api post Lead not success',
                            messageErr: error,
                            authToken: true,
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                }
            });
        });
    }

    return new Promise(function (resolve, reject) {

        let promiseDate = getCurrentDateuTC();
        promiseDate.then(function (currentDateRes) {
            currentDate = currentDateRes.currentDate;

            Admin.findOne().then(admin => {

                if (admin.authToken === 'In Progress') {

                    let promiseAuth = getAuthTokenZoho();
                    promiseAuth.then(function (value) {
                        if (value.error === true) {
                            resolve(value);
                        } else {
                            authTokenRes = value.authToken.replace("\n", '');
                            let promiseAcessToken = getAccessTokenZoho(authTokenRes);
                            promiseAcessToken.then(function (valueAcess) {
                                if (valueAcess.error === true) {
                                    resolve(valueAcess);
                                } else {
                                    accessTokenRes = valueAcess.accessToken;
                                    refreshTokenRes = valueAcess.refreshToken;

                                    let promisePostLead = postLeadZoho(authTokenRes, accessTokenRes, user);
                                    promisePostLead.then(function (valueLead) {
                                        if (valueLead.error === true) {
                                            resolve(valueLead);
                                        } else {
                                            admin.authToken = authTokenRes;
                                            admin.access_token = accessTokenRes;
                                            admin.refresh_token = refreshTokenRes;
                                            admin.numAccess = 0;
                                            admin.date_Token = currentDate;
                                            admin.save();
                                            resolve({
                                                error: false,
                                                message: 'Success'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    let date_token = new Date(admin.date_Token);
                    let current_Date = new Date(currentDate);
                    date_token = date_token.setMinutes(date_token.getMinutes() + 50);
                    if (date_token > current_Date) {
                        authTokenRes = admin.authToken;
                        accessTokenRes = admin.access_token;
                        refreshTokenRes = admin.refresh_token;

                        let promisePostLead = postLeadZoho(authTokenRes, accessTokenRes, user);
                        promisePostLead.then(function (valueLead) {
                            if (valueLead.error === true) {
                                resolve(valueLead);
                            } else {
                                resolve({
                                    error: false,
                                    message: 'Success'
                                });
                            }
                        });

                    } else if (admin.numAccess <= 3) {
                        let promiseRefrechToken = getAccessTokenByRefrechToken(admin.refresh_token);
                        promiseRefrechToken.then(function (valueRefrech) {
                            if (valueRefrech.error === true) {
                                resolve(valueRefrech);
                            } else {
                                accessTokenRes = valueRefrech.accessToken;
                                let promisePostLeadRef = postLeadZoho(admin.authToken, accessTokenRes, user);
                                promisePostLeadRef.then(function (valueLeadRef) {
                                    if (valueLeadRef.error === true) {
                                        resolve(valueLeadRef);
                                    } else {

                                        admin.access_token = accessTokenRes;
                                        admin.numAccess = admin.numAccess + 1;
                                        admin.date_Token = currentDate;
                                        admin.save();
                                        resolve({
                                            error: false,
                                            message: 'Success'
                                        });
                                    }
                                });
                            }
                        });

                    } else {
                        let promiseAuth = getAuthTokenZoho();
                        promiseAuth.then(function (value) {
                            if (value.error === true) {
                                resolve(value);
                            } else {
                                authTokenRes = value.authToken.replace("\n", '');
                                let promiseAcessToken = getAccessTokenZoho(authTokenRes);
                                promiseAcessToken.then(function (valueAcess) {
                                    if (valueAcess.error === true) {
                                        resolve(valueAcess);
                                    } else {
                                        accessTokenRes = valueAcess.accessToken;
                                        refreshTokenRes = valueAcess.refreshToken;
                                        let promisePostLead = postLeadZoho(authTokenRes, accessTokenRes, user);
                                        promisePostLead.then(function (valueLead) {
                                            if (valueLead.error === true) {
                                                resolve(valueLead);
                                            } else {
                                                admin.authToken = authTokenRes;
                                                admin.access_token = accessTokenRes;
                                                admin.refresh_token = refreshTokenRes;
                                                admin.date_Token = currentDate;
                                                admin.numAccess = 0;
                                                admin.save();
                                                resolve({
                                                    error: false,
                                                    message: 'Success'
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
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagepos: 'Admin Not Find',
                    messageErr: err,
                    authToken: true,
                    redirect: false,
                    redirectTo: ''
                });
            });
        });


    });

};

exports.eventUser = (userId) => {
    return new Promise(function (resolve, reject) {
        console.log("===============================")

        Event.findAll({where: {userId: userId}}).then(events => {
            resolve({
                error: false,
                event: events,
                message: 'success'
            });
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messagePos: 'Events User Not Find',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.paymentIntents = (user, token, service) => {
    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);
                stripeNode.paymentIntents.create({
                    amount: parseInt(service.price),
                    currency: 'usd',
                    payment_method_types: ['card'],
                    payment_method: token,
                    capture_method: 'automatic',
                    customer: 'cus_FLqgn8SHas4fGP'
                }, function (err, paymentIntent) {
                    if (err) {
                        resolve({
                            error: true,
                            typeError: 'Client',
                            message: 'Sorry Plase verify stripe accoun there is problem',
                            messageErr: 'Stripe Err Payment Intents',
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                    console.log(paymentIntent);
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        paymentIntent: paymentIntent,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.checkDuration = (events, startProgress, endProgress, dayWork) => {

    let currentDate = '';
    let durationStarts = [];
    let durationEnds = [];


    function getCurrentDateuTC() {
        return new Promise(function (resolve, reject) {
            const currentDate = new Date();
            let date = currentDate.getDate();
            if (parseInt(date) < 10) {
                date = '0' + date;
            }
            let month = currentDate.getMonth() + 1;
            if (parseInt(month) < 10) {
                month = '0' + month;
            }
            const year = currentDate.getFullYear();

            let hours = currentDate.getHours();
            if (parseInt(hours) < 10) {
                hours = '0' + hours;
            }
            let minite = currentDate.getMinutes();
            if (parseInt(minite) < 10) {
                minite = '0' + minite;
            }
            let second = currentDate.getSeconds();
            if (parseInt(second) < 10) {
                second = '0' + second;
            }
            resolve({
                currentDate: year + "-" + month + "-" + date + ' ' + hours + ':' + minite + ':' + second
            });

        });
    }

    function getAllDateReser(eventsReser) {
        return new Promise(function (resolve, reject) {
            let startDr = [];
            let endDr = [];
            for (let i = 0; i < eventsReser.length; i++) {
                startDr.push(eventsReser[i].event.start.toString().substr(11, 8));
                endDr.push(eventsReser[i].event.end.toString().substr(11, 8));
            }
            resolve({
                durationStarts: startDr,
                durationEnds: endDr
            });
        });
    }

    function checkLiberty(start, end, dataStart, dataEnd, day) {
        return new Promise(function (resolve, reject) {
            start = new Date(day + ' ' + start);
            end = new Date(day + ' ' + end);
            let arrayStatus = [];
            let stop = '';
            for (let i = 0; i < dataStart.length; i++) {

                let startArray = new Date(day + ' ' + dataStart[i]);
                let endArray = new Date(day + ' ' + dataEnd[i]);

                if ((end > startArray && end >= endArray) && (start > startArray && start >= endArray)) {
                    arrayStatus.push('true');
                } else if ((end < startArray && end <= endArray) && (start < startArray && start <= endArray)) {
                    arrayStatus.push('true');
                } else if ((end <= startArray && end <= endArray) && (start < startArray && start <= endArray)) {
                    arrayStatus.push('true');
                } else {
                    stop = endArray;
                    break;
                }
            }
            if (arrayStatus.length === dataStart.length) {
                resolve({
                    res: true
                });
            } else {
                resolve({
                    res: stop
                });
            }
        });
    }

    return new Promise(function (resolve, reject) {

        let promiseDate = getCurrentDateuTC();
        promiseDate.then(function (currentDateRes) {
            currentDate = currentDateRes.currentDate;
            let promiseDurationReserve = getAllDateReser(events);
            promiseDurationReserve.then(function (durationReserve) {
                durationStarts = durationReserve.durationStarts;
                durationEnds = durationReserve.durationEnds;
                console.log(durationStarts, durationEnds);
                let checkLibertyPromise = checkLiberty(startProgress, endProgress, durationStarts, durationEnds, dayWork);
                checkLibertyPromise.then(function (resAccess) {
                    resolve(resAccess);
                });
            });

        });
    });
};

exports.multipleOrder = (user, events) => {

    let eventsSave = [];

    function getService(serviceId) {
        return new Promise(function (resolve, reject) {

            Service.findByPk(serviceId).then(service => {
                resolve({
                    error: false,
                    service: service
                });
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messagePos: 'Service User Not Find',
                    messageErr: err,
                    redirect: false,
                    redirectTo: ''
                });
            });

        });
    }

    function createOrder(secret_key, customerId, email, skuId) {
        return new Promise(function (resolve, reject) {
            const stripeNode = require("stripe")(secret_key);
            stripeNode.orders.create({
                currency: 'usd',
                customer: customerId,
                email: email,
                items: [
                    {
                        type: 'sku',
                        parent: skuId
                    }
                ]
            }, function (err, order) {
                if (err) {
                    resolve({
                        error: true,
                        typeError: 'backend',
                        message: 'Something went wrong. Please try again after some time!',
                        messagePos: 'Order Stripe Error',
                        messageErr: err,
                        redirect: false,
                        redirectTo: ''
                    });
                }
                resolve({
                    error: false,
                    order: order
                })
            });
        });
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                for (let i = 0; i < events.length; i++) {

                    let promiseService = getService(events[i].serviceId);
                    promiseService.then(function (proService) {
                        if (proService.error === true) {
                            resolve(proService);
                            break;
                        } else {
                            let promiseOrder = createOrder(stripe.secret_key, user.customerId, user.email, proService.service.skuId);
                            promiseOrder.then(function (proOrder) {
                                if (proOrder.error === true) {
                                    resolve(proOrder);
                                    break;
                                } else {
                                    let eventSave = new Event({
                                        event: events[i],
                                        userId: user.id,
                                        service: proService.service,
                                        canceledBy: '',
                                        message: '',
                                        orderId: proOrder.order.id,
                                        status: 'In Progress',
                                    });
                                    eventsSave.push(eventSave);
                                }
                            });

                        }
                    });
                }
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};


exports.createProdPlans = (product) => {

    function createProduct(secret_key, productPalan) {
        return new Promise(function (resolve, reject) {
            let status = false;
            if (productPalan.status === 'active') {
                status = true;
            }
            const stripeNode = require("stripe")(secret_key);
            stripeNode.products.create({
                name: productPalan.name,
                type: 'service',
                active: status,
                metadata: {
                    description: productPalan.description,
                    numAppNor: productPalan.numAppNor,
                    numAppShort: productPalan.numAppShort
                }
            }, function (err, product) {
                if (err) {
                    console.log(err, productPalan);
                    resolve({
                        error: true,
                        typeError: 'Client',
                        message: 'Sorry Plase verify stripe product there is problem',
                        messageErr: 'Stripe Err Create Product',
                        redirect: false,
                        redirectTo: ''
                    });
                }
                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    product: product,
                    redirect: false,
                    redirectTo: ''
                });
            });
        });

    }

    function createPlans(secret_key, product, productStripe) {
        return new Promise(function (resolve, reject) {

            let status = false;
            if (product.status === 'active') {
                status = true;
            }

            const stripeNode = require("stripe")(secret_key);
            stripeNode.plans.create({
                amount: product.price,
                interval: product.interval,
                currency: "usd",
                product: productStripe.id,
                active: status,
                nickname: product.name + ' USD'
            }, function (err, plan) {
                if (err) {
                    resolve({
                        error: true,
                        typeError: 'Client',
                        message: 'Sorry Plase verify stripe plans there is problem',
                        messageErr: 'Stripe Err Create Plans',
                        redirect: false,
                        redirectTo: ''
                    });
                }

                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    plan: plan,
                    product: productStripe,
                    redirect: false,
                    redirectTo: ''
                });
            });

        });

    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {

                let promiseCreateProduct = createProduct(stripe.secret_key, product);
                promiseCreateProduct.then(function (resProduct) {
                    if (resProduct.error === true) {
                        resolve(resProduct);
                    } else {
                        let productStripe = resProduct.product;
                        let promiseSavePlan = createPlans(stripe.secret_key, product, productStripe);
                        promiseSavePlan.then(function (resPlans) {
                            if (resPlans.error === true) {
                                resolve(resPlans);
                            } else {
                                resolve(resPlans);
                            }
                        });
                    }
                });


            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });

};

exports.createToken = (card) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.tokens.create({
                    card: card
                }, function (err, token) {
                    if (err) {

                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Token';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        token: token,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.createCustomer = (token, user) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.customers.create({
                    description: 'Customer for ' + user.email,
                    source: token.id,
                    email: user.email,
                    name: user.full_name
                }, function (err, customer) {

                    if (err) {
                        console.log(err);
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Customer';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        customer: customer,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.postCharge = (user, plan) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.charges.create({
                    amount: plan.price,
                    currency: "usd",
                    description: 'Charge for ' + user.email,
                    customer: user.customerId
                }, function (err, charge) {

                    if (err) {
                        console.log(err);
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Charge';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        charge: charge,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.subscriptions = (user, plan) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.subscriptions.create({
                    customer: user.customerId,
                    items: [
                        {
                            plan: plan.planId,
                        },
                    ],
                    collection_method: 'charge_automatically'


                }, function (err, subscription) {

                    if (err) {
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Subscription';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        subscription: subscription,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.checkSubscription = (subscription, typeService, user) => {


    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    function getStatusSubscription(idSubscription) {
        return new Promise(function (resolve, reject) {
            StripeKey.findOne().then(stripe => {
                if (stripe) {
                    const stripeNode = require("stripe")(stripe.secret_key);
                    stripeNode.subscriptions.retrieve(
                        idSubscription,
                        function (err, subscription) {
                            if (err) {
                                let data = getErrStripe(err);
                                data['messageErr'] = 'Stripe Get Subscription By Id';
                                resolve(data);
                            }
                            if (subscription.status === 'active') {
                                resolve({
                                    error: false,
                                    subscription: subscription,
                                });
                            } else {
                                resolve({
                                    error: true,
                                    subscription: subscription,
                                });
                            }

                        }
                    );
                } else {
                    resolve({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry but must insert stripe key before this',
                        messageErr: 'Stripe Keys  Not Exicte',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Stripe Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }


    function updateToindividual(user) {
        return new Promise(function (resolve, reject) {
            User.findByPk(user.id).then(userGet => {
                userGet.typePayment = 'individual';
                userGet.save();
                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    user: userGet,
                    redirect: false,
                    redirectTo: ''
                });

            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'Backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function updateSubscriptins(userId, subs) {
        return new Promise(function (resolve, reject) {
            User.findByPk(userId).then(userGet => {
                userGet.subscriptions = subs;
                userGet.statusCard = 'false';
                userGet.save();
                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    user: userGet,
                    redirect: false,
                    redirectTo: ''
                });

            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'Backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function deactiveSubscription(idSubscription) {
        return new Promise(function (resolve, reject) {
            StripeKey.findOne().then(stripe => {
                if (stripe) {
                    const stripeNode = require("stripe")(stripe.secret_key);
                    stripeNode.subscriptions.del(
                        idSubscription,
                        function (err, confirmation) {
                            if (err) {
                                let data = getErrStripe(err);
                                data['messageErr'] = 'Stripe Cancel Subscription By Id';
                                resolve(data);
                            }
                            if (confirmation.status === 'canceled') {
                                resolve({
                                    error: false,
                                    confirmation: 'canceled',
                                });
                            } else {
                                resolve({
                                    error: true,
                                    confirmation: confirmation,
                                });
                            }

                        }
                    );
                } else {
                    resolve({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry but must insert stripe key before this',
                        messageErr: 'Stripe Keys  Not Exicte',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Stripe Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    let currentDate = this.getCurrentDate();
    let today = new Date(currentDate);

    return new Promise(function (resolve, reject) {
        let startDate = new Date(subscription.start_date);
        let endDate = new Date(startDate.setDate(startDate.getDate() + 28));

        let promiseSubscription = getStatusSubscription(subscription.subscriptionId);
        promiseSubscription.then(function (resSubscription) {
            if (resSubscription.error === true) {

                let promiseDeatSubs = deactiveSubscription(subscription.subscriptionId);
                promiseDeatSubs.then(function (resDesSubs) {

                    if (resDesSubs.error === true) {
                        resolve(resDesSubs);
                    } else {
                        let subsUpdated = subscription;
                        subsUpdated.status = 'not active';
                        let promiseUpdateSub = updateSubscriptins(user.id, subsUpdated);
                        promiseUpdateSub.then(function (resUpdSubs) {
                            if (resUpdSubs.error === true) {
                                resolve(resUpdSubs);
                            } else {
                                resolve({
                                    error: true,
                                    typeError: 'client',
                                    message: "Not enough credit in your card",
                                    redirect: true,
                                    redirectTo: 'membership'
                                });
                            }
                        })
                    }

                });


            } else {

                let plan = subscription.plan;

                if (typeService === 'normal') {
                    if (plan.numAppNor === 'infinity') {
                        resolve({
                            error: false,
                            liberty: true,
                            infinity: true
                        });
                    } else {
                        let restAppNor = parseInt(plan.numAppNor) - parseInt(subscription.consAppNor);
                        if (restAppNor > 0) {
                            resolve({
                                error: false,
                                liberty: true,
                                infinity: false
                            });
                        } else {
                            resolve({
                                error: true,
                                typeError: 'client',
                                message: "Sorry in this month you can't reserve any appoinment type normal",
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    }
                } else {
                    if (plan.numAppShort === 'infinity') {
                        resolve({
                            error: false,
                            liberty: true,
                            infinity: true
                        });
                    } else {
                        let restAppShort = parseInt(plan.numAppShort) - parseInt(subscription.consAppShort);
                        if (restAppShort > 0) {
                            resolve({
                                error: false,
                                liberty: true,
                                infinity: false
                            });
                        } else {
                            resolve({
                                error: true,
                                typeError: 'client',
                                message: "Sorry in this month you can't reserve any appoinment type short session",
                                redirect: false,
                                redirectTo: ''
                            });
                        }
                    }
                }

            }
        });


    });


};


exports.postEventCharge = (customerId, email, service) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.charges.create({
                    amount: service.price,
                    currency: "usd",
                    description: 'Charge for ' + email,
                    customer: customerId
                }, function (err, charge) {

                    if (err) {
                        console.log(err);
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Charge Post Event';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        charge: charge,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.updateProdPlans = (plan) => {

    function updateProduct(secret_key, plan) {
        return new Promise(function (resolve, reject) {
            let status = false;
            if (plan.status === 'active') {
                status = true;
            }
            const stripeNode = require("stripe")(secret_key);
            stripeNode.products.update(
                plan.productId, {
                    name: plan.name,
                    active: status,
                    metadata: {
                        image: plan.image,
                        description: plan.description,
                        numAppNor: plan.numAppNor,
                        numAppShort: plan.numAppShort
                    }
                }, function (err, product) {
                    if (err) {
                        resolve({
                            error: true,
                            typeError: 'Client',
                            message: 'Sorry Plase verify stripe update product there is problem',
                            messageErr: 'Stripe Err Update Product',
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        product: product,
                        redirect: false,
                        redirectTo: ''
                    });
                });
        });

    }

    function deletePlan(secret_key, planOr) {
        return new Promise(function (resolve, reject) {

            const stripeNode = require("stripe")(secret_key);
            stripeNode.plans.del(
                planOr.planId,
                function (err, confirmation) {
                    if (err) {
                        resolve({
                            error: true,
                            typeError: 'Client',
                            message: 'Sorry Plase verify stripe delete plans there is problem',
                            messageErr: 'Stripe Err delete Plans',
                            redirect: false,
                            redirectTo: ''
                        });
                    }

                    if (confirmation.deleted === true) {
                        resolve({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            redirect: false,
                            redirectTo: ''
                        });
                    } else {
                        resolve({
                            error: true,
                            typeError: 'Client',
                            message: 'Sorry Plase verify stripe delete confirmation plans there is problem',
                            messageErr: 'Stripe Err delete confirmation Plans',
                            redirect: false,
                            redirectTo: ''
                        });
                    }

                });

        });

    }

    function createPlans(secret_key, planOr) {
        return new Promise(function (resolve, reject) {

            let status = false;
            if (planOr.status === 'active') {
                status = true;
            }

            const stripeNode = require("stripe")(secret_key);
            stripeNode.plans.create({
                amount: planOr.price,
                interval: planOr.interval,
                currency: "usd",
                product: planOr.productId,
                active: status,
                nickname: planOr.name + ' USD'
            }, function (err, plan) {
                if (err) {
                    console.log(err);
                    resolve({
                        error: true,
                        typeError: 'Client',
                        message: 'Sorry Plase verify stripe create plans there is problem',
                        messageErr: 'Stripe Err Create Plans',
                        redirect: false,
                        redirectTo: ''
                    });
                }

                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    plan: plan,
                    redirect: false,
                    redirectTo: ''
                });
            });

        });

    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {

                let promiseCreateProduct = updateProduct(stripe.secret_key, plan);
                promiseCreateProduct.then(function (resProduct) {
                    if (resProduct.error === true) {
                        resolve(resProduct);
                    } else {
                        let promiseDeletePlan = deletePlan(stripe.secret_key, plan);
                        promiseDeletePlan.then(function (resDeletePlan) {
                            if (resDeletePlan.error === true) {
                                resolve(resDeletePlan);
                            } else {
                                let promiseSavePlan = createPlans(stripe.secret_key, plan);
                                promiseSavePlan.then(function (resPlans) {
                                    if (resPlans.error === true) {
                                        resolve(resPlans);
                                    } else {
                                        resolve(resPlans);
                                    }
                                });
                            }
                        });


                    }
                });


            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });

};

exports.refundCharge = (chargeId) => {
    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.refunds.create({
                    charge: chargeId
                }, function (err, refund) {
                    if (err) {

                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Refund Charge';

                        console.log(err);
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        refund: refund,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};


exports.deactivePrPlan = (productId, planId) => {
    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    function deactivateProduct(secret_key, productId) {
        return new Promise(function (resolve, reject) {

            const stripeNode = require("stripe")(secret_key);

            stripeNode.products.update(
                productId,
                {active: false},
                function (err, product) {
                    if (err) {
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Deactivate Product';
                        resolve(data);
                    } else {
                        resolve({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            product: product,
                            redirect: false,
                            redirectTo: ''
                        });
                    }

                }
            );


        });
    }

    function deactivatePlans(secret_key, planId) {
        return new Promise(function (resolve, reject) {

            const stripeNode = require("stripe")(secret_key);

            stripeNode.plans.update(
                planId,
                {active: false},
                function (err, plan) {
                    if (err) {
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Deactivate Plan';
                        resolve(data);
                    } else {
                        resolve({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            plan: plan,
                            redirect: false,
                            redirectTo: ''
                        });
                    }
                }
            );


        });
    }


    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                let promiseDeaProd = deactivateProduct(stripe.secret_key, productId);
                promiseDeaProd.then(function (resDeaProd) {
                    if (resDeaProd.error === true) {
                        resolve(resDeaProd);
                    } else {
                        let promiseDeaPlan = deactivatePlans(stripe.secret_key, planId);
                        promiseDeaPlan.then(function (resDeaPlan) {
                            if (resDeaPlan.error === true) {
                                resolve(resDeaPlan);
                            } else {
                                resolve({
                                    error: false,
                                    typeError: '',
                                    message: 'Success Deactivate Plan',
                                    redirect: false,
                                    redirectTo: ''
                                });
                            }
                        });
                    }
                });


            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};


exports.checkSubscriptionUser = (user) => {


    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    function getStatusSubscription(idSubscription) {
        return new Promise(function (resolve, reject) {
            StripeKey.findOne().then(stripe => {
                if (stripe) {
                    const stripeNode = require("stripe")(stripe.secret_key);
                    stripeNode.subscriptions.retrieve(
                        idSubscription,
                        function (err, subscription) {
                            if (err) {
                                let data = getErrStripe(err);
                                data['messageErr'] = 'Stripe Get Subscription By Id';
                                resolve(data);
                            }
                            if (subscription.status === 'active') {
                                resolve({
                                    error: false,
                                    subscription: subscription,
                                });
                            } else {
                                resolve({
                                    error: true,
                                    subscription: subscription,
                                });
                            }

                        }
                    );
                } else {
                    resolve({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry but must insert stripe key before this',
                        messageErr: 'Stripe Keys  Not Exicte',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Stripe Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function updateToindividual(user) {
        return new Promise(function (resolve, reject) {
            User.findByPk(user.id).then(userGet => {
                userGet.typePayment = 'individual';
                userGet.save();
                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    user: userGet,
                    redirect: false,
                    redirectTo: ''
                });

            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'Backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function updateSubscriptins(userId, subs) {
        return new Promise(function (resolve, reject) {
            User.findByPk(userId).then(userGet => {
                userGet.subscriptions = subs;
                userGet.statusCard = 'false';
                userGet.save();
                resolve({
                    error: false,
                    typeError: '',
                    message: 'Success',
                    user: userGet,
                    redirect: false,
                    redirectTo: ''
                });

            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'Backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'User Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function deactiveSubscription(idSubscription) {
        return new Promise(function (resolve, reject) {
            StripeKey.findOne().then(stripe => {
                if (stripe) {
                    const stripeNode = require("stripe")(stripe.secret_key);
                    stripeNode.subscriptions.del(
                        idSubscription,
                        function (err, confirmation) {
                            if (err) {
                                let data = getErrStripe(err);
                                data['messageErr'] = 'Stripe Cancel Subscription By Id';
                                resolve(data);
                            }
                            if (confirmation.status === 'canceled') {
                                resolve({
                                    error: false,
                                    confirmation: 'canceled',
                                });
                            } else {
                                resolve({
                                    error: true,
                                    confirmation: confirmation,
                                });
                            }

                        }
                    );
                } else {
                    resolve({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry but must insert stripe key before this',
                        messageErr: 'Stripe Keys  Not Exicte',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Stripe Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    function differnceTowDate(today, startdate, interval) {
        let date2 = new Date(today);
        let date1 = new Date(startdate);
        date1 = new Date(date1.setDate(date1.getDate() + interval));
        let timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }


    let currentDate = this.getCurrentDate();
    let today = new Date(currentDate);

    return new Promise(function (resolve, reject) {

        if (user.typePayment === 'membership') {

            if (user.subscriptions.length > 0) {
                let subEncours = user.subscriptions[user.subscriptions.length - 1];
                let promiseSubscription = getStatusSubscription(subEncours.subscriptionId);
                promiseSubscription.then(function (resSubscription) {
                    if (resSubscription.error === true) {
                        let subs = user.subscriptions;
                        subs[subs.length - 1].status = 'not active';
                        let promiseDeaSubs = updateSubscriptins(user.id, subs);
                        promiseDeaSubs.then(function (resDesSubs) {
                            if (resDesSubs.error === true) {
                                resolve(resDesSubs);
                            } else {

                                let promiseDeactiveSubscription = deactiveSubscription(subEncours.subscriptionId);
                                promiseDeactiveSubscription.then(function (resPds) {
                                    if (resPds.error === true) {
                                        resolve(resPds);
                                    } else {
                                        resolve({
                                            error: false,
                                            plan: {
                                                packageDuration: 0,
                                                package: subEncours.plan,
                                                numAppNor: 0,
                                                numAppShort: 0,
                                            }
                                        });
                                    }
                                });

                            }
                        });


                    } else {

                        let planReserve = subEncours.plan;
                        let restAppNor = 0;
                        let restAppShort = 0;
                        if (planReserve.numAppNor === 'infinity') {
                            restAppNor = 'infinity';
                        } else {
                            restAppNor = planReserve.numAppNor - subEncours.consAppNor;
                        }
                        if (planReserve.numAppShort === 'infinity') {
                            restAppShort = 'infinity';
                        } else {
                            restAppShort = planReserve.numAppShort - subEncours.consAppShort;
                        }

                        let duration = 0;
                        if (planReserve.interval === 'month') {
                            duration = differnceTowDate(subEncours.start_date, today, 30);
                        } else if (planReserve.interval === 'day') {
                            duration = differnceTowDate(subEncours.start_date, today, 1);
                        } else if (planReserve.interval === 'week') {
                            duration = differnceTowDate(subEncours.start_date, today, 7);
                        } else {
                            duration = differnceTowDate(subEncours.start_date, today, 356);
                        }


                        resolve({
                            error: false,
                            typePay: 'membership',
                            plan: {
                                packageDuration: duration,
                                package: planReserve,
                                numAppNor: restAppNor,
                                numAppShort: restAppShort,
                            }
                        });


                    }
                });
            } else {

                let promiseUpdateUser = updateToindividual(user);
                promiseUpdateUser.then(function (resTPUser) {
                    if (resTPUser.error === true) {
                        resolve(resTPUser);
                    } else {
                        resolve({
                            error: false,
                            typePay: 'individual',
                            user: resTPUser.user
                        });
                    }
                });
            }

        } else {
            resolve({
                error: false,
                typePay: 'individual',
                user: user
            });
        }


    });


};

exports.deactiveSubscription = (subscriptionId) => {
    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    function deactiveSubscription(idSubscription) {
        return new Promise(function (resolve, reject) {
            StripeKey.findOne().then(stripe => {
                if (stripe) {
                    const stripeNode = require("stripe")(stripe.secret_key);
                    stripeNode.subscriptions.del(
                        idSubscription,
                        function (err, confirmation) {
                            if (err) {
                                let data = getErrStripe(err);
                                data['messageErr'] = 'Stripe Cancel Subscription By Id';
                                resolve(data);
                            }
                            if (confirmation.status === 'canceled') {
                                resolve({
                                    error: false,
                                    confirmation: 'canceled',
                                });
                            } else {
                                resolve({
                                    error: true,
                                    confirmation: confirmation,
                                });
                            }

                        }
                    );
                } else {
                    resolve({
                        error: true,
                        typeError: 'tech',
                        message: 'Sorry but must insert stripe key before this',
                        messageErr: 'Stripe Keys  Not Exicte',
                        redirect: false,
                        redirectTo: ''
                    });
                }
            }).catch(err => {
                resolve({
                    error: true,
                    typeError: 'backend',
                    message: 'Something went wrong. Please try again after some time!',
                    messageErr: 'Stripe Not Find',
                    redirect: false,
                    redirectTo: ''
                });
            });
        });
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {

                let promiseDectiveSubs = deactiveSubscription(subscriptionId);
                promiseDectiveSubs.then(function (resDeacSubs) {
                    resolve(resDeacSubs);
                });

            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.createCustomer = (token, user) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);

                stripeNode.customers.create({
                    description: 'Customer for ' + user.email,
                    source: token.id,
                    email: user.email,
                    name: user.full_name
                }, function (err, customer) {

                    if (err) {
                        console.log(err);
                        let data = getErrStripe(err);
                        data['messageErr'] = 'Stripe Err Create Customer';
                        resolve(data);
                    }
                    resolve({
                        error: false,
                        typeError: '',
                        message: 'Success',
                        customer: customer,
                        redirect: false,
                        redirectTo: ''
                    });
                });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
};

exports.updateCustomerToken = (token, customerId) => {

    function getErrStripe(err) {
        if (err.statusCode === 400) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request was unacceptable, often due to missing a required parameter.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 401) {
            return {
                error: true,
                typeError: 'client',
                message: 'No valid API key provided.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 402) {
            return {
                error: true,
                typeError: 'client',
                message: 'The parameters were valid but the request failed.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 404) {
            return {
                error: true,
                typeError: 'client',
                message: 'The requested resource doesn\'t exist.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 409) {
            return {
                error: true,
                typeError: 'client',
                message: 'The request conflicts with another request (perhaps due to using the same idempotent key).',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 429) {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.statusCode === 500 || err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504) {
            return {
                error: true,
                typeError: 'client',
                message: 'Something went wrong on Stripe\'s end. (These are rare.)',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_connection_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to connect to Stripe\'s API.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'api_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'API errors cover any other type of problem (e.g., a temporary problem with Stripe\'s servers), and are extremely uncommon.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'authentication_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Failure to properly authenticate yourself in the request.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'card_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Card errors are the most common type of error you should expect to handle. They result when the user enters a card that can\'t be charged for some reason.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'idempotency_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Idempotency errors occur when an Idempotency-Key is re-used on a request that does not match the first request\'s API endpoint and parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'invalid_request_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Invalid request errors arise when your request has invalid parameters.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'rate_limit_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Too many requests hit the API too quickly.',
                redirect: false,
                redirectTo: ''
            };
        } else if (err.type === 'validation_error') {
            return {
                error: true,
                typeError: 'client',
                message: 'Errors triggered by our client-side libraries when failing to validate fields (e.g., when a card number or expiration date is invalid or incomplete).',
                redirect: false,
                redirectTo: ''
            };
        } else {
            return {
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: err,
                redirect: false,
                redirectTo: ''
            };
        }
    }

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);
                stripeNode.customers.update(
                    customerId,
                    {

                        source: token.id,

                    }, function (err, customer) {
                        if (err) {
                            let data = getErrStripe(err);
                            data['messageErr'] = 'Stripe Err Update Card Customer';
                            resolve(data);
                        }
                        resolve({
                            error: false,
                            typeError: '',
                            message: 'Success',
                            customer: customer,
                            redirect: false,
                            redirectTo: ''
                        });
                    });
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });
}

exports.sendMailEvent = (user, startDate, endDate) => {

    MailS.findOne().then(mail => {
        if (mail) {
            Admin.findOne().then(admin => {

                const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
                const dataMail = {
                    from: admin.email,
                    to: admin.email,
                    subject: 'Post Event',
                    body: 'Post Event',
                    html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\">Hello Mr " + admin.full_name + "</td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">Client " + user.full_name + " reserve a appointment in " + startDate + " to " + endDate + "</td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
                };

                mailgun.messages().send(dataMail, function (error, body) {
                    return 'Success';
                });


            }).catch(err => {
                console.log(err, 'admin');
            });
        }

    }).catch(err => console.log(err, 'mail'));


};

exports.updateTokenMail = (userId, created_at_token_mail, tokenEmail) => {

    User.findByPk(userId).then(user => {
        user.tokenEmail = tokenEmail;
        user.created_at_token_mail = created_at_token_mail;
        user.save();
    }).catch(err => {
        console.log(err);
    })


};

exports.updateEmailUser = (userId) => {
    let currentDate = this.getCurrentDate();

    User.findByPk(userId).then(user => {
        user.tokenEmail = 'done';
        user.status = 'typePayment';
        user.created_at_token_mail = this.getCurrentDate();
        user.save();
    }).catch(err => {
        console.log(err);
    });
};

exports.filterPlan = (plans) => {
    let planActive = [];
    let planDEactive = [];
    return new Promise(function (resolve, reject) {

        for (let i = 0; i < plans.length; i++) {
            plans[i].price = plans[i].price / 100;
            if (plans[i].status === 'active') {
                planActive.push(plans[i]);
            } else {
                planDEactive.push(plans[i]);
            }
            if ((planActive.length + planDEactive.length) === plans.length) {
                resolve({
                    error: false,
                    planActive: planActive,
                    planDEactive: planDEactive
                })
            }
        }


    });
};

exports.sendMailEventCBUser = (user, startDate, endDate) => {

    MailS.findOne().then(mail => {
        if (mail) {
            Admin.findOne({}).then(admin => {

                const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
                const dataMail = {
                    from: admin.email,
                    to: admin.email,
                    subject: 'Refuse Event',
                    body: 'Refuse Event',
                    html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\">Hello Mr " + admin.full_name + "</td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\">Client " + user.full_name + " cancled a appointment in " + startDate + " to " + endDate + "</td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
                };

                mailgun.messages().send(dataMail, function (error, body) {
                    return 'Success';
                });


            }).catch(err => {
                console.log(err, 'admin');
            });
        }

    }).catch(err => console.log(err, 'mail'));


};

exports.sendMailEventAcceptEvent = (user, startDate, endDate) => {

    MailS.findOne().then(mail => {
        if (mail) {
            Admin.findOne().then(admin => {

                const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
                const dataMail = {
                    from: admin.email,
                    to: user.email,
                    subject: 'Accept Event',
                    body: 'Accept Event',
                    html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\">Hello " + user.full_name + " you are accepted the appoinment which begin in " + startDate + " to " + endDate + " </td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\"></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
                };

                mailgun.messages().send(dataMail, function (error, body) {
                    return 'Success';
                });


            }).catch(err => {
                console.log(err, 'admin');
            });
        }

    }).catch(err => console.log(err, 'mail'));


};

exports.sendMailEventRefuseEvent = (user, startDate, endDate) => {

    MailS.findOne().then(mail => {
        if (mail) {
            Admin.findOne().then(admin => {

                const mailgun = require('mailgun-js')({apiKey: mail.apiKey, domain: mail.domain});
                const dataMail = {
                    from: admin.email,
                    to: user.email,
                    subject: 'Accept Event',
                    body: 'Accept Event',
                    html: "<table class=\"email-wrapper\" style=\" background: #f0f0f0;width: 100%;padding: 50px;\"><tr><td><table><tr><td class=\"logo\" style=\" text-align: center;padding-bottom: 50px;\"><img src=\"https://ci4.googleusercontent.com/proxy/VHTddfl5sPpUt7N3dbKKpUY-u_ct9P-AhDn2B3rrSEfGSFaiMxb8mlb4PALFmtU0Lro86j7y5_7AxSjmgZ7eThQAx9ZpoF8t9NmogU9hvTBv1m_G_WS3oFHurhRQJhKnEhw=s0-d-e1-ft#https://cdn0.iconfinder.com/data/icons/citycons/150/Citycons_magnify-128.png\" alt=\"FTMLOGO\"></td></tr><tr><td class=\"fullName\" style=\"padding-bottom: 20px;display: block;\">Hello " + user.full_name + " you are cancled  the appoinment which begin in " + startDate + " to " + endDate + " </td></tr><tr><td class=\"content\" style=\"padding-bottom: 50px;\"></td></tr><tr><td class=\"thank\" style=\"  padding-top: 50px;\">Thanks,</td></tr><tr><td>FictionToMission Team</td></tr></table><td></tr></table>\n"
                };

                mailgun.messages().send(dataMail, function (error, body) {
                    return 'Success';
                });


            }).catch(err => {
                console.log(err, 'admin');
            });
        }

    }).catch(err => console.log(err, 'mail'));


};


exports.deactiveSubscription = (idSubscription) => {

    return new Promise(function (resolve, reject) {
        StripeKey.findOne().then(stripe => {
            if (stripe) {
                const stripeNode = require("stripe")(stripe.secret_key);
                stripeNode.subscriptions.del(
                    idSubscription,
                    function (err, confirmation) {
                        if (err) {
                            let data = getErrStripe(err);
                            data['messageErr'] = 'Stripe Cancel Subscription By Id';
                            resolve(data);
                        }
                        if (confirmation.status === 'canceled') {
                            resolve({
                                error: false,
                                confirmation: 'canceled',
                            });
                        } else {
                            resolve({
                                error: true,
                                confirmation: confirmation,
                            });
                        }

                    }
                );
            } else {
                resolve({
                    error: true,
                    typeError: 'tech',
                    message: 'Sorry but must insert stripe key before this',
                    messageErr: 'Stripe Keys  Not Exicte',
                    redirect: false,
                    redirectTo: ''
                });
            }
        }).catch(err => {
            resolve({
                error: true,
                typeError: 'backend',
                message: 'Something went wrong. Please try again after some time!',
                messageErr: 'Stripe Not Find',
                redirect: false,
                redirectTo: ''
            });
        });
    });

};
