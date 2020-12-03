const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

const { TOKEN_SECRET_JWT } = require('./../config');
const {userModel, compareHashPassword} = require('./../models/model');




const sendProblemWithUserData = (res, err) => {

  if(err.code == 11000 && err.keyPattern.email === 1) 
    res.status(400).json({err: "Email Address is used", code: 'email'}); 
  
  else if(err.errors.password)
    res.status(400).json({err: "Password is required", code: 'password'});

  else if(err.errors.email && err.errors.email.kind == 'user defined')
    res.status(400).json({err: "Invalid email format", code: 'emailFormat'}); 

  else if(err.errors.email)
    res.status(400).json({err: "Email is required", code: 'email'}); 

  else if(err.errors == "ObjectId")
    res.status(400).json({err: "ObjectId is invalid", code: "ObjectId"})

  else if(err.errors == "credential")
    res.status(400).json({err: "wrong email or password", code: "credential"});

  else if(err.errors == "token")
    res.status(400).json({err: "Invalid access TOKEN or expired", code: "token"})

  else if(err.errors == "tokenNoRefresh")
    res.status(400).json({err: 'To tefresh your token, use REFRESH TOKEN, not ACCESS TOKEN', code: "tokenNoRefresh"})

  else
    res.status(400).json({err: "Problem with Database"});
}


 const generateTokens = (user) => {
   const ACCESS_TOKEN = jwt.sign({ id: user._id, type: "ACCESS" }, TOKEN_SECRET_JWT,{ expiresIn: 12000 });

   const REFRESH_TOKEN = jwt.sign({ id: user._id, type: "REFRESH"}, TOKEN_SECRET_JWT,{ expiresIn: 480 });

  return {ACCESS_TOKEN, REFRESH_TOKEN};

 }
 
 const verifyToken = (req,res,next) => {


  try {
    const TOKEN = req.headers.authorization.split(" ");
    if(TOKEN[0] == 'Bearer') {
      const tokenData = jwt.verify(TOKEN[1], TOKEN_SECRET_JWT);

      if(tokenData.type === 'REFRESH') 
        return res.json(generateTokens({ _id: tokenData.id }));

      req.id = tokenData.id;
      next();
    } else {
      throw new Error();
    }

  } catch(err) {
    sendProblemWithUserData(res, {errors: "token"});
  }

 }

const createNewUser = async (req, res, next) => {
  try {
      const user = new userModel(req.body);
      await user.validate();
      await user.save();
      await res.json({ _id: user._id })
  } catch(err) {
      sendProblemWithUserData(res,err)
  }


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

const authUser = async (req, res, next) => {
  const {email, password} = req.body;

  const user = await userModel.findOne({email}).select('password');

  if(user && compareHashPassword(password, user.password)) 
        return res.json(generateTokens(user));

  sendProblemWithUserData(res, {errors: "credential"});

}


/* PUT new USER. */
router.put('/', createNewUser);

/* POST (login) */
router.post('/authUser', authUser);

/* GET USER INFO. */
router.get('/:id', getUser);


/* refresh ACCESS TOKEN */
router.post('/refreshToken', verifyToken, (req,res) => sendProblemWithUserData(res, {errors: 'tokenNoRefresh'}));

module.exports = {
  usersRouter: router,
  generateTokens,
  verifyToken,
  createNewUser,
  getUser,
  authUser,
  sendProblemWithUserData

};
