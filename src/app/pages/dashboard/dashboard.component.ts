import { Component, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { selectTasks } from 'src/app/store/selectors/tasks.selectors';
import { createUser } from 'src/app/store/actions/user.actions';
import { loadTasks } from 'src/app/store/actions/task.actions';
import { AuthService } from 'src/app/services/auth.service';
import { BoardService } from 'src/app/services/board.service';
import { ProjectService } from 'src/app/services/project.service';
import { TasksService } from 'src/app/services/tasks.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { setAllBoard } from 'src/app/store/actions/board.actions';
import { SocketIoService } from 'src/app/services/socket-io.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  data$ = this.store.select(selectUser);
  board$ = this.store.select(selectBoard);
  tasks$ = this.store.select(selectTasks);

  userEmail = '';
  userImageUrl = '';
  projectData: any;
  boardData : any;
  currentProject: any;
  currentBoard: any;
  latestTasks: any;
  
  searchTitle: string = '';
  searchData: any;

  boardForm = new FormGroup({
    board: new FormControl('', [Validators.required, Validators.minLength(5)])
  })

  projectForm = new FormGroup({
    project: new FormControl('', [Validators.required, Validators.minLength(5)])
  })


  constructor(
    private el: ElementRef,
    private store: Store,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private boardService: BoardService,
    private projectService: ProjectService,
    private tasksService: TasksService,
    private socketIo: SocketIoService,
  ) {}


  ngOnInit() {
    if(this.cookieService.get('taskhub-token')){
      this.data$.subscribe((data) => {
        if(data){
          this.checkImage(data.image);
          this.userEmail = data.email;
        }else{
          this.authService.getMe(this.cookieService.get('taskhub-token')).subscribe(
            (res) => {
              const userData = {
                fullname: res.fullname,
                username: res.username || null,
                email: res.email,
                image: res.image || null,
                id: res._id
              }
              this.userEmail = res.email
              this.store.dispatch(createUser({ user:  userData}));
              this.checkImage(res.image);
            }
          )
        }
      });

      this.boardService.getDataChange().subscribe(
        (res) => {
          this.activatedRoute.params.subscribe(params => {
            const boardId = params['boardId'];
            if(boardId){
              this.boardService.isUserBoard(this.cookieService.get('taskhub-token'), boardId).subscribe(
                (res) => {
                  if(!res.isUser){
                    this.setAllData(this.cookieService.get('taskhub-token'));
                    this.boardService.getAll(this.cookieService.get('taskhub-token')).subscribe(
                      (res)=> {
                        this.router.navigate([`/dashboard/${res[0]?.project?._id}/${res[0]?._id}/backlog`]);
                      }
                    );
                  }
                  else{
                    this.socketIo.connBoard(boardId);
                    this.store.dispatch(loadTasks({boardId}));
                    this.setAllData(this.cookieService.get('taskhub-token'));
                    this.tasks$.subscribe((res) => {
                      this.cookieService.set('taskhub-user-tasks', JSON.stringify(res), 365, '/');
                    })
                  }
                }
              
            );
        }});
          
        }
      );
      
    }else{
      this.router.navigate(['/auth/log-in']);
    }

  }


  

  setAllData(token: any){
    this.boardService.getAll(token).subscribe(
      (res) => {
        this.store.dispatch(setAllBoard({ board:  res}));
        this.cookieService.set('taskhub-user-boards', JSON.stringify(res), 365 , '/');
        this.setProjects(res);
        this.setLatest();
      }
    )

    

  }

  setProjects(data:any){
    this.activatedRoute.params.subscribe(params => {
      const id_project = params['projectId'];
      const id_board = params['boardId'];
      this.cookieService.set('taskhub-project', id_project, 365, '/');
      this.cookieService.set('taskhub-board', id_board, 365, '/');
      const uniqueProjects: { [key: string]: { 'id_board': string, 'title_board': string, 'id_project': string, 'title_project': string, 'image_project': string} } = {};
      const uniqueBoard: { [key: string]: { } } = {};
      data.forEach((item: any) => {
        if(!uniqueProjects[item.project?._id] && item.project?._id != id_project){
          uniqueProjects[item.project?._id] = { 'id_board': item?._id, 'title_board': item?.title, 'id_project': item.project?._id, 'title_project': item.project?.title, 'image_project': item.project?.image};
        }
        if(item.project?._id === id_project){
          this.currentProject = item.project
        }
        if(!uniqueBoard[item._id] && item.project?._id == id_project && item?._id != id_board){
          uniqueBoard[item._id] = item
        }

        if(item?._id === id_board){
          this.currentBoard = item
        }
      });
      this.projectData = Object.values(uniqueProjects);
      this.boardData = Object.values(uniqueBoard);
    });
  }

  setLatest(){
    this.tasksService.getLatest(this.cookieService.get('taskhub-latest')).subscribe(
      (res) => {
        this.latestTasks = res;
      }
    )
  }


  createBoard(){
    const { board } = this.boardForm.value;
    this.boardService.createBoard(board, this.cookieService.get('taskhub-token'), this.currentProject._id).subscribe(
      (res) => {
        this.isNewBoard = false;
        this.router.navigate([`/dashboard/${this.currentProject._id}/${res._id}/backlog`]);
      }
    )
  }

  createProject(){
    const { project } = this.projectForm.value;
    this.projectService.createProject(project, this.cookieService.get('taskhub-token')).subscribe(
      (res) => {
        if(res){
          this.boardService.createBoard("Board", this.cookieService.get('taskhub-token'), res._id).subscribe(
            (res_board) => {
              this.router.navigate([`/dashboard/${res._id}/${res_board._id}/backlog`]);
              this.setAllData(this.cookieService.get('taskhub-token'));
              this.isNewProject = false;
            }
          )
        }
      }
    )
  }

  search(){
    if(this.searchTitle.length >= 5){
      this.tasksService.getSearch(this.searchTitle).subscribe(
        (res) => {
          this.searchData = res;
        }
      )
    }
  }

  checkImage(image: any) {
    if(image?.includes('http') || image?.includes('https')){
      this.userImageUrl = image
    }else{
      this.userImageUrl = 'http://localhost:3001'+image
    }
  }

  isDropdown: boolean = false;
  isUser: boolean = false;
  isYourWork: boolean = false;
  isProjects: boolean = false;
  isNewProject: boolean = false;
  isNewBoard: boolean = false;
  isNewTask: boolean = false;
  isSetProjects: boolean = false;
  isSetBoard: boolean = false;



  toggleDropdown() {
    this.isDropdown = !this.isDropdown;
  }

  toggleYourWork() {
    this.isYourWork = !this.isYourWork;
  }

  toggleProjects() {
    this.isProjects = !this.isProjects;
  }

  toggleNewProject() {
    this.isNewProject = !this.isNewProject;
  }

  toggleNewBoard() {
    this.isNewBoard = !this.isNewBoard;
  }

  toggleSetProject(){
    this.isSetProjects = !this.isSetProjects;
  }

  toggleSetBoard(){
    this.isSetBoard = !this.isSetBoard;
  }

  logOut() {
    this.isUser = false;
    this.cookieService.delete('taskhub-token', '/');
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isProjects = false;
      this.isDropdown = false;
      this.isYourWork = false; 
      this.isNewProject = false;
      this.isNewBoard = false;
      this.isSetProjects = false;
      this.isSetBoard = false;
      this.searchTitle = '';
    }
  }

  close(){
    this.isProjects = false;
    this.isDropdown = false;
    this.isYourWork = false; 
    this.isNewProject = false;
    this.isNewBoard = false;
    this.isSetProjects = false;
    this.isSetBoard = false;
  }

  openNewTask() {
    this.isNewTask = true;
  }

  closeNewTask() {
    this.isNewTask = false;
  }
  
}
