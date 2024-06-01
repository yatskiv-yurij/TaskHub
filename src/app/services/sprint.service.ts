import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = 'http://localhost:3001/taskhub/sprint';
  private dataChange: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: HttpClient) { }

  getAll(board: any): Observable<any>{
    const params = new HttpParams().set('board', board);
    return this.http.get<any>(`${this.apiUrl}/get-all`, { params });
  }

  createSprint(info: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/create`, info);
  }

  updateSprint(id: any, info: any): Observable<any>{
    return this.http.patch<any>(`${this.apiUrl}/update/${id}`, info);
  }

  deleteSprint(id: any): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  setDataChange(): void{
    this.dataChange.next(!this.dataChange)
  }

  getDataChange(): Observable<boolean>{
    return this.dataChange.asObservable();
  }
}
