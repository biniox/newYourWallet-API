const express = require('express');
const mongoose = require('mongoose');
const { userModel, purposeModel } = require('../../models/model');
const { verifyToken } = require('../users');
const router = express.Router();

const sendProblemWithPurpose = (req, res, {errors}) => {
  if(errors) {

    const { name, cost, noId, realized, moneySave, noData } = errors;
    if(name)
      res.status(400).json({err: "name is required", code: "name"})

    else if(cost) {
      if(cost.reason)
        if(cost.reason.code == 'ERR_ASSERTION')
          return res.status(400).json({err: "cost must be a number", code: "cost"})
      res.status(400).json({err: "cost is required", code: "cost"})
    }
    
    else if(moneySave) 
      res.status(400).json({err: "moneySave must be a number", code: "moneySave"})

    else if(realized) 
      res.status(400).json({err: "realized must be a boolean", code: "realized"})

    else if(noId)
      res.status(400).json({err: "Purpose not found", code: "noId"})

    else if(noData)
      res.status(400).json({err: "no valid data in body", code: "noData"})

    else
      res.status(400).json({err: "Problem with Purpose", code: "problem"});

  }
}

const createPurpose = async (req, res, next) => {
  try{
      const { body, id } = req;

      const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('purpose');
    
      const toAdd = new purposeModel(body);
      await toAdd.validate();
      user.purpose.push(toAdd);
      await user.save();
    
      res.json(toAdd);
  } catch (err) {
      sendProblemWithPurpose(req, res, err);
  }

}

const editPurpose = async (req, res, next) => {
  try{
      const { params, body, body: { name, moneySave, cost, realized }, id } = req;
      let foundPurpose = null;

      if(!name && !moneySave && !cost && !realized)
        throw { errors : { noData: "noData"}};

      const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('purpose');

      user.purpose = await user.purpose.map((prev) => {

        if(prev._id == params.id) {
          foundPurpose = new purposeModel({
            _id: mongoose.Types.ObjectId(params.id),
            name: (name) ? name : prev.name,
            cost: (cost) ? cost : prev.cost,
            realized: (realized) ? realized : prev.realized,
            moneySave: (moneySave) ? moneySave : prev.moneySave
          });

          return foundPurpose;
        }

        return prev;
      });

      if(foundPurpose)
        await foundPurpose.validate();
      else
        throw { errors: { noId: "noId"}}

      await user.save();
    
      res.json(foundPurpose);
  } catch (err) {
      sendProblemWithPurpose(req, res, err);
  }

}

const getPurpose = async (req, res, next) => {
  try{
      const { query, params, body, body: { name, moneySave, cost, realized }, id } = req;
      let toReturn;

      const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('purpose');

      if(params.id) {
        let found = false;

        user.purpose = await user.purpose.filter((item) => {
          if(item._id == params.id) {
            found = true;
            return true;
          }
        });

        if(!found)
          throw { errors : {noId: "noId"}}

      }

      if(query.realized == 'true')
        user.purpose = user.purpose.filter(item => (item.realized));
      else if(query.realized == 'false')
        user.purpose = user.purpose.filter(item => !(item.realized));
  
      res.json(user.purpose);

  } catch (err) {
      sendProblemWithPurpose(req, res, err);
  }

}

const deletePurpose = async (req, res, next) => {
  try{
      const { query, params, body, id } = req;
      let toReturn = [];

      const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('purpose');

        let found = false;

        if(params.id) {
          user.purpose = await user.purpose.filter((item) => {
            if(item._id == params.id) {
              found = true;
              return false;
            } else {
              return true
            }
          });
        }


        if(!found && !query.realized)
          throw { errors : {noId: "noId"}}



      if(query.realized == 'true')
        user.purpose = user.purpose.filter(item => {

          if(!item.realized) {
            return true; 
          } 
          toReturn.push(item);
          return false;
          
        });
      // else if(query.realized == 'false')
      //   user.purpose = user.purpose.filter(item => (item.realized));

      await user.save();
      if(params.id)
        res.json({success: `purpose: ${params.id} was Removed` });
      else res.json({success: `All realized purpose was Removed`, removed: toReturn });

  } catch (err) {
      sendProblemWithPurpose(req, res, err);
  }

}
/* GET users listing. */
router.put('/',verifyToken, createPurpose);

router.post('/',verifyToken, editPurpose);
router.post('/:id',verifyToken, editPurpose);

router.get('/:id',verifyToken, getPurpose);
router.get('/',verifyToken, getPurpose);

router.delete('/:id',verifyToken, deletePurpose);
router.delete('/',verifyToken, deletePurpose);

module.exports = router;
