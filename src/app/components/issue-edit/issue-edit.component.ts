import { Component, ElementRef, HostListener,ViewChild } from '@angular/core';
import { Editor, Toolbar} from 'ngx-editor';
import { Router } from '@angular/router';
import { TasksService } from 'src/app/services/tasks.service';
import { AuthService } from 'src/app/services/auth.service';
import { SprintService } from 'src/app/services/sprint.service';
import { SocketIoService } from 'src/app/services/socket-io.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { BoardService } from 'src/app/services/board.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { Socket } from 'ngx-socket-io';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-issue-edit',
  templateUrl: './issue-edit.component.html',
  styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent{
  @ViewChild('fileInput') fileInput!: ElementRef;
  board$ = this.store.select(selectBoard)
  user$ = this.store.select(selectUser);
  userId: any;
  startDate: string = ''
  updateDate: string = ''
  task: any
  taskId: any;
  boardId: any;
  allField: any;
  currentField: any;
  allPriority: any;
  currentPriority: any;
  allExecutant: any[] = [];
  currentExecutant: any;
  allLabel: any[] = [];
  currentLabel: any;
  allSprint: any;
  currentSprint: any;
  isDataSprint: boolean = false;
  allAttachment: any;
  allComments: any[] = [];

  storyPoint = 0;
  estimate = 0;
  taskTitle = '';

  labelForm = new FormGroup({
    label: new FormControl('', [Validators.required, Validators.minLength(3)])
  })
  

  constructor(
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TasksService,
    private authService: AuthService,
    private boardService: BoardService,
    private sprintService: SprintService,
    private socketService: SocketIoService,
    private cookieService: CookieService,
    private store: Store,
    private socket: Socket,
  ) {}


  ngOnInit(): void {
    
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.editorDescriprion = new Editor();
    this.editorComment = new Editor();
    this.setTaskData();
    this.taskId = this.route.snapshot.params['taskId'];

    const cookieData = this.cookieService.get('taskhub-latest');
    let latest = [];
    
    try {
      latest = JSON.parse(cookieData);
      if(latest.length >= 5){
        latest.splice(latest.length-1, 1);
        latest.unshift(`${this.taskId}`);
        this.cookieService.set('taskhub-latest', JSON.stringify(latest))
        this.boardService.setDataChange()
      }else{
        latest.unshift(`${this.taskId}`);
        this.cookieService.set('taskhub-latest', JSON.stringify(latest))
        this.boardService.setDataChange()
      }
    } catch (error) {
      latest.unshift(`${this.taskId}`);
      this.cookieService.set('taskhub-latest', JSON.stringify(latest))
      this.boardService.setDataChange()
    }
   

    this.taskService.getOne(this.taskId).subscribe(
      
      (res) => {
        this.task = {...res[0]};
        this.socketService.connectTask(this.task?._id);
        this.storyPoint = this.task?.storyPoint;
        this.estimate = this.task?.approximate;
        this.taskTitle = this.task?.title;
        this.description = this.task?.description;
        if(!this.description){
          this.changeDescription = true;
        }

        this.currentField = this.allField.find((item: any) => item.title == this.task.field)
        this.allField = this.allField.filter((item: any) => item.title != this.task.field)

        this.taskService.getPriority().subscribe(
          (res_pr) => {
            this.allPriority = res_pr.filter((item: any) => item._id != this.task.priority)
            this.currentPriority = res_pr.find((item: any) => item._id == this.task.priority)
          }
        )

        this.board$.subscribe(
          (res_br: any) => {
            const board = res_br?.find((item:any)=> item._id == this.boardId)
            board?.participants.forEach(
              (item:any) => {
                this.authService.getUserInfo(item.email).subscribe(
                  (res:any)=> {
                    if(res?.[0]._id == this.task.performer){
                      this.currentExecutant = res[0];
                    }else{
                      this.allExecutant.push(res[0]);
                    }
                  }
                )
              }
            )
          }
        )

        this.boardService.getLabel(this.boardId).subscribe(
          (res_lb: any) => {
            this.allLabel = res_lb.filter((item: any) => item._id != this.task.label)
            this.currentLabel = res_lb.find((item: any) => item._id == this.task.label)
          }
        )

        this.sprintService.getAll(this.boardId).subscribe(
          (res: any) => {
            res.forEach((item: any) => {
              if(item.status == 'create' || item.status == 'start'){
                this.isDataSprint = true;
                if(this.task?.sprint){
                  this.allSprint = null;
                  this.currentSprint = item;
                }else{
                  this.allSprint = item;
                  this.currentSprint = null;
                }
              }
            })
          }
        )
      }
    )

   this.setAttachment();

    this.setComments();
    this.socket.fromEvent('commentAdded').subscribe(() => {
      this.setComments();
    });
    this.socket.fromEvent('commentDeleted').subscribe(() => {
      this.setComments();
    });

    this.user$.subscribe(
      (res: any) => {
        this.userId = res?.id
      }
    )
  }

  setDate(date: any){
    if(date)
      return format(date, 'dd MMMM yyyy HH:mm');
    else
      return ''
  }

  minDate(date: any){
    if(date)
      return format(date, 'dd.MM HH:mm');
    else
      return ''
  }

  setAttachment(){
    this.taskService.getAttachment(this.taskId).subscribe(
      (res) => {
        this.allAttachment = res;
      }
    )
  }

  deleteAttachment(index: any){
    const id = this.allAttachment[index]._id;
    const file = this.allAttachment[index].link;
    this.taskService.deleteAttachment(id).subscribe(
      (res) => {
        const files = [file];
        this.taskService.deleteFile(files).subscribe(
          (res) => {
            this.allAttachment.splice(index, 1);
          }
        )      
      }
    )
    
  }

  setComments(){
    this.taskService.getComments(this.taskId).subscribe(
      (res: any) => {
        this.allComments = res;
      }
    )
  }


  setTaskData(){
    this.allField = [
      {title: 'to do', status:'To execution' },
      {title: 'progress', status:'In progress' },
      {title: 'done', status:'Done' }
    ]
  }

  createLabel(){
    const { label } = this.labelForm.value;
    this.boardService.createLabel(this.boardId, label).subscribe(
      (res) => {
        this.allLabel.push(this.currentLabel[0]);
        this.currentLabel = [res];
        this.isNewLabel = false;
        this.isLabel = false;
        this.socketService.updateTask(this.boardId, this.task._id, {label: this.currentLabel._id})
      }
    )
  }

  createComment(){
    const data = {
      tasks: this.taskId,
      data: this.comment,
      user: this.userId
    }
    this.socketService.createComment(this.taskId, data);
    this.comment = ''
    
  }

  deleteComment(commentId: any){
    this.socketService.deleteComment(this.taskId, commentId)
  }


  selectFile() {
    this.fileInput.nativeElement.click();
  }

  saveFile(event: any) {
    if (event.target && event.target.files) {
      const file = event.target.files[0];
      const name = file.name.split('.')[0];
      const extension = file.name.split('.')[1]
      const formData = new FormData();
      formData.append('file', file);
      this.taskService.saveFile(formData).subscribe(
        (res) => {
          this.taskService.createAttachment(this.taskId, res, name, extension).subscribe(
            (res) => {
              this.setAttachment();
            }
          );
        }
      );
    }
  }


  setField(index: any){
    this.allField.push(this.currentField);
    this.currentField = this.allField[index];
    this.allField.splice(index,1);
    this.isField = false;
    this.socketService.updateTask(this.boardId, this.task._id, {field: this.currentField.title})
  }

  setPriority(index: any){
    this.allPriority.push(this.currentPriority);
    this.currentPriority = this.allPriority[index];
    this.allPriority.splice(index,1);
    this.isPriority = false;
    this.socketService.updateTask(this.boardId, this.task._id, {priority: this.currentPriority._id})
  }

  setExecutant(index: any){
    this.allExecutant.push(this.currentExecutant);
    this.currentExecutant = this.allExecutant[index];
    this.allExecutant.splice(index,1);
    this.isExecutant = false;
    this.socketService.updateTask(this.boardId, this.task._id, {performer: this.currentExecutant._id})
  }

  setLabel(index: any){
    this.allLabel.push(this.currentLabel);
    this.currentLabel = this.allLabel[index];
    this.allLabel.splice(index,1);
    this.isLabel = false;
    this.socketService.updateTask(this.boardId, this.task._id, {label: this.currentLabel._id})
  }

  setSprint(){
    const sprint = this.allSprint;
    this.allSprint = this.currentSprint;
    this.currentSprint = sprint;
    this.isSprint = false;
    this.socketService.updateTask(this.boardId, this.task._id, {sprint: this.currentSprint? this.currentSprint?._id : null})
  }

  setStoryPoint(){
    this.socketService.updateTask(this.boardId, this.task._id, {storyPoint: this.storyPoint})
  }

  setEstimate(){
    this.socketService.updateTask(this.boardId, this.task._id, {approximate: this.estimate})
  }

  setTitle(){
    this.socketService.updateTask(this.boardId, this.task._id, {title: this.taskTitle})
  }

  setDescription(){
    console.log(this.description)
    this.socketService.updateTask(this.boardId, this.task._id, {description: this.description})
  }

 


  editorDescriprion!: Editor;
  editorComment!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  colorPresets = ['red', '#FF0000', 'rgb(255, 0, 0)'];
  description = '';
  comment = ''

  changeTitle: boolean = false;
  changeDescription: boolean = false;
  isLabel: boolean = false;
  isField: boolean = false;
  isPriority: boolean = false;
  isExecutant: boolean = false;
  isAssegnee: boolean = false;
  isSprint: boolean = false;
  isNewLabel: boolean = false;

  

  toggleTitle(){
    this.changeTitle = !this.changeTitle;
    this.changeDescription = false;
  }

  toggleDescription(){
    this.changeTitle = false;
    this.changeDescription = !this.changeDescription;
  }

  toggleLabel(){
    this.isLabel = !this.isLabel;
    this.isField = false;
    this.isPriority = false;
    this.isExecutant = false;
    this.isAssegnee = false;
    this.isSprint = false;
    this.isNewLabel = false;
  }

  toggleField(){
    this.isLabel = false;
    this.isField = !this.isField;
    this.isPriority = false;
    this.isExecutant = false;
    this.isAssegnee = false;
    this.isSprint = false;
    this.isNewLabel = false;
  }

  togglePriority(){
    this.isLabel = false;
    this.isField = false;
    this.isPriority = !this.isPriority;
    this.isExecutant = false;
    this.isAssegnee = false;
    this.isSprint = false;
  }

  toggleExecutant(){
    this.isLabel = false;
    this.isField = false;
    this.isPriority = false;
    this.isExecutant = !this.isExecutant;
    this.isAssegnee = false;
    this.isSprint = false;
    this.isNewLabel = false;
  }

  toggleAssegnee(){
    this.isLabel = false;
    this.isField = false;
    this.isPriority = false;
    this.isExecutant = false;
    this.isAssegnee = !this.isAssegnee;
    this.isSprint = false;
    this.isNewLabel = false;
  }

  toggleSprint(){
    this.isLabel = false;
    this.isField = false;
    this.isPriority = false;
    this.isExecutant = false;
    this.isAssegnee = false;
    this.isSprint = !this.isSprint;
    this.isNewLabel = false;
  }

  toggleNewLabel(){
    this.isField = false;
    this.isPriority = false;
    this.isExecutant = false;
    this.isAssegnee = false;
    this.isSprint = false;
    this.isNewLabel = !this.isNewLabel;
  }

  
  ngOnDestroy(): void {
    this.editorDescriprion.destroy();
    this.editorComment.destroy();
  }


  onCloseModal() {
    const fullUrl = window.location.href;

    this.router.navigate([this.trimUrl(fullUrl)]);
  }

  trimUrl(url: string): string {
    const newUrl = url.replace('http://localhost:4200/', '');
    const segments = newUrl.split('/');
    segments.pop(); 
    return segments.join('/') + '/'; 
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isLabel = false;
      this.isField = false;
      this.isPriority = false;
      this.isExecutant = false;
      this.isAssegnee = false;
      this.isSprint = false;
      this.isNewLabel = false;
    }
  }

  
}
