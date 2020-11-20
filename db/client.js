const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:root@cluster0.pputj.mongodb.net/wallet?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Database connection is established"));

  module.exports = db;