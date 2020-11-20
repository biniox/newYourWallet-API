const mongoose  = require('mongoose');
let {Shema} = mongoose;

const emailValidator = val => (val.includes("@") && val.includes("."));

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
    categoryId: {type: String, required: true},
    cost: {type: Number, required: true},
    date: {type: Date, default: Date.now()},

});

const userModel = new mongoose.Schema({
    name: {type: String, default: false },
    surname: {type: String, default: false },
    imgPath: {type: String, default: false },
    email: {type: String, required: true, validate: {validator: emailValidator, message: "Ojojoj"}, index: {unique: true, dropDups: true} },
    pass: {type: String, required: true}, 
    budget: {type: Number, default: false},
    category: [categoryShema],
    purpose: [purposeShema],
    expense: [expenseShema],
    registered: {type: Date, default: new Date()}
});

module.exports = {
    userModel: mongoose.model('Users', userModel),
    categoryModel: mongoose.model('Category', categoryShema),
    purposeModel: mongoose.model('Purpose', purposeShema),
    expenseModel: mongoose.model('Expense', expenseShema)
}

