const express = require('express');
const adminController = require('../controllers/admin');
const userController = require('../controllers/user');
const generalController = require('../controllers/general');




const router = express.Router();

router.get('/getOrganization', generalController.getOrganization);

router.get('/getTimeWork', generalController.getTimeWork);

router.post('/forgetPasswordUser', generalController.forgetUser);

router.post('/confirmPasswordUser', generalController.confirmTokenPassUser);

router.post('/forgetAdmin', generalController.forgetAdmin);

router.post('/confirmPasswordAdmin', generalController.confirmTokenPassAdmin);

router.get('/getStripePublicKey',generalController.getStripePublicKey);

router.get('/getAllPackages',generalController.getAllPackages);


module.exports = router;
