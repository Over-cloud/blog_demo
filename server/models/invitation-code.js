const mongoose = require('mongoose')

const InvCodeSchema = new mongoose.Schema({
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

InvCodeSchema.statics.get = async function(params) {
    const sortCriteria = params?.sortCriteria || { validFrom: -1 }

    try {
        const codes = await this.find()
            .sort(sortCriteria)
            .exec()

        const codeCnt = await this.countDocuments()

        return {
            codes,
            codeCnt,
        }
    } catch (error) {
        throw new Error(`Error getting invitation codes: ${error.message}`)
    }
};

const InvitationCode = mongoose.model('InvitationCode', InvCodeSchema);

module.exports = InvitationCode;
