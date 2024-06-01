import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { HttpClient } from "@angular/common/http";
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SocketIoService {
  

  constructor(private socket: Socket) {
    
  }

  connBoard(boardId: any): void{
    this.socket.emit('joinBoard', boardId);
  }

  createTask(boardId: any, newTask: any): void {
    this.socket.emit('addTask', boardId, newTask);
  }

  deleteTask(boardId: any, taskId: any): void{
    this.socket.emit('deleteTask', boardId, taskId);
  }

  updateTask(boardId: any, taskId: any, task: any):void {
    this.socket.emit('updateTask', boardId, taskId, task);
  }

  getSocket() {
    return this.socket;
  }

  connectTask(taskId: any): void{
    this.socket.emit('joinTask', taskId);
  }

  createComment(taskId: any, data: any){
    this.socket.emit('addComment', taskId, data);
  }

  deleteComment(taskId: any, commentId: any){
    this.socket.emit('deleteComment', taskId, commentId);
  }

}
