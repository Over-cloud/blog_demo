const mongoose = require('mongoose')

const Schema = mongoose.Schema
const InvCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 4
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        default: function() {
            // Set default value to current datetime + 7 days
            const now = new Date();
            now.setDate(now.getDate() + 7);
            return now;
        }
    },
    maxUsage: {
        type: Number,
        default: 10
    },
    description: {
        type: String,
        default: ''
    }
});

const InvitationCode = mongoose.model('InvitationCode', InvCodeSchema);

module.exports = InvitationCode;
