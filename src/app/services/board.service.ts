import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private dataChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private apiUrl = 'http://localhost:3001/taskhub/board';

  constructor(private http: HttpClient) { }

  createBoard(title: any, token: any, project: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/create`, {title, project}, {headers: { Authorization: `Bearer ${token}` }});
  }

  updateBoard(token: any, boardId:any, data: any){
    return this.http.patch<any>(`${this.apiUrl}/update/${boardId}`, data, {headers: { Authorization: `Bearer ${token}` }});
  }

  getAll(token: any){
    return this.http.get<any>(`${this.apiUrl}/get-all`, {headers: { Authorization: `Bearer ${token}` }});
  }

  getOne(boardId: any) {
    const params = new HttpParams().set('boardId', boardId);
    return this.http.get<any>(`${this.apiUrl}/get-one`, { params });
  }

  getAllForProject(token: any, project: any){
    const params = new HttpParams().set('project', project);
    return this.http.get<any>(`${this.apiUrl}/get-all-project`, { params, headers: { Authorization: `Bearer ${token}` } },);
  }

  deleteBoard(token: any, boardId: any) {
    return this.http.delete<any>(`${this.apiUrl}/delete/${boardId}`, {headers: { Authorization: `Bearer ${token}` }});
  }

  newMember(token:any, boardId: any, email:any, color: any){
    return this.http.patch<any>(`${this.apiUrl}/new-member/${boardId}`, { email, color }, { headers: { Authorization: `Bearer ${token}` } });
  }

  leaveBoard(boardId:any, email: any, token: any){
    return this.http.patch<any>(`${this.apiUrl}/leave/${boardId}`, { email }, { headers: { Authorization: `Bearer ${token}` } });
  }

  getLabel(board: any) {
    const params = new HttpParams().set('board', board);
    return this.http.get<any>(`http://localhost:3001/taskhub/labels/get-all`, { params });
  }

  createLabel(board: any, title: any){
    return this.http.post<any>(`http://localhost:3001/taskhub/labels/create`, { board, title });
  }
  

  setDataChange(): void{
    this.dataChange.next(!this.dataChange)
  }

  getDataChange(): Observable<boolean>{
    return this.dataChange.asObservable();
  }

  isUserBoard(token: any, boardId: any){
    const params = new HttpParams().set('boardId', boardId);
    return this.http.get<any>(`${this.apiUrl}/is-user-board`, { params , headers: { Authorization: `Bearer ${token}` }});
  }
}
