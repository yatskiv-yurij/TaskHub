import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ProjectService } from './project.service';
import { BoardService } from './board.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { createUser } from 'src/app/store/actions/user.actions';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/taskhub/user';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService, 
    private projectService: ProjectService,
    private boardService: BoardService,
    private store: Store,
    private router: Router
  ) {}

  checkUser(email: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-user`, { email });
  }

  login(email: any, password = ''): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  getMe(token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.apiUrl}/get-me`, { headers });
  }
  getUserInfo(emails: string):Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get-user-info`, { emails });
  } 

  authGoogle(token: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-auth-google`, { token});
  }

  authGitHub(code: any): any {
    this.http.post<any>(`${this.apiUrl}/check-auth-github`, { code }).subscribe(
      (res) => {
        this.getGitHubData(res.token)
      }
    )
  }

  getGitHubData(token: any): any {
    try {
      this.http.get<any>('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe(
        (res)=> {
          this.http.get<any>('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).subscribe(emails => {
            const primaryEmail: string | undefined = emails.find((email: { primary: any; }) => email.primary)?.email;

            this.checkUser(primaryEmail).subscribe(
              (res2) => {
                if(!res2.isUser){
                  this.registration(primaryEmail, res.name, undefined, res.avatar_url, res.login).subscribe(
                    (res3) => {
                      this.cookieService.set('taskhub-token', res3.token, 7 , '/');
                      this.projectService.createProject('Project 1', this.cookieService.get('taskhub-token')).subscribe(
                        (res4) => {
                          this.boardService.createBoard('Board', this.cookieService.get('taskhub-token'), res4._id).subscribe(
                            (res5) => {
                              this.router.navigate([`/dashboard/${res4._id}/${res5._id}/backlog`]);
                              this.cookieService.set('taskhub-project', res4._id, 365 , '/');
                              this.cookieService.set('taskhub-board', res5._id, 365 , '/');
                            }
                          ) 
                        }
                      )
                      this.setUser(res3);
                    }
                  )
                }else{
                  this.login(primaryEmail).subscribe(
                    (res3) => {
                      this.cookieService.set('taskhub-token', res3.token, 7 , '/');
                      this.setUser(res3);
                    }
                  )
                }
              }
            )
          });
        }
      )

    } catch (error) {
      console.error('Error handling GitHub callback:', error);
    }
  }

  registration(email: any, fullname: any, password = '', image = '', username = ''){
    return this.http.post<any>(`${this.apiUrl}/register`, { email, fullname, password, image, username });
  }

  changePassword(id: any, password: any){
    return this.http.patch<any>(`${this.apiUrl}/change-pass`, { id, password });
  }

  setUser(data: any){
    const projectId = this.cookieService.get('taskhub-project');
    const boardId = this.cookieService.get('taskhub-board');
    const userData = {
      fullname: data.fullname,
      username: data.username || null,
      email: data.email,
      image: data.image || null,
      id: data._id
    }
    this.store.dispatch(createUser({ user:  userData}));
    if(this.cookieService.get('taskhub-token')){
      this.router.navigate([`/dashboard/${projectId}/${boardId}/backlog`]);
    }
  }

  saveFile(files: FormData){
    return this.http.post<any>(`http://localhost:3001/taskhub/files/upload/`, files);
  }

  updateUser(token: any, data: any){
    return this.http.patch<any>(`${this.apiUrl}/update-me`, data, {headers: { Authorization: `Bearer ${token}` }});
  }

  checkPass(token: any, password: any){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const params = new HttpParams().set('password', password);
    return this.http.get<any>(`${this.apiUrl}/check-pass`, { params, headers });
  }

  deleteUser(token:any){
    return this.http.delete<any>(`${this.apiUrl}/delete`, {headers: { Authorization: `Bearer ${token}` }});
  }
}
