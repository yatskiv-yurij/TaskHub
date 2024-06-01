import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { BoardService } from 'src/app/services/board.service';
import { ProjectService } from 'src/app/services/project.service';
import  tinycolor  from 'tinycolor2';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-new-participant',
  templateUrl: './new-participant.component.html',
  styleUrls: ['./new-participant.component.scss']
})
export class NewParticipantComponent {
  user$ = this.store.select(selectUser);

  constructor(
    private store: Store,
    private boardService: BoardService,
    private projectService: ProjectService,
    private router: Router,
    private cookieService: CookieService,
  ){}

  ngOnInit(){
    const currentUrl = window.location.href;
    const projectId = currentUrl.split('/')[4];
    const boardId = currentUrl.split('/')[5];
    console.log(projectId, boardId)
    this.user$.subscribe(
      (res) => {
        this.boardService.getOne(boardId).subscribe(
          (res1: any) => {
            const participant = res1[0]?.participants?.some((participant: any) => participant.email === res?.email);
            if(!participant){
              const color = tinycolor.random();
              if(res?.email){
                this.boardService.newMember(this.cookieService.get('taskhub-token'), boardId, res?.email, color.toHexString()).subscribe(
                  (res1) => {
                    this.projectService.newMember(projectId, res?.email).subscribe(
                      (res) => {
                        this.cookieService.set('taskhub-project', projectId, 365, '/');
                        this.cookieService.set('taskhub-board', boardId, 365, '/');
                        this.boardService.setDataChange();
                        this.router.navigate([`/dashboard/${projectId}/${boardId}/backlog`]);
                        window.location.reload();
                      }
                    )
                    
                  }
                );
              }
            }else{
              this.router.navigate([`/dashboard/${projectId}/${boardId}/backlog`]);
            }
          }
        )
      }
    )
  }
}
