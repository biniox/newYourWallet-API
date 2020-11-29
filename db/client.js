const mongoose = require('mongoose');
const { URI_MONGO } = require("../config");

mongoose.connect(URI_MONGO, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Database connection is established"));

  module.exports = db;