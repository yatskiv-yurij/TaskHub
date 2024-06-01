import mongoose from 'mongoose';

const CommentsSchema = new mongoose.Schema({
    tasks: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Tasks'
    },
    data: {
        type: String,
        required: true
    },
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
})

export default mongoose.model('Comments', CommentsSchema);