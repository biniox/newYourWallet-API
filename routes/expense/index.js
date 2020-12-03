const { query } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const { userModel, expenseModel } = require('./../../models/model');

const router = express.Router();
const { verifyToken } = require("./../users");

const sendProblemWithExpenses = (req, res, {errors}) => {
  if(errors) {

    const { name, cost, date, noData, noId } = errors;
    if(name)
      res.status(400).json({err: "name is required", code: "name"})

    else if(errors.cost) {
      if(errors.cost.reason)
        if(errors.cost.reason.code == 'ERR_ASSERTION')
          return res.status(400).json({err: "cost must be a number", code: "cost"})
      res.status(400).json({err: "cost is required", code: "cost"})
    }

    else if(errors.date)
      res.status(400).json({err: "date must be a date type", code: "date"})

    else if(errors.noData)
      res.status(400).json({err: "no valid data in body", code: "noData"})

    else if(errors.noId)
      res.status(400).json({err: "Expense not found", code: "noId"})

    else
      res.status(400).json({err: "Problem with Expenses", code: "problem"});

  }

}


const createExpense = async (req, res, next) => {
  try{
    const { body, id } = req;
    const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('expense');


    const expense = new expenseModel(body);
    await expense.validate();
    user.expense.push(expense);
    await user.updateOne({ expense : user.expense });

    res.json(expense);
  } catch(err) {
    sendProblemWithExpenses(req, res, err);
  }
}

const editExpense = async (req, res, next) => {
  try{
    const { params, body : { name, date, cost, categoryId}, id } = req;

    if(!name && !date && !cost && !categoryId)
      throw { errors: { noData: "no data" }};
      
    if(cost)
      if(typeof cost != 'number')
        throw { errors : { cost : { reason: { code : 'ERR_ASSERTION' } } } }
    if(date)
      if( (new Date(date)) == 'Invalid Date')
        throw { errors : { date: "date" } };

    const expenseId = params.id;
    let toReturn = false;

    const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('expense');


    user.expense.map(prev => {
      if(prev._id == expenseId) {
        if(name) prev.name = name;
        if(cost) prev.cost = cost;
        if(categoryId) prev.categoryId = categoryId;
        if(date) prev.date = date;
        toReturn = prev;
      }
      return prev;
    });

    if(!toReturn) throw { errors: { noId: "no id" }};

    const resp = await user.updateOne({ expense: user.expense });


    res.json(toReturn);
  } catch(err) {
    sendProblemWithExpenses(req, res, err);
  }
}

const getExpense = async (req, res, next) => {
  try {
    const { id, params, query } = req;
    const user = await userModel.findById(mongoose.Types.ObjectId(id)).select('expense');

    if(query.from || query.to) {
      const from = new Date(query.from || '01.01.1000');
      const to = new Date(query.to || '01.01.9999');

      if(to == "Invalid Date" || from == "Invalid Date")
        throw { errors : { date: "date" } };

      user.expense = user.expense.filter(item => (item.date > from && item.date < to));
    }

    if(params.id) {
      const filteredExpense = user.expense.filter(item => (item._id == params.id));
      return res.json(filteredExpense);
    }

    res.json(user.expense);
  } catch(err) {
    sendProblemWithExpenses(req, res, err);
  }
}

const deleteExpense = async (req, res, next) => {
  try{
    const { id } = req.params;

    const user = await userModel.findById(mongoose.Types.ObjectId(req.id)).select('expense');
    const expenseSize = user.expense.length;

    user.expense =  user.expense.filter(item => !(item._id == id));
    
    if(expenseSize === user.expense.length)
      throw { errors: { noId: "noId" } }
    await user.save();
    res.json({success: `expense: ${id} was Removed`})
  } catch(err) {
    sendProblemWithExpenses(req, res, err);
  }

}


router.put('/', verifyToken,  createExpense);
router.post('/:id', verifyToken,  editExpense);
router.get('/:id', verifyToken,  getExpense);
router.get('/', verifyToken,  getExpense);

router.delete('/:id', verifyToken,  deleteExpense);
router.delete('/', verifyToken,  deleteExpense);

module.exports = router;
