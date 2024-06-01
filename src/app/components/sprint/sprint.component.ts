import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { selectTasks } from 'src/app/store/selectors/tasks.selectors';
import { Socket } from 'ngx-socket-io';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { loadTasks } from 'src/app/store/actions/task.actions';
import { SprintService } from 'src/app/services/sprint.service';
import { FilterDataService } from 'src/app/services/filter-data.service';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.scss']
})
export class SprintComponent {
  
  board$ = this.store.select(selectBoard);
  board: any;
  headerInfo: any;
  boardId: any;
  execution: any = [];
  progress: any = [];
  done: any = [];
  sprintData: any;
  allTasks: any;


  constructor(
    private store: Store,
    private router: Router,
    private socket: Socket,
    private socketService: SocketIoService,
    private sprintService: SprintService,
    private filterService: FilterDataService
  ) {}

  ngOnInit(){
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.setHeader();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setHeader();
    });

    this.sprintService.getAll(this.boardId).subscribe(
      (res: any) => {
        if(res.length>0){
          res?.forEach((sprint:any) => {
            if(sprint.status == 'start'){
              this.sprintData = sprint;          
            }
          })
        }else{
          this.sprintData = null;
        }

        this.store.pipe(
          select(selectTasks) 
        ).subscribe(tasks => {
          this.allTasks = tasks;
          this.setLists(tasks) 
        });
      }   
    )

    this.filterService.getLabels().subscribe(
      (res) => {
        this.filterService.getPriority().subscribe(
          (res) => {
            this.filterService.getExecutant().subscribe(
              (res) => {
                this.filterService.filterData(this.allTasks).subscribe(
                  (res) => {
                    this.setLists(res)
                  }
                );
              }
            )
          }
        )
      }
    )

    this.socket.fromEvent('taskAdded').subscribe(() => {
      this.store.dispatch(loadTasks({boardId: this.boardId}));
    });

    this.socket.fromEvent('taskUpdated').subscribe(() => {
      this.store.dispatch(loadTasks({boardId: this.boardId}));
    });

    this.socket.fromEvent('taskDeleted').subscribe(() => {
      this.store.dispatch(loadTasks({boardId: this.boardId}));
    });
    
  }

  setLists(data: any){
    this.execution = [];
    this.progress = [];
    this.done = [];
    data?.forEach((task: any) => {
      if(task?.status != 'resolved'){
        if(task?.sprint == this.sprintData?._id){
          if(task?.field == 'to do'){
            this.execution.push(task)
          }else if(task?.field == 'progress'){
            this.progress.push(task)
          }else if(task?.field == 'done'){
            this.done.push(task)
          }
        }
      }
      
    })
  }

  setHeader(){
    
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    this.board$.subscribe(
      (res:any) => {
        const data = res?.find((item: any) => item._id === boardId);
        if(data){
          Promise.resolve(data).then((board: any) => {
            this.board = board;
            this.headerInfo ={
              route: 'Project / '+ board?.project.title + ' / ' + board?.title,
              title: 'Active sprint',
            }
          })
        } 
      }
    )
  }

  drop(event: CdkDragDrop<any[]>) {
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    const movedItem = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      if(event.container.id.split('-')[3]  === '0'){
        this.socketService.updateTask(boardId, movedItem._id, {field: 'to do'})
      }else if(event.container.id.split('-')[3]  === '1'){
        this.socketService.updateTask(boardId, movedItem._id, {field: 'progress'})
      }else if(event.container.id.split('-')[3]  === '2'){
        this.socketService.updateTask(boardId, movedItem._id, {field: 'done'})
      }
    }
    
  }
}
