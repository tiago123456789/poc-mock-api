const mongoose = require('mongoose');

const endpointDataSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        trim: true
    },
    endpoint: {
        type: String,
        required: true,
        trim: true,
    },
}, { strict: false });

module.exports = mongoose.model('endpoint_data', endpointDataSchema);
