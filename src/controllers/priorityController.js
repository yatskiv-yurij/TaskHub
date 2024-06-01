import Priority from "../models/Priority.js";

const priorityController = {
    async getAll(req, res){
        try {
            const priorities = await Priority.find();

            return res.status(200).json(priorities);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    }
}

export default priorityController;