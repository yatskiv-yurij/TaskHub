import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent {
  isPasswordVisible: boolean = true;
  id: any;
  conditionsMet: number = 0;

  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/)]),
  })

  constructor(private route: ActivatedRoute, 
    private authService: AuthService, 
    private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const data: any = params.get('id')?.toString();
      const bytes = CryptoJS.AES.decrypt(data, 'TaskHub');
      this.id = bytes.toString(CryptoJS.enc.Utf8);
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  submitNewPassword(){
    const { password } = this.passwordForm.value;
    this.authService.changePassword(this.id, password).subscribe(
      (res) => {
        if(res.success){
          this.router.navigate(['/auth/log-in']);
        }
      }
    )
  }

  checkPassword() {
    this.conditionsMet = 0;
    const password = this.passwordForm.controls['password'].value || '';
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
