import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';

@Component({
  selector: 'app-task-sprint',
  templateUrl: './task-sprint.component.html',
  styleUrls: ['./task-sprint.component.scss']
})
export class TaskSprintComponent {
  @Input() task: any;
  board$ = this.store.select(selectBoard);
  isDetail: boolean = false;
  currentBoard: any;
  newColor: string = '';

  constructor(
    private el: ElementRef,
    private router: Router,
    private socketIo: SocketIoService,
    private store: Store,
  ) {}

  ngOnInit(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    this.board$.subscribe(
      (res: any) => {
        this.currentBoard = res?.find((item: any) => item._id === boardId);
        this.currentBoard?.newColor?.forEach((item: any) => {
          if(item.priority == this.task.priority._id){
           this.newColor = item.color;
           console.log(this.newColor)
          }
        });
      } 
    )
  }

  toggleDetail($event: Event){
    this.isDetail = !this.isDetail;
    $event.stopPropagation();
  }

  openEdit($event: Event) {
    let currentUrl = window.location.href.split('/');
    currentUrl.splice(0, 3);
    const url = currentUrl.join('/') + '/' + this.task?._id
    if(this.task){
      this.router.navigate([url]);
      $event.stopPropagation();
      this.isDetail = false;
    }
  }

  deleteIssues($event: Event){
    if(this.task){
      this.socketIo.deleteTask(this.task.board._id, this.task._id);
      $event.stopPropagation();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isDetail = false;
    }
  }
}


