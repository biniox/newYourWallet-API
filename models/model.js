const mongoose  = require('mongoose');
const bcrypt = require("bcrypt");

const { SALT_ROUND }  = require('./../config');


const emailValidator = val => (val.includes("@") && val.includes("."));

const hashPassword = (pass) => bcrypt.hashSync(pass, SALT_ROUND);

const compareHashPassword = (pass1, pass2) => bcrypt.compareSync(pass1,pass2);

const categoryShema = new mongoose.Schema({
    name: { type: String, required: true},  
});

const purposeShema = new mongoose.Schema({
    name: { type: String, required: true },
    cost: {type: Number, required: true},
    moneySave: {type: Number, required: true, default: 0}
});

const expenseShema = new mongoose.Schema({
    name: {type: String, required: true},
    categoryId: {type: String, required: false, default: null},
    cost: {type: Number, required: true},
    date: {type: Date, default: Date.now()},

});

const userModel = new mongoose.Schema({
    name: {type: String, default: null },
    surname: {type: String, default: null },
    imgPath: {type: String, default: null },
    email: {type: String, required: true, validate: {validator: emailValidator, message: "Ojojoj"}, index: {unique: true, dropDups: true} },
    password: {type: String, required: true, select: false}, 
    budget: {type: Number, default: null},
    category: [categoryShema],
    purpose: [purposeShema],
    expense: [expenseShema],
    registered: {type: Date, default: new Date()}
});

userModel.pre('save', function(next) {
    if(this.password)
        this.password = hashPassword(this.password);
    next();
});

module.exports = {
    userModel: mongoose.model('Users', userModel),
    categoryModel: mongoose.model('Category', categoryShema),
    purposeModel: mongoose.model('Purpose', purposeShema),
    expenseModel: mongoose.model('Expense', expenseShema),

    compareHashPassword
    
}

