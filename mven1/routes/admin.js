const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();

router.get('/getAdmin', adminController.getAdmin);

router.post('/configStripe', adminController.saveApiStripe);

router.get('/testStripe', adminController.testApiStripe);

router.get('/getAllUsers', adminController.getAllUsers);

router.post('/setOrganization',adminController.setOrganization);

router.post('/saveService',adminController.saveService);

router.post('/updateService',adminController.updateService);

router.post('/deleteService',adminController.deleteService);

router.post('/activeService',adminController.activeService);

router.post('/setTimeWork',adminController.setTimeWork);

router.post('/updateAdmin',adminController.updateAdmin);

router.get('/getAllService',adminController.getAllService);

router.get('/getAllEvents', adminController.getAllEvents);

router.post('/cancledByAdmin',adminController.cancledByAdmin);

router.get('/getEventsProgress', adminController.getEventsProgress);

router.post('/acceptEvent',adminController.acceptEvent);

router.post('/refuseEvent',adminController.refuseEvent);

router.post('/deactivateUser',adminController.deactivateUser);

router.post('/activeUser',adminController.activeUser);

router.post('/createPackage',adminController.createProduct);

router.post('/deactivatePackage',adminController.deactivatePackage);

router.get('/getAllAPackages',adminController.getAllAPackages);

router.post('/setupMail',adminController.setupMail);

router.post('/postArticle',adminController.postArticle);

router.post('/deactivateArticle',adminController.deactivateArticle);

router.post('/activateArticle',adminController.activateArticle);



module.exports = router;
