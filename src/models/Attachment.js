import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
    tasks: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Tasks'
    },
    link: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    extension: {
        type: String,
        required: true
    }
},
{
    timestamps: true
})

export default mongoose.model('Attachment', AttachmentSchema);