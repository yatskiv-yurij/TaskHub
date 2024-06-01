import { Component, ElementRef, HostListener} from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
//import { trigger, state, style, transition, animate } from '@angular/animations';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { ProjectService } from 'src/app/services/project.service';
import { BoardService } from 'src/app/services/board.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss'],
  // animations: [
  //   trigger('toggleAnimation', [
  //       state('on', style({
  //           transform: 'translateX(30px)'
  //       })),
  //       state('off', style({
  //           transform: 'translateX(0)'
  //       })),
  //       transition('on <=> off', animate('0.3s ease'))
  //   ])]
})
export class ProjectSettingsComponent {
  board$ = this.store.select(selectBoard);
  boardData: any;
  projectData: any;
  boardId: any;
  projectId: any;
  imageSrc: any;
  projectTitle: string = '';
  allParticipants: any[] = [];
  currentLead: any;
  allBoards: any;

  constructor(
    private el: ElementRef,
    private store: Store,
    private projectService: ProjectService,
    private boardService: BoardService,
    private cookieService: CookieService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    
    this.editor = new Editor();

    this.board$.subscribe(
      (res: any) => {
        const board = res?.find((item: any) => item._id == this.boardId)
        if(board) {
          this.boardData = board;
          this.projectId = this.boardData.project._id;
          this.projectData = this.boardData.project;
          this.projectTitle = this.projectData.title;
          this.imageSrc = this.projectData.image;
          this.description = this.projectData.description;
          if(this.description.length < 1){
            this.changeDescription = true;
          }
        }

        this.allBoards = res?.filter((item: any) => item.project?._id == this.projectId);
        this.allBoards?.forEach((item: any) => {
          item.participants?.forEach((participant: any)=> {
            this.authService.getUserInfo(participant.email).subscribe(
            (res) => {
              const isInArray = this.allParticipants.some(obj => obj._id == res[0]._id);
              
              if(res[0].email == this.projectData.participants[0]){
                this.currentLead = res[0];
              }else{
                if(!isInArray){
                  this.allParticipants.push(...res);
                }
              }
            })
          })
        })
      }
    )
  }

  setProjectTitle(){
    this.projectService.updateProject(this.projectId, {title: this.projectTitle}).subscribe(
      (res) => {
        this.boardService.setDataChange();
      }
    )
  }

  setNewImage(event: any){
    if (event.target && event.target.files) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.projectService.saveFile(formData).subscribe(
        (res) => {
          this.projectService.updateProject(this.projectId, {image: res}).subscribe(
            (res) => {
              this.boardService.setDataChange();
            }
          )
        }
      );
    }
  }

  setDescription(){
    this.projectService.updateProject(this.projectId, {description: this.description}).subscribe(
      (res) => {
        this.changeDescription = false;
      }
    )
  }

  setLead(lead: any, index: any){
    this.projectService.updateProject(this.projectId, {participants: lead.email}).subscribe(
      (res) => {
        this.allParticipants.splice(index, 1);
        this.allParticipants.push(this.currentLead)
        this.currentLead = lead;
        
      }
    )
  }

  deleteProject(){
    this.allBoards.forEach((board: any) => {
      this.boardService.deleteBoard(this.cookieService.get('taskhub-token'), board._id).subscribe(
        (res) => {
          
      })
    })

    this.projectService.deleteProject(this.projectData._id).subscribe(
      (res) => {
        this.boardService.setDataChange();
      }
    )
  }

  isAssegnee: boolean = false;
  isChecked1 = true; isChecked2 = true; isChecked3 = true; isChecked4 = true; isChecked5 = true
  changeDescription: boolean = false;

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
  description = '';

  
  toggleDescription(){
    this.changeDescription = !this.changeDescription;
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  toggleAssegnee(){
    this.isAssegnee = !this.isAssegnee;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isAssegnee = false;
    }
  }

  toggleSwitch(number: number){
    switch(number){
      case 1: {
        this.isChecked1 = !this.isChecked1
        break;
      }
      case 2: {
        this.isChecked2 = !this.isChecked2
        break;
      }
      case 3: {
        this.isChecked3 = !this.isChecked3
        break;
      }
      case 4: {
        this.isChecked4 = !this.isChecked4
        break;
      }
      case 5: {
        this.isChecked5 = !this.isChecked5
        break;
      }
    }
  }

}
