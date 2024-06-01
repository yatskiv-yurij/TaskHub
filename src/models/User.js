import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true,
    },
    username:{
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
    },
    image: {
        type: String,
    }
},
{
    timestamps: true,
});

export default mongoose.model('User', UserSchema);