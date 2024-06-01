import { Component, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
import { BoardService } from 'src/app/services/board.service';
import { TasksService } from 'src/app/services/tasks.service';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { SocketIoService } from 'src/app/services/socket-io.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent {
  user$ = this.store.select(selectUser);
  @Output() closeEdit = new EventEmitter<void>();

  title: string = ''
  allProject: any;
  currentProject: any;
  allBoard: any;
  currentBoard: any;
  allField: any;
  currentField: any
  allAssegnee: any;
  currentAssegnee: any;
  allPriority: any;
  currentPriority: any;




  constructor(
    private el: ElementRef,
    private authService: AuthService,
    private projectService: ProjectService,
    private boardService: BoardService,
    private taskService: TasksService,
    private cookieService: CookieService,
    private store: Store,
    private socketService: SocketIoService
    ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.setAllData();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }


  setAllData(){
    const token = this.cookieService.get('taskhub-token');
    this.projectService.getAll(token).subscribe(
      (res) => {
        this.currentProject = res[0];
        this.allProject = res.slice(1);
        
        this.boardService.getAllForProject(token, this.currentProject._id).subscribe(
          (res) => {
            this.currentBoard = res[0];
            this.allBoard = res.slice(1);
            this.currentField = this.currentBoard.fields[0];
            this.allField = this.currentBoard.fields.slice(1);
            const assegnee = this.currentBoard.participants.map((user: any) => user.email)
            this.authService.getUserInfo(assegnee).subscribe(
              (res: any) => {
                const data = res.map((user: any) => {
                  user.image = this.checkImage(user.image)
                  return user
                })
                this.currentAssegnee = data[0];
                this.allAssegnee = data.slice(1);

                this.taskService.getPriority().subscribe(
                  (res) => {
                    const data = res.map((priority: any) => {
                      priority.image = this.checkImage(priority.image)
                      return priority
                    })
                    this.currentPriority = data[1];
                    this.allPriority = data.slice(0, 1).concat(data.slice(2))
                  }
                )
              }
            )
          }
        )
      }
    )
  }


  setProject(project: any){
    const token = this.cookieService.get('taskhub-token');
    this.allProject?.push(this.currentProject);
    this.currentProject = this.allProject[project];
    this.allProject.splice(project, 1);
    this.boardService.getAllForProject(token, this.currentProject._id).subscribe(
      (res) => {
        this.currentBoard = res[0];
        this.allBoard = res.slice(1);
        this.currentField = this.currentBoard.fields[0];
        this.allField = this.currentBoard.fields.slice(1);
        const assegnee = this.currentBoard.participants.map((user: any) => user.email)
        this.authService.getUserInfo(assegnee).subscribe(
          (res: any) => {
            const data = res.map((user: any) => {
              user.image = this.checkImage(user.image)
              return user
            })
            this.currentAssegnee = data[0];
            this.allAssegnee = data.slice(1);

            this.taskService.getPriority().subscribe(
              (res) => {
                const data = res.map((priority: any) => {
                  priority.image = this.checkImage(priority.image)
                  return priority
                })
                this.currentPriority = data[2];
                this.allPriority = data.slice(0, 2).concat(data.slice(3))
              }
            )
          }
        )
      }
    )  
    this.isProject = false;
  }

  setBoard(board: any){
    this.allBoard?.push(this.currentBoard);
    this.currentBoard = this.allBoard[board];
    this.allBoard.splice(board, 1);
    this.currentField = this.currentBoard.fields[0];
    this.allField = this.currentBoard.fields.slice(1);
    const assegnee = this.currentBoard.participants.map((user: any) => user.email)
    this.authService.getUserInfo(assegnee).subscribe(
      (res: any) => {
        const data = res.map((user: any) => {
          user.image = this.checkImage(user.image)
          return user
        })
        this.currentAssegnee = data[0];
        this.allAssegnee = data.slice(1);

        this.taskService.getPriority().subscribe(
          (res) => {
            const data = res.map((priority: any) => {
              priority.image = this.checkImage(priority.image)
              return priority
            })
            this.currentPriority = data[2];
            this.allPriority = data.slice(0, 2).concat(data.slice(3))
          }
        )
      }
    )
    this.isBoard = false;
  }

  setStatus(status: any){
    this.allField?.push(this.currentField);
    this.currentField = this.allField[status];
    this.allField.splice(status, 1);
    this.isStatus = false;
    console.log(this.title)
  }

  setAssegnee(assegnee: any){
    this.allAssegnee?.push(this.currentAssegnee);
    this.currentAssegnee = this.allAssegnee[assegnee];
    this.allAssegnee.splice(assegnee, 1);
    this.isAssegnee = false;
  }

  setPriority(priority: any){
    this.allPriority?.push(this.currentPriority);
    this.currentPriority = this.allPriority[priority];
    this.allPriority.splice(priority, 1);
    this.isPriority = false;
  }


  saveIssue(){
    this.user$.subscribe((user:any) => {
      console.log(user)
      const issue = {
        title: this.title,
        description: this.html,
        field: this.currentField.title,
        priority: this.currentPriority._id,
        performer: this.currentAssegnee._id,
        author: user.id,
        board: this.currentBoard._id,
      }
      this.socketService.connBoard(this.currentBoard._id);
      this.socketService.createTask(this.currentBoard._id, issue);
    });
    this.editor.destroy();
    this.closeEdit.emit();
  }


  checkImage(image: any) {
    if(image.includes('http') || image.includes('https')){
      return image
    }else{
      return 'http://localhost:3001'+image
    }
  }

  isStatus: boolean = false;
  isPriority: boolean = false;
  isAssegnee: boolean = false;
  isProject: boolean = false;
  isBoard: boolean = false;

  editor!: Editor;
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  colorPresets = ['red', '#FF0000', 'rgb(255, 0, 0)'];
  html = '';

  


  onCloseModal() {
    this.closeEdit.emit();
  }

  toggleStatus(){
    this.isStatus = !this.isStatus;
    this.isPriority = false;
    this.isAssegnee = false;
    this.isProject = false;
    this.isBoard = false;
  }

  togglePriority(){
    this.isStatus = false;
    this.isPriority = !this.isPriority;
    this.isAssegnee = false;
    this.isProject = false;
    this.isBoard = false;
  }

  toggleProject(){
    this.isStatus = false;
    this.isPriority = false;
    this.isAssegnee = false;
    this.isProject = !this.isProject;
    this.isBoard = false;
  }

  toggleBoard(){
    this.isStatus = false;
    this.isPriority = false;
    this.isAssegnee = false;
    this.isProject = false;
    this.isBoard = !this.isBoard
  }

  toggleAssegnee(){
    this.isStatus = false;
    this.isPriority = false;
    this.isAssegnee = !this.isAssegnee;
    this.isProject = false;
    this.isBoard = false;
  }


  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isStatus = false;
      this.isPriority = false;
      this.isAssegnee = false;
      this.isProject = false;
      this.isBoard = false;
    }
  }
}
