import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
import { BoardService } from 'src/app/services/board.service';
import { CookieService } from 'ngx-cookie-service';
import { SocialAuthService, MicrosoftLoginProvider } from '@abacritt/angularx-social-login';
import { Store } from '@ngrx/store';
import { createUser } from 'src/app/store/actions/user.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-social',
  templateUrl: './log-social.component.html',
  styleUrls: ['./log-social.component.scss']
})
export class LogSocialComponent {
  user: any;
  logIn: any;
  projectId = '';
  boardId = '';

  constructor( 
    private authService: AuthService, 
    private projectService: ProjectService, 
    private boardService: BoardService,
    private cookieService: CookieService, 
    private socialAuthService: SocialAuthService, 
    private store: Store,
    private router: Router) {
  }

  ngOnInit(){
    this.projectId = this.cookieService.get('taskhub-project');
    this.boardId = this.cookieService.get('taskhub-board');
    this.socialAuthService.authState.subscribe((user) => {
      this.user = user;
      this.logIn = (user != null);
      if(user){
        this.loginGoogle(this.user.idToken);
      }  
    })
  }

 checkUser(email: any){
    this.authService.checkUser(email).subscribe(
      (res) => {
          return res.isUser;
      }
    )
    return true;
  }

  loginGoogle(token:any){
    this.authService.authGoogle(token).subscribe(
      (res) => {
        const {email, name, picture} = res.userData;
        this.authService.checkUser(email).subscribe(
          (res) => {
            if(!res.isUser){
              this.authService.registration(email, name, undefined, picture).subscribe(
                (res) => {
                  this.cookieService.set('taskhub-token', res.token, { expires: 7 });
                  this.projectService.createProject('Project 1', this.cookieService.get('taskhub-token')).subscribe(
                    (res1) => {
                      this.boardService.createBoard('Board', this.cookieService.get('taskhub-token'), res1._id).subscribe(
                        (res2) => {
                          this.router.navigate([`/dashboard/${res1._id}/${res2._id}/backlog`]);
                          this.cookieService.set('taskhub-project', res1._id, 365 , '/');
                          this.cookieService.set('taskhub-board', res2._id, 365 , '/');
                          this.projectId = res1._id;
                          this.boardId = res2._id;
                        }
                      ) 
                    }
                  )
                  this.setUser(res);
                }
              )
            }else{
              this.authService.login(email).subscribe(
                (res) => {
                  this.cookieService.set('taskhub-token', res.token, { expires: 7 });
                  this.setUser(res);
                }
              )
            }
          }
        )
      },
      (error) => {
       console.error('Помилка входу');
      }
    )
  }

  signInWithMicrosoft(): void {
    this.socialAuthService.signIn(MicrosoftLoginProvider.PROVIDER_ID).then((userData) => {
      const {email, name } = userData;
      this.authService.checkUser(email).subscribe(
        (res) => {
          if(!res.isUser){
            this.authService.registration(email, name).subscribe(
              (res) => {
                this.cookieService.set('taskhub-token', res.token, { expires: 7 });
                this.projectService.createProject('Project 1', this.cookieService.get('taskhub-token')).subscribe(
                  (res1) => {
                    this.boardService.createBoard('Board', this.cookieService.get('taskhub-token'), res1._id).subscribe(
                      (res2) => {
                        this.router.navigate([`/dashboard/${res1._id}/${res2._id}/backlog`]);
                        this.cookieService.set('taskhub-project', res1._id, 365 , '/');
                        this.cookieService.set('taskhub-board', res2._id, 365 , '/');
                        this.projectId = res1._id;
                          this.boardId = res2._id;
                      }
                    ) 
                  }
                )
                this.setUser(res);
              }
            )
          }else{
            this.authService.login(email).subscribe(
              (res) => {
                this.cookieService.set('taskhub-token', res.token, { expires: 7 });
                this.setUser(res);
              }
            )
          }
        }
      )
    },
    (error) => {
      console.error('Помилка входу');
    });
  }

  signInWithGitHub(): void {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=e472c1ac15d95cb2f88c&scope=user,email';
  }

  setUser(data: any){
    const userData = {
      fullname: data.fullname,
      username: data.username || null,
      email: data.email,
      image: data.image || null
    }
    this.store.dispatch(createUser({ user:  userData}));
    if(this.cookieService.get('taskhub-token')){
      this.router.navigate([`/dashboard/${this.projectId}/${this.boardId}/backlog`]);
    }
  }

}
