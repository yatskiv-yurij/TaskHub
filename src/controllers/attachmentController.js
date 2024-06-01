import Attachment from "../models/Attachment.js";

const attachmentController = {
    async create(req, res){
        try {
            const { tasks, link, name, extension } = req.body;

            const doc = new Attachment({
                tasks,
                link,
                name,
                extension
            })

            const attachment = await Attachment.create(doc);
            return res.status(200).json(attachment);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create attachment' });
        }
    },

    async getAll(req, res){
        try {
            const { tasks } = req.query
            const attachments = await Attachment.find({tasks});
            return res.status(200).json(attachments);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },

    async update(req, res){
        try {
            const updateAttachment = await Attachment.findByIdAndUpdate(
                {
                    _id: req.params.id
                },
                req.body, 
                {
                    new: true,
                }
            );
            return res.status(200).json(updateAttachment);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed update attachment' });
        }
    },

    async delete(req, res){
        try {
            await Attachment.deleteOne({_id: req.params.id});
            res.json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed delete attachment' });
        }
    }
}

export default attachmentController;