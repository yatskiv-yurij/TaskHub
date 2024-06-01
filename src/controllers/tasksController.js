import Tasks from "../models/Tasks.js";
import mongoose from "mongoose";

const  tasksController = {
    async getAll(req, res){
        try {
            const tasks = await Tasks.find({board: req.query.boardId}).populate({
                path: 'board',
                populate: {
                  path: 'project',
                  model: 'Projects'
                },
            }).populate([
                { path: 'label' },
                { path: 'priority' },
                { path: 'performer' },
                { path: 'author' }
            ]);
            res.status(200).json(tasks);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Error when receiving tasks' });
        }
    },

    async getWork(req, res){
        try {
            const tasksObjectIds = JSON.parse(req.query.tasksId).map(id => {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    return new mongoose.Types.ObjectId(id);
                }
            });
            const task = await Tasks.find({_id: { $in: tasksObjectIds} }).populate({
                path: 'board',
                populate: {
                  path: 'project',
                  model: 'Projects'
                },
            });
            
            res.status(200).json(task);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Error when receiving tasks' });
        }
    },

    async getOne(req, res){
        try {
            const task = await Tasks.find({_id: req.query.tasksId}).populate({
                path: 'board',
                populate: {
                  path: 'project',
                  model: 'Projects'
                },
            });
            
            res.status(200).json(task);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Error when receiving tasks' });
        }
    },

    async tasksSearch(req, res){
        try {
            const regex = new RegExp(req.query.title, 'i');
            const task = await Tasks.find({ title: { $regex: regex } }).populate({
                path: 'board',
                populate: {
                  path: 'project',
                  model: 'Projects'
                }
            });
            
            res.status(200).json(task);
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Error when receiving tasks' });
        }
    }
}

export default tasksController;