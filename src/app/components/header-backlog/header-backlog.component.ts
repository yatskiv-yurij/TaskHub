import { Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, Output, EventEmitter  } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { selectUser } from 'src/app/store/selectors/user.selector';
import { SprintService } from 'src/app/services/sprint.service';
import { SendMailService } from 'src/app/services/send-mail.service';
import { TasksService } from 'src/app/services/tasks.service';
import { BoardService } from 'src/app/services/board.service';
import { AuthService } from 'src/app/services/auth.service';
import { FilterDataService } from 'src/app/services/filter-data.service';

@Component({
  selector: 'app-header-backlog',
  templateUrl: './header-backlog.component.html',
  styleUrls: ['./header-backlog.component.scss']
})
export class HeaderBacklogComponent  implements OnChanges{
  @Input() data: any;
  @Output() createBoard = new EventEmitter<string>();
  board$ = this.store.select(selectBoard);
  user$ = this.store.select(selectUser);
  way: string = '';
  title: string = '';
  isSprint: boolean = false;
  backlog: boolean = false;
  sprint: boolean = false;
  issues: boolean = false;
  boardId: string = '';
  participantEmail: string = ''
  sprintData: any;
  allPriority: any;
  allLabels: any;
  allExecutant: any[] = [];

  resolution: any[] = [];
  status: any[] = [];
  priorityData: any[] = [];
  labels: any[] = [];
  executants: any[] = []

  constructor(
    private el: ElementRef,
    private store: Store,
    private sprintService: SprintService,
    private mailService: SendMailService,
    private tasksService: TasksService,
    private boardService: BoardService,
    private authService: AuthService,
    private filterService: FilterDataService
  ) {}

  ngOnInit(){
    this.setInfo(this.data?.title);
    this.setSprint();

    this.sprintService.getDataChange().subscribe(
      (res) => {
        this.setSprint();
      }
    ) 

    this.filterService.getDataChange().subscribe(
      (res) => {
        this.resolution = [];
        this.status = [];
        this.priorityData = [];
        this.labels = [];
        this.executants = []
      }
    )
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setInfo(this.data?.title);
      this.setSprint();
      this.setFilter();
    }
  }


  setFilter(){
    this.allLabels = null;
    this.allExecutant = [];
    this.tasksService.getPriority().subscribe(
      (res) => {
        this.allPriority = res
      }
    )

    this.boardService.getLabel(this.boardId).subscribe(
      (res) => {
        this.allLabels = res
      }
    )

    this.board$.subscribe(
      (res: any)=> {
        const board = res.find((item: any) => item._id == this.boardId);
        board?.participants.forEach((participant: any) => {
          this.authService.getUserInfo(participant.email).subscribe(
            (res) => {
              const hasObject = this.allExecutant.some((item: any) => item?._id == res[0]?._id)
              if(!hasObject){
                this.allExecutant.push(res[0]);
              }
            }
          )
        })
      }
    )
  }

  setSprint(){
    this.isSprint = false;
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.sprintService.getAll(this.boardId).subscribe(
      (res: any) => {
        if(res.length > 0){
          res?.forEach((sprint:any) => {
            if(sprint.status == 'start' || sprint.status == 'create'){
              this.isSprint = true;
              this.sprintData = sprint
            }
          })
        }
      }
    )
  }

  setInfo(title: any){
    if(title == 'Backlog'){
      this.backlog = true;
    }else if(title == 'Active sprint'){
      this.sprint = true;
    }else{
      this.issues = true;
    }
  }

  handleCreateSprint(){
    this.createBoard.emit();
  }


  copyLink(){
    let currentUrl = window.location.href.split('/');
    currentUrl[6] = 'new-participant';
    const link = currentUrl.join('/');
    try {
      navigator.clipboard.writeText(link)
        .then(() => {
          console.log('Text copied successfully');
          this.isShare = false;
        })
        .catch(err => {
          console.error('Error copying text:', err);
        });
    } catch (err) {
      console.error('Error copying text:', err);
    }
  }

  toInvite(){
    const currentUrl = window.location.href;
    const projectId = currentUrl.split('/')[4];
    const boardId = currentUrl.split('/')[5];
    this.user$.subscribe(
      (res) => {
        const data = {
          fullname: res?.fullname,
          board: this.data.title,
          link: `${projectId}/${boardId}/new-participant`
        }

        this.mailService.sendMailInvitation(this.participantEmail, 'Shared board with you', data).subscribe(
          (res)=> {
            console.log(res)
          }
        )
      }
    )
  }

  isLabel: boolean = false;
  isPriority: boolean = false;
  isExecutant: boolean = false;
  isStatus: boolean = false;
  isResolution: boolean = false;
  isNewSprint: boolean = false;
  isShare: boolean = false;

  

  toggleLabel() {
    this.isLabel = !this.isLabel;
    this.isPriority = false;
    this.isExecutant = false;
    this.isStatus = false;
    this.isResolution = false;
    this.isShare = false;
  }

  togglePriority() {
    this.isLabel = false;
    this.isExecutant = false;
    this.isPriority = !this.isPriority;
    this.isStatus = false;
    this.isResolution = false;
    this.isShare = false;
  }

  toggleExecutant() {
    this.isLabel = false;
    this.isExecutant = !this.isExecutant;
    this.isPriority = false;
    this.isStatus = false;
    this.isResolution = false;
    this.isShare = false;
  }

  toggleStatus() {
    this.isLabel = false;
    this.isExecutant = false
    this.isPriority = false;
    this.isStatus = !this.isStatus;
    this.isResolution = false;
    this.isShare = false;
  }

  toggleResolution() {
    this.isLabel = false;
    this.isExecutant = false;
    this.isPriority = false;
    this.isStatus = false;
    this.isResolution = !this.isResolution;
    this.isShare = false;
  }

  toggleShare(){
    this.isLabel = false;
    this.isExecutant = false;
    this.isPriority = false;
    this.isStatus = false;
    this.isResolution = false;
    this.isShare = !this.isShare;
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
      this.isLabel = false;
      this.isPriority = false;
      this.isExecutant = false;
      this.isStatus = false;
      this.isResolution = false;
      this.isShare = false;
    }
  }



  setResolution(item: number){
    if(!this.resolution.includes(item)){
      this.resolution.push(item);
    }else{
      const index = this.resolution.indexOf(item)
      this.resolution.splice(index, 1);
    }

    this.filterService.setResolution(this.resolution);
  }

  setStatus(item: number){
    if(!this.status.includes(item)){
      this.status.push(item);
    }else{
      const index = this.status.indexOf(item)
      this.status.splice(index, 1);
    }
    this.filterService.setStatus(this.status);
  }

  setPriority(item: any){
    if(!this.priorityData.includes(item)){
      this.priorityData.push(item);
    }else{
      const index = this.priorityData.indexOf(item)
      this.priorityData.splice(index, 1);
    }
    this.filterService.setPriority(this.priorityData);
  }

  setLabel(item: any){
    if(!this.labels.includes(item)){
      this.labels.push(item);
    }else{
      const index = this.labels.indexOf(item)
      this.labels.splice(index, 1);
    }
    this.filterService.setLabels(this.labels);
  }

  setExecutant(item: any){
    if(!this.executants.includes(item)){
      this.executants.push(item);
    }else{
      const index = this.executants.indexOf(item)
      this.executants.splice(index, 1);
    }
    this.filterService.setExecutant(this.executants);
  }

  clean(){
    this.filterService.clean();
    this.resolution = [];
    this.status = [];
    this.priorityData = [];
    this.labels = [];
    this.executants = []
  }
}
