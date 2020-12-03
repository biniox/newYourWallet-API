const mongoose = require('mongoose');
const { URI_MONGO } = require("../config");

const clean = async () =>  await mongoose.connection.dropDatabase();
const connect = async () => await mongoose.connect(URI_MONGO, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const closeConnect = async () => await mongoose.connection.close();

connect();

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Database connection is established"));

  module.exports = {
    clean,
    connect,
    closeConnect,
    db
  };