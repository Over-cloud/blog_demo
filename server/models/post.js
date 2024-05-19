const mongoose = require('mongoose')

const Schema = mongoose.Schema
const PostSchema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
})

PostSchema.statics.count = async function(countCriteria) {
    try {
        return await this.countDocuments(countCriteria);
    } catch (error) {
        throw new Error(`Error getting post count: ${error.message}`)
    }
}

PostSchema.statics.getByPage = async function(params) {
    const pageNum = (params.pageNum || 1) - 1
    const postPerPage = params.postPerPage || 5
    const sortCriteria = params.sortCriteria || { createdAt: -1 }
    const defaultSelect = {
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
    }
    const selectCriteria = params.selectCriteria || defaultSelect

    try {
        const posts = await this.find(selectCriteria)
            .sort(sortCriteria)
            .skip(pageNum * postPerPage)
            .limit(postPerPage)
            .exec()

        const postCnt = await this.count(selectCriteria)

        return {
            posts,
            postCnt,
        }
    } catch (error) {
        throw new Error(`Error getting page: ${error.message}`)
    }
}

PostSchema.statics.getDeletedByPage = async function(params) {
    params.selectCriteria = { isDeleted: true }

    try {
        return await this.getByPage(params)
    } catch (error) {
        throw new Error(`Error getting page: ${error.message}`)
    }
}

module.exports = mongoose.model('Post', PostSchema)
