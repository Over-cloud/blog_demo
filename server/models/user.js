const mongoose = require('mongoose')

const Schema = mongoose.Schema
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

// PostSchema.statics.count = async function() {
//     try {
//         return await this.countDocuments({});
//     } catch (error) {
//         throw new Error(`Error getting post count: ${error.message}`)
//     }
// }
//
// PostSchema.statics.getByPage = async function(pageNum, postPerPage, sortCriteria) {
//         try {
//             const posts = await this.find({})
//                 .sort(sortCriteria)
//                 .skip(pageNum * postPerPage)
//                 .limit(postPerPage)
//                 .exec()
//
//             return posts
//         } catch (error) {
//             throw new Error(`Error getting page: ${error.message}`)
//         }
// }

module.exports = mongoose.model('User', UserSchema)
