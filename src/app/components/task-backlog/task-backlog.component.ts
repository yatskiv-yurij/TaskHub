import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SocketIoService } from 'src/app/services/socket-io.service';

@Component({
  selector: 'app-task-backlog',
  templateUrl: './task-backlog.component.html',
  styleUrls: ['./task-backlog.component.scss']
})
export class TaskBacklogComponent {
  @Input() task: any;

  constructor(
    private el: ElementRef,
    private router: Router,
    private socketIo: SocketIoService
  ) {}

  isDetail: boolean = false;

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
