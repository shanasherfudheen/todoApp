const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    todos: {
        type: [
            {
                description: String,
                completed: Boolean
            }
        ],
        default: []
    }
})

module.exports = mongoose.model('Project', projectSchema)