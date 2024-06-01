import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SprintService } from 'src/app/services/sprint.service';

@Component({
  selector: 'app-new-sprint',
  templateUrl: './new-sprint.component.html',
  styleUrls: ['./new-sprint.component.scss']
})
export class NewSprintComponent {
  @Input() board: any;
  @Input() sprint: any;
  @Output() closeEdit = new EventEmitter<void>();
  @Output() createBoard = new EventEmitter<string>();
  sprintTitle: string = '';
  sprintStartDate: any;
  sprintEndDate: any;
  sprintDescription: any;
  minDate: Date = new Date();

  constructor(
    private datePipe: DatePipe,
    private sprintService: SprintService
  ) {}

  ngOnInit(){
    if(this.sprint){
      this.sprintTitle = this.sprint.title;
      this.sprintStartDate = this.sprint.start;
      this.sprintEndDate = this.sprint.end;
      this.sprintDescription = this.sprint.goal ? this.sprint.goal : '';
    }
  }

  onCloseModal() {
    this.closeEdit.emit();
  }

  newSprint(){
    if(this.sprintTitle.length>3 && this.sprintStartDate && this.sprintEndDate){
      
      const sprint = {
        title: this.sprintTitle, 
        start: this.datePipe.transform(this.sprintStartDate, 'MM/dd/yy'), 
        end: this.datePipe.transform(this.sprintEndDate, 'MM/dd/yy'), 
        goal: this.sprintDescription, 
        board:this.board,
      }
      this.sprintService.createSprint(sprint).subscribe(
        (res) => {
          if(res){
            this.createBoard.emit();
            this.closeEdit.emit();
          }
        }
      )
    }else{
      console.log('he')
    }
  }

  editSprint(){
    if(this.sprintTitle.length>3 && this.sprintStartDate && this.sprintEndDate){
      
      const sprint = {
        title: this.sprintTitle, 
        start: this.datePipe.transform(this.sprintStartDate, 'MM/dd/yy'), 
        end: this.datePipe.transform(this.sprintEndDate, 'MM/dd/yy'), 
        goal: this.sprintDescription, 
      }
      this.sprintService.updateSprint(this.sprint._id, sprint).subscribe(
        (res) => {
          if(res){
            this.createBoard.emit();
            this.closeEdit.emit();
          }
        }
      )
    }else{
      console.log('he')
    }
  }

}
