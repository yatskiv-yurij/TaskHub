import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent {
  currentPage: number = 0;
  countPage: number = 4;
  boardId: any;
  boardData: any;
  board$ = this.store.select(selectBoard);
  user$ = this.store.select(selectUser);
  participantsList: any[] = [];
  allParticipants: any[] = [];
  currentUser: any;
  isAdmin: boolean = false;
  search: string = ''

  constructor(
    private store: Store,
    private authService: AuthService,
    private boardService: BoardService,
    private cookieService: CookieService
  ){}

  ngOnInit(){
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.user$.subscribe(
      (res) => {
        this.currentUser = res?.email
      }
    )
    this.board$.subscribe(
      (res: any) => {
        const board = res?.filter((item: any) => item._id == this.boardId)
        if(board){
          this.boardData = board;
          if(board[0].project.participants[0] == this.currentUser){
            this.isAdmin = true;
          }
          board[0].participants?.forEach((item: any) => {
            this.authService.getUserInfo(item.email).subscribe(
              (res)=> {
                this.allParticipants.push(...res)
                this.participantsList.push(...res)
              }
            )
          })
          this.countPage = Math.ceil(this.participantsList.length / 7);
        }
      }
    )
  }

  searchUser(){
    if(this.search.length > 3){
      this.participantsList = this.allParticipants.filter(
        (item: any) =>{
          if(item.fullname.toLowerCase().includes(this.search.toLowerCase()) || item.email.toLowerCase().includes(this.search.toLowerCase())){
            return item;
          }
        }
      )
    }else{
      this.participantsList = this.allParticipants
    }
  }

  leaveBoard(participant: any){
    this.boardService.leaveBoard(this.boardId, participant.email, this.cookieService.get('taskhub-token')).subscribe(
      (res) => {
        const index = this.participantsList.indexOf(participant);
        this.participantsList.splice(index,1);
      }
    )
  }

  copyLink(){
    let currentUrl = window.location.href.split('/');
    currentUrl[6] = 'new-participant';
    const link = currentUrl.join('/');
    try {
      navigator.clipboard.writeText(link)
        .then(() => {
          console.log('Text copied successfully');
        })
        .catch(err => {
          console.error('Error copying text:', err);
        });
    } catch (err) {
      console.error('Error copying text:', err);
    }
  }

  counterArray(countPage: number): number[] {
    return Array.from({length: countPage}, (_, index) => index + 1);
  }

  setPage(page: number){
    this.currentPage = page;
  }

  back(){
    this.currentPage = this.currentPage - 1;
  }

  next(){
    this.currentPage = this.currentPage + 1;
  }

  
}
