import mongoose from 'mongoose';

const PrioritySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true
    }
})

export default mongoose.model('Priority', PrioritySchema);