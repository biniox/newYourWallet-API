const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {userModel} = require('./../models/model');




const sendProblemWithUserData = (res, err) => {

  if(err.code == 11000 && err.keyPattern.email === 1) 
    res.status(400).json({err: "Email Address is used", code: 'email'}); 

  else if(err.errors.pass)
    res.status(400).json({err: "Password is required", code: 'password'});

  else if(err.errors.email && err.errors.email.kind == 'user defined')
    res.status(400).json({err: "Invalid email format", code: 'emailFormat'}); 

  else if(err.errors.email)
    res.status(400).json({err: "Email is required", code: 'email'}); 

  else if(err.errors == "ObjectId")
    res.status(400).json({err: "ObjectId is invalid", code: "ObjectId"})

  else
    res.status(400).json({err: "Problem with Database"});
}
/* Spróbuj potem sobie zwracac throw new Error,
 przy łączeniu z Reactem się potestuje */


const createNewUser = (req, res, next) => {
  const newUser = new userModel(req.body);

  newUser.validate()
    .then(() => newUser.save())
    .then(() => res.status(200).json(newUser._id))
    .catch(err => sendProblemWithUserData(res,err));

}

const getUser = (req, res, next) => {


  if(mongoose.isValidObjectId(req.params.id)) {
    const id = mongoose.Types.ObjectId(req.params.id);
    
    userModel.findById(mongoose.Types.ObjectId(id), 'name surname imgPath email budget')
    .then(user => res.status(200).json(user))
    .catch(err => sendProblemWithUserData(res,err));

  } else {
    sendProblemWithUserData(res, {errors: "ObjectId"});
  }
}

const authUser = (req, res, next) => {
  const {email, password} = req.body;
  userModel.find({email, password})
    .then(data => {
      if(data) {
        //make a token and send
      } else {
        console.log("wyjebało się");
      }
    })
}


/* PUT new USER. */
router.put('/', createNewUser);

/* GET authorization Token (login) */
router.get('/authUser', authUser);

/* GET USER INFO. */
router.get('/:id', getUser);

module.exports = {
  usersRouter: router,
  createNewUser,

};
