import Comments from "../models/Comments.js";

const commentsController = {
    async getAll(req, res){
        try {
            const { tasks } = req.query
            const comments = await Comments.find({tasks}).populate({
                path: 'user',
                select: 'fullname image'
            }).exec();
            const {passwordHash, ...commentsData} = comments;
            return res.status(200).json(commentsData);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    }
}

export default commentsController;