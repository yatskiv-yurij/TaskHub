import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
import { BoardService } from 'src/app/services/board.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createUser } from 'src/app/store/actions/user.actions';
import { selectUser } from 'src/app/store/selectors/user.selector';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  userData$ = this.store.select(selectUser);
  isPasswordVisible: boolean = true;
  isContinue: boolean = false;
  isUser: boolean = false;
  userEmail: string | undefined = "";
  userError: boolean = false;
  user: any;
  logIn: any;
  conditionsMet: number = 0;

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  dataForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/)]),
  });

  
  constructor( 
    private authService: AuthService,
    private projectService: ProjectService, 
    private boardService: BoardService,
    private cookieService: CookieService,
    private store: Store,
    private router: Router) {
  }

  ngOnInit() {
    if(this.cookieService.get('taskhub-token')){
      this.router.navigate(['/home']);
    }
    this.dataForm.controls['password'].valueChanges.subscribe(() => {
      this.checkPassword();
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  checkUser() {
    const { email } = this.emailForm.value;
    this.authService.checkUser(email).subscribe(
      (res) => {
        if(!res.isUser) {
          this.userEmail = email?.toString();
          this.isContinue = true;
          this.isUser = false;
          this.userError = false;
        }else{
          this.isUser = true;
          this.userError = true;
        }
      },
      (error) => {
       console.error('Помилка входу');
      }
    )
  }

  registration() {
    const {fullName, password} = this.dataForm.value;
    this.authService.registration(this.userEmail, fullName, password?.toString()).subscribe(
      (res) => {
        this.setUser(res);
        if(this.cookieService.get('taskhub-token')){
          this.projectService.createProject('Project 1', this.cookieService.get('taskhub-token')).subscribe(
            (res1) => {
              this.boardService.createBoard('Board', this.cookieService.get('taskhub-token'), res1._id).subscribe(
                (res2) => {
                  this.router.navigate([`/dashboard/${res1._id}/${res2._id}/backlog`]);
                  this.cookieService.set('taskhub-project', res1._id, 365 , '/');
                  this.cookieService.set('taskhub-board', res2._id, 365 , '/');
                }
              ) 
            }
          )
        }
      }
    )
  }

  setUser(data: any){
    this.cookieService.set('taskhub-token', data.token, 7 , '/');
    const userData = {
      fullname: data.fullname,
      username: data.username || null,
      email: data.email,
      image: data.image || null,
      id: data._id
    }
    this.store.dispatch(createUser({ user:  userData}));
  }



 

  checkPassword() {
    this.conditionsMet = 0;
    const password = this.dataForm.controls['password'].value || '';
    // Перевірка параметрів
    // Перевірка довжини паролю
    if (password.length >= 8) {
      this.conditionsMet++;
    }
    

    // // Перевірка наявності великої літери
    const uppercaseRegex = /[A-Z]/;
    if (uppercaseRegex.test(password)) {
      this.conditionsMet++;
    }

    // // Перевірка наявності символу
    const symbolRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    if (symbolRegex.test(password)) {
      this.conditionsMet++;
    }

    // // Перевірка наявності цифри
    const numberRegex = /\d/;
    if (numberRegex.test(password)) {
      this.conditionsMet++;
    }
    
  }
}
