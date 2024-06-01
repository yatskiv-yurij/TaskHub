import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SendMailService } from 'src/app/services/send-mail.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cannotlog',
  templateUrl: './cannotlog.component.html',
  styleUrls: ['./cannotlog.component.scss']
})
export class CannotlogComponent {
  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private mailService: SendMailService, private router: Router){}

  sendMail(){
    const subject = "Set your new TaskHub password";
    const to = this.emailForm.value.email;
    this.mailService.changePassword(to).subscribe(
      (res) => {
        this.mailService.sendMail(to, subject, res).subscribe(
          (res1) => {
            this.router.navigate(['/auth/log-in']);
          }
        )
      }
    );
   
    
  }
}