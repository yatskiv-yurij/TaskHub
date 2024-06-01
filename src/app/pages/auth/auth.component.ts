import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  constructor(
    private cookieService: CookieService,
    private router: Router){}

  ngOnInit() {
    if(this.cookieService.get('taskhub-token')){
      this.router.navigate(['/dashboard/backlog'])
    }
  }
}
