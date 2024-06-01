import mongoose from 'mongoose';

const LabelsSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    board:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }
},
{
    timestamps: true,
})

export default mongoose.model('Label', LabelsSchema);