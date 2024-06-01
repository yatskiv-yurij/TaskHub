import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    image: {
        type: Object,
    },
    description: {
        type: String,
    },
    participants:{
        type: Array,
        default: []
    },
},
{
    timestamps: true
})

export default mongoose.model('Projects', ProjectSchema);