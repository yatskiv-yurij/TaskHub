import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../store/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private http: HttpClient) { }

  getTasks(board: any): Observable<Task[]> {
    const params = new HttpParams().set('boardId', board);
    return this.http.get<Task[]>('https://taskhub-server-g76s.onrender.com/taskhub/tasks/get-all/', { params });
  }

  getLatest(tasks: any): Observable<any> {
    const params = new HttpParams().set('tasksId', tasks);
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/tasks/get-work/', { params });
  }

  getOne(tasks: any): Observable<any> {
    const params = new HttpParams().set('tasksId', tasks);
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/tasks/get-one/', { params });
  }

  getSearch(title: any): Observable<any> {
    const params = new HttpParams().set('title', title);
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/tasks/get-search/', { params });
  }

  getPriority(): Observable<any> {
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/priority/get-all/');
  }

  getComments(tasks: any): Observable<any> {
    const params = new HttpParams().set('tasks', tasks);
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/comments/get-all/', { params });
  }

  // getFile(file:any){
  //   return this.http.get(`http://localhost:3001/uploads/${file}`, { responseType: 'blob' });
  // }

  createAttachment(tasks: any, link: any, name: any, extension: any){
    return this.http.post<any>(`v/attachment/create/`, {tasks, link, name, extension});

  }
  getAttachment(taskId: any){
    const params = new HttpParams().set('tasks', taskId);
    return this.http.get<any>('https://taskhub-server-g76s.onrender.com/taskhub/attachment/get-all/', { params });
  }

  deleteAttachment(attachmentId: any){
    return this.http.delete<any>(`https://taskhub-server-g76s.onrender.com/taskhub/attachment/delete/${attachmentId}`);
  }

  deleteFile(files: any){
    const params = new HttpParams().set('files', files);
    return this.http.delete<any>(`https://taskhub-server-g76s.onrender.com/taskhub/files/upload/`, { params });
  }
  
  saveFile(files: FormData){
    return this.http.post<any>(`https://taskhub-server-g76s.onrender.com/taskhub/files/upload/`, files);
  }
}
