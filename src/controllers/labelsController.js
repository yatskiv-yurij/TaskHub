import Labels from "../models/Labels.js";


const labelsController = {
    async create(req, res){
        try {
            const { title, board } = req.body;

            const doc = new Labels({
                title,
                board
            })

            const label = await Labels.create(doc);
            return res.status(200).json(label);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create label' });
        }
    },
    async getAll(req, res){
        try {
            const labels = await Labels.find({
                board: req.query.board
            }).exec();

            return res.status(200).json(labels);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },
    async update(req, res){
        try {
            const id = req.params.id;
            const updateLabels = await Labels.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            return res.status(200).json(updateLabels);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to update label data",
            })
        }
    },
    async delete(req, res) {
        try {
            await Labels.deleteOne({_id: req.params.id});
            res.json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The label has not been removed",
            })
        }
    }
}


export default labelsController;