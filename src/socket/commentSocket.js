import Comments from "../models/Comments.js";

export default function commentSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected to comments namespace');
        
        socket.on('joinTask', (taskId) => {
          socket.join(taskId);
        });
    
        socket.on('leaveTask', (taskId) => {
          socket.leave(taskId);
        });

        socket.on('addComment', async (taskId, newComment) => {
          try {
            const addedComment = await Comments.create({
                ...newComment
            });

            io.to(taskId).emit('commentAdded', addedComment);
          } catch (err) {
              console.error('Error adding comment:', err);
          }
        });

        socket.on('updateComment', async (taskId, commentId, comment) => {
          try {
            const updateComment = await Comments.findByIdAndUpdate({
              id: commentId 
            },{
              ...comment
            });

            io.to(taskId).emit('commentUpdated', updateComment);
          } catch (err) {
            console.error('Error updating comment:', err);
          }
        });

        socket.on('deleteComment', async (taskId, commentId) => {
          try {
            await Comments.deleteOne({_id: commentId});
            io.to(taskId).emit('commentDeleted');
          } catch (err) {
            console.error('Error deleting comment:', err); 
          }
        })
        
        socket.on('disconnect', () => {
          console.log('User disconnected from comment namespace');
        });
    });
}