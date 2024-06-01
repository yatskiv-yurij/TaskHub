import mongoose from "mongoose";

const TasksSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    field: {
        type: String,
        required: true
    },
    priority: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Priority'
    },
    performer: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    author: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    label: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Label' 
    },
    approximate: {
        type: String,
    },
    status: {
        type: String,
    },
    storyPoint: {
        type: String,
    },
    board: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    sprint: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Sprints'
    }
},
{
    timestamps: true
})

export default mongoose.model('Tasks', TasksSchema);