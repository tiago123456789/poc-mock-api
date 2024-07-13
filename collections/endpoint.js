const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
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
    schema: {
        type: Array,
        required: true
    }
}, { strict: false });

module.exports = mongoose.model('endpoint', endpointSchema);
