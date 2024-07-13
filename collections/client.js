const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({});

module.exports = mongoose.model('client', clientSchema);
