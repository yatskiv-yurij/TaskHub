import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:3001/taskhub/projects';

  constructor(private http: HttpClient) { }

  createProject(title: any, token: any): Observable<any>{
    const imageNum = Math.floor(Math.random() * 6) + 1;
    const image = `/uploads/project${imageNum}.png`;
    const key = title.slice(0, 3);
    const description = '';
    return this.http.post<any>(`${this.apiUrl}/create`, {title, image, key, description}, {headers: { Authorization: `Bearer ${token}` }});
  }

  getAll(token: any){
    return this.http.get<any>(`${this.apiUrl}/get-all`, {headers: { Authorization: `Bearer ${token}` }});
  }

  newMember(projectId: any, email:any){
    return this.http.patch<any>(`${this.apiUrl}/new-member/${projectId}`, { email });
  }

  updateProject(projectId:any, data:any){
    return this.http.patch<any>(`${this.apiUrl}/update/${projectId}`, data);
  }

  saveFile(files: FormData){
    return this.http.post<any>(`http://localhost:3001/taskhub/files/upload/`, files);
  }

  deleteProject(projectId: any){
    return this.http.delete<any>(`${this.apiUrl}/delete/${projectId}`);
  }
  
}
