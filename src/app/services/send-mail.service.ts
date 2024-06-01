import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SendMailService {
  private apiUrl = 'http://localhost:3001/taskhub';

  constructor(
    private http: HttpClient,
  ) {}

  changePassword(email: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/user/get-me-change-pass`, {email});
  }

  sendMail(to: any, subject: any, data: any): Observable<any>{
    const hash = CryptoJS.AES.encrypt(data._id, 'TaskHub').toString();
    const html = `<body style="background-color: #333; color: #fff"; font-size: 18px>
          <div style="text-align: center;"><br/><a href='http://localhost:4200/' style="font-size: 30px;
          padding: 20px 0; text-decoration: none; color: #fff";">
          
            TaskHub
        </a>
        <br/>
        <br/>
        <div style="height: 1px;
        width: 80%;
        background-color: red; margin: 0 auto"></div>
        <p style="margin: 20px 0 0;  font-size: 16px">Hi, ${data.fullname}</p>
        <br/>
        <p style="font-size: 16px">We've received a request to set a new password for this Atlassian account: <b>${to}</b>.</p>
        <br/>
        <a href='http://localhost:4200/auth/change-password/${hash}' style='padding: 10px 25px;
        background-color: #9B59B6;
        border: none;
        outline: none;
        border-radius: 10px;
        color: #fff;
        font-size: 20px;
        text-decoration: none;'>Set password</a><br/><br/>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br/>
        <br/><br/>  
    </div>
    </body>`;
    return this.http.post<any>(`${this.apiUrl}/email/send`, { to, subject, html })

  }

  sendMailInvitation(to: any, subject: any, data: any): Observable<any>{
    const html = `<body style="background-color: #333; color: #fff"; font-size: 18px>
          <div style="text-align: center;"><br/><a href='http://localhost:4200/' style="font-size: 30px;
          padding: 20px 0; text-decoration: none; color: #fff";">
          
            TaskHub
        </a>
        <br/>
        <br/>
        <div style="height: 1px;
        width: 80%;
        background-color: red; margin: 0 auto"></div>
        <p style="font-size: 16px">${data.fullname} shared a project with you.</p>
        <br/>
        <p style="font-size: 20px">${data.board}</p>
        <br/>
        <a href='http://localhost:4200/dashboard/${data.link}' style='padding: 10px 25px;
        background-color: #9B59B6;
        border: none;
        outline: none;
        border-radius: 10px;
        color: #fff;
        font-size: 20px;
        text-decoration: none;'>View project</a><br/><br/>
        <br/><br/>  
    </div>
    </body>`;
    return this.http.post<any>(`${this.apiUrl}/email/send`, { to, subject, html })

  }
}
