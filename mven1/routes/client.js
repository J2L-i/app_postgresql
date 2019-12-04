const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
router.get('/getUser', userController.getClient);

router.post('/confirmAccount', userController.confirmAccount);

router.get('/refreshTokenMail', userController.refreshTokenMail);

router.post('/survey', userController.saveSurvey);

router.post('/uploadFile',userController.uploadFile);

router.post('/updateUser',userController.updateUser);

router.post('/postEvent',userController.postEventV3);

router.post('/postContent',userController.postContent);

router.get('/getAllService',userController.getAllService);

router.get('/getAllEventUser',userController.getAllEventUser);

router.get('/getContentUser',userController.getContentUser);

router.post('/cancledByUser',userController.cancledByUser);

router.post('/insertCard',userController.insertCard);

router.post('/confirmPayment',userController.confirmPayment);

router.post('/createSubscription',userController.createSubscription);

router.post('/cancelSubscription',userController.cancledSubscription);



router.post('/addToCart',userController.addToCart);

router.get('/getCart',userController.getCart);

router.get('/getAllArticle',userController.getAllArticle);


router.get('/getAllPackages',userController.getAllPackages);

router.get('/logout', function(req, res){
    req.logout();
    return res.json({
        error: false,
        typeError: '',
        message: 'Succeess Logout',
        redirect: false,
        redirectTo: ''
    });


});

module.exports = router;





