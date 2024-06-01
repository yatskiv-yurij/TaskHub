import Tasks from "../models/Tasks.js";

export default function taskSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected to task namespace');
        socket.on('joinBoard', (boardId) => {
          socket.join(boardId);
        });
    
        socket.on('leaveBoard', (boardId) => {
          socket.leave(boardId);
        });

        socket.on('addTask', async (boardId, newTask) => {
          try {
            const addedTask = await Tasks.create({
                ...newTask
            });

            io.to(boardId).emit('taskAdded', addedTask);
          } catch (err) {
              console.error('Error adding task:', err);
          }
        });

        socket.on('updateTask', async (boardId, taskId, task) => {
          try {
            const updateTask = await Tasks.findByIdAndUpdate({
              _id: taskId 
            },{
              ...task
            });

            io.to(boardId).emit('taskUpdated', updateTask);
          } catch (err) {
            console.error('Error updating task:', err);
          }
        });

        socket.on('deleteTask', async (boardId, taskId) => {
          try {
            await Tasks.deleteOne({_id: taskId});
            io.to(boardId).emit('taskDeleted');
          } catch (err) {
            console.error('Error deleting task:', err); 
          }
        })
        
        socket.on('disconnect', () => {
          console.log('User disconnected from task namespace');
        });
    });
}