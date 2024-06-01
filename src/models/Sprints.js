import mongoose from 'mongoose';

const SprintsSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    start:{
        type: Date,
    },
    end:{
        type: Date
    },
    goal:{
        type: String
    },
    status:{
        type: String
    },
    tasks:{
        type: Array
    },
    board:{
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }
},
{
    timestamps: true
})

export default mongoose.model('Sprints', SprintsSchema);