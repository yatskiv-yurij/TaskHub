import { Component, ElementRef, HostListener } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { selectTasks } from 'src/app/store/selectors/tasks.selectors';
import { Socket } from 'ngx-socket-io';
import { loadTasks } from 'src/app/store/actions/task.actions';
import { FilterDataService } from 'src/app/services/filter-data.service';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  isDetail: boolean = false;
  board$ = this.store.select(selectBoard);
  board: any;
  headerInfo: any;
  tasksData: any;
  boardId: any;
  allTasks: any;
  currentPage: number = 0;
  countPage: number = 4;

  constructor(
    private el: ElementRef,
    private store: Store,
    private router: Router,
    private socket: Socket,
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

    this.store.pipe(
      select(selectTasks) 
    ).subscribe(tasks => {
      this.allTasks = tasks;
      this.tasksData = tasks;
      this.countPage = Math.ceil(tasks.length / 7);
    });




    this.filterService.getLabels().subscribe(
      (res) => {
        this.filterService.getPriority().subscribe(
          (res) => {
            this.filterService.getExecutant().subscribe(
              (res) => {
                this.filterService.getStatus().subscribe(
                  (res) => {
                    this.filterService.getResolution().subscribe(
                      (res) => {
                        this.filterService.filterData(this.allTasks).subscribe(
                          (res) => {
                              this.setData(res);
                          }
                        );
                      }
                    )
                  }
                )
              }
            )
          }
        )
      }
    )

    



    this.socket.fromEvent('taskUpdated').subscribe(() => {
      this.store.dispatch(loadTasks({boardId: this.boardId}));
    });

    this.socket.fromEvent('taskDeleted').subscribe(() => {
      this.store.dispatch(loadTasks({boardId: this.boardId}));
    });
  }

  setData(data: any){
    this.tasksData = data;
    this.countPage = Math.ceil(data.length / 7); 
    this.currentPage = 0
  }

  setHeader(){
    const currentUrl = window.location.href;
    const boardId = currentUrl.split('/')[5];
    this.board$.subscribe(
      (res:any) => {
        const data = res?.find((item: any) => item._id === boardId);
        if(data){
          Promise.resolve(data).then((board: any) => {
            this.headerInfo ={
              route: 'Project / '+ board?.project.title + ' / ' + board?.title,
              title: 'Issuesw',
            }
          })
        }
          
      }
    )
  }

  toggleDetail(){
    this.isDetail = !this.isDetail;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (clickedInside &&  !targetElement.classList.contains('open-dropdown') && !targetElement.classList.contains('dropdown')) {
      this.isDetail = false;
    }
  }

  counterArray(countPage: number): number[] {
    return Array.from({length: countPage}, (_, index) => index + 1);
  }

  setPage(page: number){
    this.currentPage = page;
  }

  back(){
    this.currentPage = this.currentPage - 1;
  }

  next(){
    this.currentPage = this.currentPage + 1;
  }
}
