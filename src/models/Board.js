import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    fields:{
        type: Array,
        default: []
    },
    participants:{
        type: Array,
        default: []
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projects'
    },
    setColor: {
        type: String,
        required: true,
    },
    newColor: {
        type: Array
    }
},
{
    timestamps: true,
})

export default mongoose.model('Board', BoardSchema);