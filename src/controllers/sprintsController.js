import Sprints from "../models/Sprints.js";

const sprintsController = {
    async create(req, res){
        try {
            const { title, start, end, goal, board } = req.body;

            const doc = new Sprints({
                title,
                start,
                end,
                goal,
                status: 'create',
                board
            })

            const sprint = await Sprints.create(doc);
            return res.status(200).json(sprint);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create sprint' });
        }
    },
    
    async getAll(req, res){
        try {
            const sprints = await Sprints.find({
                board: req.query.board
            })

            return res.status(200).json(sprints);
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
            const updateSprint = await Sprints.findByIdAndUpdate(id, req.body, {
                new: true
            })

            return res.status(200).json(updateSprint);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to update sprint data",
            })
        }
    },

    async delete(req, res){
        try {
            await Sprints.deleteOne({_id: req.params.id});
            res.json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The sprint has not been removed",
            })
        }
    }
}

export default sprintsController;