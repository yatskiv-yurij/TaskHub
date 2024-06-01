import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';
import { Store } from '@ngrx/store';
import { createUser } from 'src/app/store/actions/user.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isDropdown: boolean = false;
  isUser: boolean = false;
  projectId = ''
  boardId = '';
  userImage = '';

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    private store: Store,
  ){}

  ngOnInit() {
    const token = this.cookieService.get('taskhub-token');
    this.projectId = this.cookieService.get('taskhub-project');
    this.boardId = this.cookieService.get('taskhub-board');
    if(token){
      this.isUser = true;
      this.authService.getMe(token).subscribe(
        (res) => {
          const userData = {
            fullname: res.fullname,
            username: res.username || null,
            email: res.email,
            image: res.image || null
          }
          this.store.dispatch(createUser({ user:  userData}));

          if(this.checkImage(res.image)){
            this.userImage = res.image
          }else if(res.image){
            this.userImage = 'http://localhost:3001'+res.image
          }
        }
      )
    }
  }

  toggleDropdown() {
    this.isDropdown = !this.isDropdown;
  }

  logOut() {
    this.isUser = false;
    this.cookieService.delete('taskhub-token', '/');
  }

  checkImage(image: any) {
    return image.includes('http') || image.includes('https');
  }
}
