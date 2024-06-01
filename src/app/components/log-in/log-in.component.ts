import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent {
  isPasswordVisible: boolean = true;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/)]),
  });

  user: any;
  logIn: any;

  constructor( 
    private authService: AuthService, 
    private cookieService: CookieService, 
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(){
    if(this.cookieService.get('taskhub-token')){
      this.router.navigate(['/home']);
    }
    this.route.queryParams.subscribe((params: Params) => {
      const code = params['code'];
      if (code) {
        this.authService.authGitHub(code);
      }
    });
  }
  
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  login(){
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password?.toString()).subscribe(
      (res) => {
        this.cookieService.set('taskhub-token', res.token,  7 , '/');
        if(this.cookieService.get('taskhub-token')){
          const projectId = this.cookieService.get('taskhub-project');
          const boardId = this.cookieService.get('taskhub-board');
          this.router.navigate([`/dashboard/${projectId}/${boardId}/backlog`]);
        } 
      },
      (error) => {
       console.error('Помилка входу');
      }
    )
  }
}



