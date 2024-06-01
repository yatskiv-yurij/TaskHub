import Board from "../models/Board.js";

const boardController = {
    async create(req, res){
        try {
            const { title, project } = req.body;

            const doc = new Board({
                title,
                fields: [{
                        title: "to do",
                        status: "to do"
                    },
                    {
                        title: "doing",
                        status: "in process" 
                    },
                    {
                        title: "done",
                        status: "done" 
                    }
                ],
                participants: [{
                    email: req.email,
                    color: "#FF0000"
                }],
                project,
                setColor: 'none'
            })

            const board = await Board.create(doc);
            return res.status(200).json(board);
            
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create board' });
        }
    },

    async getOneBoard(req, res){
        try {
            const boards = await Board.find({_id: req.query.boardId});
            return res.status(200).json(boards);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },

    async getAll(req, res){
        try {
            const boards = await Board.find({
                participants: {
                    $elemMatch: {
                        email: req.email
                    }
                }
            }).populate('project').exec();

            return res.status(200).json(boards);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },

    async getAllForProject(req, res) {
        try {
            const boards = await Board.find({
                participants: {
                    $elemMatch: {
                        email: req.email
                    }
                },
                project: req.query.project
            }).exec();

            return res.status(200).json(boards);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Failed to get data',
            });
        }
    },

    async updateBoard(req, res) {
        try {
            
            const id = req.params.id;
            console.log(req.params);
            const updateBoard = await Board.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            return res.status(200).json(updateBoard);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to update board data",
            })
        }
    },

    async deleteBoard(req, res) {
        try {
            await Board.deleteOne({_id: req.params.id});
            res.status(200).json({
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The board has not been removed",
            })
        }
    },

    async isUserProject(req, res) {
        try {
            const board = await Board.find({
                participants: {
                    $elemMatch: {
                        email: req.email
                    }
                },
                _id: req.query.boardId
            })

            if(board.length > 0){
                res.status(200).json({
                    isUser: true
                })
            }else{
                res.status(200).json({
                    isUser: false
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The operation failed",
            })
        }
    },

    async leaveBoard(req, res) {
        try {
            await Board.findOne({_id: req.params.id})
            .then(async result => {
                if (result) {
                    const participants =  result['participants'];
                    let newParticipants = [];
                    if(req.body.email){
                        newParticipants = participants.filter(item => item.email !== req.body.email);
                    }else{
                        newParticipants = participants.filter(item => item.email !== req.email);
                    }
                    const updateBoard = await Board.updateOne({_id: req.params.id}, {participants: newParticipants});
                    return res.status(200).json(updateBoard);
                } else {
                    console.log('Error getting data');
                }
   
            }).catch(err => {
                console.error('Error getting data:', err);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "The operation failed",
            })
        }
    },

    

    async addUserToBoard(req, res) {
        try {

            const { email, color } = req.body;
            await Board.findOne({_id: req.params.id})
            .then(async result => {
                if (result) {
                    const participants =  result['participants'];
                    participants.push({email, color});
                    const updateBoard = await Board.updateOne({_id: req.params.id}, {participants});
                    return res.status(200).json(updateBoard);
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

export default boardController;