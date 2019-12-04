const express = require('express');
const userController = require('../controllers/user');
const router=express.Router();

router.post('/user/register',userController.saveUser);




module.exports=router;
