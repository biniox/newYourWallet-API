const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const {usersRouter} = require('./routes/users');
const categoryRouter = require('./routes/category');
const expenseRouter = require('./routes/expense');
const purposeRouter = require('./routes/purpose');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res, next) => {
    res.removeHeader('X-Powered-By');
    next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);

app.use('/expense', expenseRouter);
app.use('/purpose', purposeRouter);

module.exports = app;
