import { Component, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { BoardService } from 'src/app/services/board.service';
import { CookieService } from 'ngx-cookie-service';
import { ProjectService } from 'src/app/services/project.service';
import { TasksService } from 'src/app/services/tasks.service';
import { selectProject } from 'src/app/store/selectors/project.selectors';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-board-settings',
  templateUrl: './board-settings.component.html',
  styleUrls: ['./board-settings.component.scss']
})
export class BoardSettingsComponent {
  colorForm!: FormGroup;
  board$ = this.store.select(selectBoard);
  project$ = this.store.select(selectProject);
  currentBoard: any;
  boardName: string = ''
  boardId: any;
  projectId: any;
  currentProject: any;
  allProject: any[] = [];
  currentMethod: any;
  allPriority: any;
  currentColor: any[] = [];


  constructor(
    private el: ElementRef,
    private store: Store,
    private boardService: BoardService,
    private cookieService: CookieService,
    private projectService: ProjectService,
    private tasksService: TasksService,
    private router: Router
  ) {}

  ngOnInit(){
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.projectId = currentUrl.split('/')[4]

    this.colorForm = new FormGroup({});

    this.board$.subscribe(
      (res: any) => {
        this.currentBoard = res?.find((item: any) => item._id === this.boardId);
        this.boardName = this.currentBoard?.title;
        if(this.currentBoard?.setColor == 'none'){
          this.currentMethod = 'none'
        }else{
          this.currentMethod = 'priority'
        }

        this.tasksService.getPriority().subscribe(
          (res: any) => { 
            this.currentColor = [];   
            this.allPriority = res
            let found = false;
            res.forEach((item: any) => {
              let data = null;
              if(this.currentBoard?.newColor.length>0){
                this.currentBoard?.newColor.forEach(
                  (priority: any)=> {
                    if(item._id === priority.priority){
                      data = {
                        priority: item?._id,
                        color: priority?.color
                      }
                      found = true;
                    }else{
                      if(!found){
                        
                        data = {
                          priority: item?._id,
                          color: item?.color
                        }
                      }
                    } 
                })
              }else{
                data = {
                  priority: item?._id,
                  color: item?.color
                }
              }
              if(data){
                this.currentColor.push(data);
              }
            })
          }
        )
      } 
    )

    this.projectService.getAll(this.cookieService.get('taskhub-token')).subscribe(
      (res: any) => {
        res.forEach((item: any) =>  {
          if(item._id != this.projectId){
            this.allProject.push(item);
          }
        });
        this.currentProject = res.find((item: any) =>  item._id == this.projectId);
        
      }
    )
  }

  setBoardTitle(){
    if(this.currentBoard) {
      this.boardService.updateBoard(this.cookieService.get('taskhub-token'), this.boardId, {title: this.boardName}).subscribe(
        (res) => {
          this.boardService.setDataChange();
          this.currentBoard = { ...this.currentBoard };
          this.currentBoard.title = this.boardName;
        }
      )
    }
  }

  setProject(project:any, index: any){
    this.boardService.updateBoard(this.cookieService.get('taskhub-token'), this.boardId, {project: project._id}).subscribe(
      (res) => {
        this.boardService.setDataChange();
        this.allProject.splice(index,1);
        this.allProject.push(this.currentProject);
        this.currentProject = project;
        this.router.navigate([`/dashboard/${project._id}/${this.boardId}/board-settings`]);
      }
    );
  }

  setMethod(method: any){
    this.boardService.updateBoard(this.cookieService.get('taskhub-token'), this.boardId, {setColor: method}).subscribe(
      (res) => {
        this.currentMethod = method;
        this.boardService.setDataChange()
      }
    )
  }

  onChangeColor(){
    this.boardService.updateBoard(this.cookieService.get('taskhub-token'), this.boardId, {newColor: this.currentColor}).subscribe(
      (res) => {
        this.boardService.setDataChange();
      }
    );
  }


  deleteBoard(){
    this.boardService.deleteBoard(this.cookieService.get('taskhub-token'), this.boardId).subscribe(
      (res) => {
        this.boardService.setDataChange();
      }
    )
  }



  isProject: boolean = false;
  isColor: boolean = false;
  isNewColumn: boolean = false;
  isStatus: boolean = false;

  

  toggleProject(){
    this.isProject = !this.isProject;
    this.isColor = false;
    this.isNewColumn = false;
    this.isStatus = false;
  }

  toggleColor(){
    this.isProject = false;
    this.isColor = !this.isColor;
    this.isNewColumn = false;
    this.isStatus = false;
  }
  
  toggleNewColumn(){
    this.isProject = false;
    this.isColor = false;
    this.isNewColumn = !this.isNewColumn;
    this.isStatus = false;
  }

  toggleStatus(){
    this.isProject = false;
    this.isColor = false;
    this.isStatus = !this.isStatus;
  }


  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isColor = false;
      this.isProject = false;
      this.isNewColumn = false;
      this.isStatus = false;
    }
  }
}
