import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { DateFormatPipe } from 'src/app/pipes/date-format.pipe';

@Component({
  selector: 'app-task-issues',
  templateUrl: './task-issues.component.html',
  styleUrls: ['./task-issues.component.scss'],
  providers: [DateFormatPipe]
})
export class TaskIssuesComponent {
  @Input() task: any;
  isDetail: boolean = false;

  constructor(
    private el: ElementRef,
    private store: Store,
    private router: Router,
    private socketIo: SocketIoService
  ) {}

  toggleDetail($event: Event){
    this.isDetail = !this.isDetail;
    $event.stopPropagation();
  }

  openEdit($event: Event) {
    let currentUrl = window.location.href.split('/');
    currentUrl.splice(0, 3);
    const url= currentUrl.join('/')
    if(this.task){
      this.router.navigate([url+'/'+ this.task?._id]);
      console.log([url+'/'+ this.task?._id])
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
