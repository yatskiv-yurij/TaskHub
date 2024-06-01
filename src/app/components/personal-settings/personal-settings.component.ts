import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-personal-settings',
  templateUrl: './personal-settings.component.html',
  styleUrls: ['./personal-settings.component.scss']
})
export class PersonalSettingsComponent {
  user$ = this.store.select(selectUser)
  userData: any;
  currentPass = ''
  newPass1 = ''
  newPass2 = ''

  constructor(
    private store: Store,
    private authService: AuthService,
    private cookieService: CookieService,
  ){}

  ngOnInit(){
    this.user$.subscribe(
      (res)=> {
        this.userData = {...res};
      }
    )
  }

  setNewImage(event: any){
    if (event.target && event.target.files) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.authService.saveFile(formData).subscribe(
        (res) => {
          this.authService.updateUser(this.cookieService.get('taskhub-token'), {image: res}).subscribe(
            (res1) => {
              this.userData.image = res
            }
          )
        }
      );
    }
  }

  setFullName(){
    this.authService.updateUser(this.cookieService.get('taskhub-token'), {fullname: this.userData.fullname}).subscribe(
      (res) => {
      
      }
    )
  }

  setUserName(){
    this.authService.updateUser(this.cookieService.get('taskhub-token'), {username: this.userData.username}).subscribe(
      (res) => {
      
      }
    )
  }

  setNewPass(){
    this.authService.checkPass(this.cookieService.get('taskhub-token'), this.currentPass).subscribe(
      (res) => {
        console.log(res);
        if(res.success){
          console.log('he')
          if(this.newPass1 == this.newPass2){
            
            this.authService.changePassword(this.userData.id, this.newPass1).subscribe(
              (res) => {
                console.log(res)
              }
            );
          }
        }
      }
    )
  }

  // isNotification = false;
  isPasswordVisible1 = true
  isPasswordVisible2 = true
  isPasswordVisible3 = true

  // toggleNotification(){
  //   this.isNotification = !this.isNotification;
  // }

  togglePasswordVisibility(number: number){
    switch(number){
      case 1:{
        this.isPasswordVisible1 = !this.isPasswordVisible1;
        break;
      }
      case 2:{
        this.isPasswordVisible2 = !this.isPasswordVisible2;
        break;
      }
      case 3:{
        this.isPasswordVisible3 = !this.isPasswordVisible3;
        break;
      }

    }
  }
}
