import Projects from '../models/Projects.js';

const projectsController = {
    async create(req, res){
        try {
            const { title, key, description, image } = req.body; 

            const doc = new Projects({
                title,
                key,
                description,
                image,
                participants: [req.email]
            })

            const project = await Projects.create(doc);
            return res.status(200).json(project);

        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create project' });
        }
    },

    async getAll(req, res){
        try {
            const projects = await Projects.find({
                participants: {
                    $elemMatch: {
                        $eq: req.email
                    }
                }
            }).exec();

            return res.status(200).json(projects);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },

    async update(req, res) {
        try { 
            const id = req.params.id;
            const updateProject = await Projects.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            return res.status(200).json(updateProject);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to update project data",
            })
        }
    },

    async delete(req, res) {
        try {
            await Projects.deleteOne({_id: req.params.id});
            res.json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The project has not been removed",
            })
        }
    },

    async leaveProject(req, res) {
        try {
            await Projects.findOne({_id: req.params.id})
            .then(async result => {
                if (result) {
                    const participants =  result['participants'];
                    let newParticipants = [];
                    if(req.body.email){
                        newParticipants = participants.filter(item => item !== req.body.email);
                    }else{
                        newParticipants = participants.filter(item => item !== req.email);
                    }
                    const updateProject = await Projects.updateOne({_id: req.params.id}, {participants: newParticipants});
                    return res.status(200).json(updateProject);
                } else {
                    console.log('Error getting data');
                }
   
            }).catch(err => {
                console.error('Error getting data:', err);
            });
            return res.status(200).json({
                success: true
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The operation failed",
            })
        }
    },

    async addUserToProject(req, res) {
        try {
            await Projects.findOne({_id: req.params.id})
            .then(async result => {
                if (result) {
                    const participants =  result['participants'];
                    participants.push(req.body.email);
                    const updateProject = await Projects.updateOne({_id: req.params.id}, {participants});
                    return res.status(200).json(updateProject);
                } else {
                    console.log('Error getting data');
                }
            }).catch(err => {
                console.error('Error getting data:', err);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to add new member",
            })
        } 
    }
}

export default projectsController;