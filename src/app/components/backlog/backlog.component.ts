import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { selectTasks } from 'src/app/store/selectors/tasks.selectors';
import { SprintService } from 'src/app/services/sprint.service';
import { Socket } from 'ngx-socket-io';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { loadTasks } from 'src/app/store/actions/task.actions';
import { FilterDataService } from 'src/app/services/filter-data.service';
import { BoardService } from 'src/app/services/board.service';

@Component({
  selector: 'app-backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogComponent {
  board$ = this.store.select(selectBoard);
  user$ = this.store.select(selectUser);
  tasks$ = this.store.select(selectTasks);
  board: any;
  headerInfo: any;
  sprintData: any;
  sprint: any[] = [];
  backlog: any[] = [];
  sprintList: any;
  newIssuesTitle: string = ''
  allTasks: any;

  isLabelFilter = false;
  isPriorityFilter = false;
  isExecutantFilter = false;

  constructor(
    private el: ElementRef, 
    private store: Store,
    private router: Router,
    private sprintService: SprintService,
    private socket: Socket,
    private socketService: SocketIoService,
    private filterService: FilterDataService,
    private boardService: BoardService
  ) {
    
  }

  ngOnInit(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    this.setHeader();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setHeader();
    });

    this.store.pipe(
      select(selectTasks) 
    ).subscribe(tasks => {
      this.allTasks = tasks;
      this.setLists(tasks)      
    });

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
      this.store.dispatch(loadTasks({boardId}));
    });

    this.socket.fromEvent('taskUpdated').subscribe(() => {
      this.store.dispatch(loadTasks({boardId}));
    });

    this.socket.fromEvent('taskDeleted').subscribe(() => {
      this.store.dispatch(loadTasks({boardId}));
    });

  }

  
  setLists(data: any){
    this.backlog = [];
    this.sprint = [];
    data.forEach((task: any) => {
      if(task?.status != 'resolved'){
        if(task?.sprint){
          this.sprint.push(task);
        }else{
          this.backlog.push(task);
        }
      }
    })
  }

  

  setHeader(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    if(boardId){
      this.sprintService.getAll(boardId).subscribe(
        (res: any) => {
          if(res.length>0){
            res?.forEach((sprint:any) => {
              if(sprint.status == 'start' || sprint.status == 'create'){
                this.sprintData = sprint;
              }
            })
          }else{
            this.sprintData = null;
          }
        }   
      )
    }
    
    this.board$.subscribe(
      (res:any) => {
        const data = res?.find((item: any) => item._id === boardId);
        if(data){
          Promise.resolve(data).then((board: any) => {
            this.headerInfo ={
              route: 'Project / '+ board?.project?.title + ' / ' + board?.title,
              title: 'Backlog',
            }
          })
        }
      }
    )
  }

  handleCreateSprint(){
    this.ngOnInit();
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
        this.socketService.updateTask(boardId, movedItem._id, {sprint: null})
      }else{
        this.socketService.updateTask(boardId, movedItem._id, {sprint: this.sprintData})
      }
    }

    const tasks: any[] = [];
    this.sprint.forEach((item: any) => {
      tasks.push(item._id);
    })
    this.sprintService.updateSprint(this.sprintData._id, {tasks: tasks}).subscribe(
      (res)=> {
        
      }
    )

    
    
  }

  newIssues(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    this.user$.subscribe((user:any) => {
      const issue = {
        title: this.newIssuesTitle,
        field: 'to do',
        priority: '658ed67633da2172233f8331',
        performer: user.id,
        author: user.id,
        board: boardId,
      }
      this.socketService.createTask(boardId, issue);
      this.boardService.setDataChange();
      this.isNewIssues = false;
      this.newIssuesTitle = ''
      this.filterService.setDataChange();
    });
  }

  deleteSprint(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    
    this.sprintService.deleteSprint(this.sprintData._id).subscribe(
      (res) => {
        this.sprintService.setDataChange();
        this.sprintData = null;
        this.sprint.map(
          (item) => {
            this.socketService.updateTask(boardId, item._id, {sprint: null});
            this.backlog.push(item)
          }
        )
        this.sprint = [];
      }
    )
  }

  startSprint() {
    this.sprintService.updateSprint(this.sprintData._id, {status: 'start'}).subscribe(
      (res) => {
        this.sprintData = res
      }
    )
  }

  completeSprint() {
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    // this.allTasks.forEach(
    //   (item: any) => {
    //     if(item.field == 'done'){

    //     }
    //   }
    // )
    this.sprintService.updateSprint(this.sprintData._id, {status: 'complete'}).subscribe(
      (res) => {
        this.sprintData = null
        this.ngOnInit();
        this.sprint.map(
          (issue) => {
            if(issue.status != 'resolved'){
              if(issue.field == 'done'){
                this.socketService.updateTask(boardId, issue._id, {status: 'resolved'})
              }else{
                this.socketService.updateTask(boardId, issue._id, {sprint: null})
              }
            }
            
          }
        )
      }
    )
  }




  

  isLabel: boolean = false;
  isPriority: boolean = false;
  isExecutant: boolean = false;
  isNewIssues: boolean = false;
  isDetail: boolean = false;
  isNewSprint: boolean = false;


  toggleNewIssues() {
    this.isNewIssues = !this.isNewIssues;
    this.isDetail = false;
  }

  toggleDetail(){
    this.isNewIssues = false;
    this.isDetail = !this.isDetail;
  }

  createNewSprint() {
    this.isNewSprint = true;
  }

  closeNewSprint() {
    this.isNewSprint = false;
  }


  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown') && !targetElement.classList.contains('inside')) {
      this.isNewIssues = false;
      this.isDetail = false;
    }
  }

}
