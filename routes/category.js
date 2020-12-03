const express = require('express');
const mongoose = require('mongoose');

const { categoryModel, userModel } = require("./../models/model");
const { verifyToken } = require('./users');

const router = express.Router();

const sendProblemWithCategory = (req,res,err) => {

  if(err.errors == 'name')
    res.status(400).json({err: "category name is required", code: "categoryName"});

  else if(err.errors == "noData")
    res.status(400).json({err: "no data to update in body", code: "noData"});

  else if(err.errors == "noRecord")
    res.status(400).json({err: "Object Id of category not found", code: "noRecord"});
  
  else
    res.status(400).json({err: "Problem with category"})
}


const getCategory = async (req, res, err) => {
    const { category } = await userModel.findOne({_id: mongoose.Types.ObjectId(req.id)},).select("category");
    res.json(category);
}

const createCategory = async (req, res, next) => {
  try {
    const { category, _id } = await userModel.findOne({_id: mongoose.Types.ObjectId(req.id)},).select("category");

    const toAdd = new categoryModel({name: req.body.name});
    await toAdd.validate();
    category.push(toAdd);
    
    await userModel.findByIdAndUpdate(_id, { category } );
    
    res.json(toAdd);

  } catch(err) {
    sendProblemWithCategory(req, res, {errors : err.errors.name.path });
  }
}

const updateCategory = async (req, res, next) => {
    try {
      if(!req.body.name) throw {errors: "noData"};
       const user = await (await userModel.findById(mongoose.Types.ObjectId(req.id)).select('category'));
       
       let index = -1;

      user.category.map((item, id) => {
        if(item._id == req.params.id) {
          item.name = req.body.name;
          index = id;
        }
        return item;
      });

      const result = await user.save();

      if(index != -1)
        res.json(user.category[index]);
      else throw { errors: "noRecord" };

    } catch(err) {
      sendProblemWithCategory(req, res, err);
    }
    
}
const deleteCategory = async (req, res, next) => {
    try {
       const user = await (await userModel.findById(mongoose.Types.ObjectId(req.id)).select('category'));
       
       let index = -1;
       let msg;

       user.category = user.category.filter((item, id) => {
        const result = (item._id == req.params.id);

        if(result) {
          index = id;
          msg = `${user.category[index]._id} was Removed`;
        }
        return !result;
      });


      const result = await user.save();

      if(index != -1) {
        res.json({ success: msg });
      }
      else throw { errors: "noRecord" };
    } catch(err) {
      sendProblemWithCategory(req, res, err);
    }
    
}



/* put a new category */
router.put('/', verifyToken, createCategory);
router.post('/', verifyToken, getCategory);
router.post('/:id', verifyToken, updateCategory);
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;
