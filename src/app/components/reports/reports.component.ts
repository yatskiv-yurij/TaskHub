import { Component, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectBoard } from 'src/app/store/selectors/board.selectors';
import { Chart } from 'chart.js';
import { SprintService } from 'src/app/services/sprint.service';
import { selectTasks } from 'src/app/store/selectors/tasks.selectors';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  @ViewChild('burndownChart') burndownChartCanvas: ElementRef<HTMLCanvasElement> | undefined;

  burndownChart: Chart | null = null;
  selectStartDate: any;
  selectEndDate: any;
  boardId: any;
  boardData: any;
  board$ = this.store.select(selectBoard);
  tasks$ = this.store.select(selectTasks);
  isData = false;
  boardSprints: any;
 

  constructor(
    private store: Store,
    private sprintService: SprintService,
  ){}

  ngOnInit(){
    const currentUrl = window.location.href;
    this.boardId = currentUrl.split('/')[5];
    this.board$.subscribe(
      (res: any) => {
        const board = res?.filter((item: any) => item._id == this.boardId)
        if(board){
          this.boardData = board;
        }
      }
    )

    this.sprintService.getAll(this.boardId).subscribe(
      (res: any) => {
        if(res.length > 0){
          this.isData = true;
          this.boardSprints = [...res]
          this.currentSprint = res.find((item: any) => item.status == 'start' || item.status == 'create')
          if(!this.currentSprint){
            this.currentSprint = res?.[res.length-1];
            this.allSprints = res;
            this.allSprints.splice(res.length-1,1);
          }else{
            this.allSprints = res.filter((item: any) => item.status == 'complete')
          }
          this.createBurndownChart(this.currentSprint);
        }
      }
    ) 
  }

  createBurndownChart(data: any) {
    const labels = this.getDatesInRange(data?.start, data?.end);
    this.tasks$.subscribe(
      (res1: any) => {
        if(res1){
          const actualData = [];
          const plannedData = [];
          const allTask = data?.tasks;
          const sprintTask = res1.filter((item: any) => item?.sprint == data?._id)
          const start = new Date(data?.start);
          const end = new Date(data?.end);
          const today = new Date();
          

          if(allTask.length > 0){
            actualData.push(allTask.length);
            let currentDate = start;
            let issueCount = allTask.length
            
            while (currentDate <= today && currentDate <= end) {
              sprintTask.forEach(
                (item: any) => {
                  if(item.field == 'done'){
                    if(new Date(item.updatedAt).setHours(0, 0, 0, 0)  == currentDate.setHours(0, 0, 0, 0)){
                      issueCount -= 1;
                    }
                  }
                }
              )
              actualData.push(issueCount);
              currentDate.setDate(currentDate.getDate() + 1);
            }

            const numDays = labels.length;
            
            const step = actualData?.[0] / (numDays - 1); 

            for (let i = 0; i < numDays; i++) {
                plannedData.push(actualData[0] - i * step);
            }
          }
          actualData.shift();
          this.setChart(labels, plannedData, actualData);
        }
      }
    )
 }

  getDatesInRange(startDate: any, endDate: any) {
    // Конвертуємо дати у об'єкти Date
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Створюємо порожній масив для збереження дат
    const datesArray = [];
  
    // Проміжок часу, що триватиме поточна дата
    let currentDate = start;
  
    // Проходимо крізь всі дати у проміжку часу від початку до кінця
    while (currentDate <= end) {
      // Форматуємо дату у форматі 'dd.mm'
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const formattedDate = `${day}.${month}`;
  
      // Додаємо форматовану дату до масиву
      datesArray.push(formattedDate);
  
      // Переходимо до наступного дня
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    // Повертаємо масив дат
    return datesArray;
  }

  setChart(labels: any, plannedData: any, actualData: any){
    const ctx = this.burndownChartCanvas?.nativeElement;

    // Очистіть графік, якщо він вже існує
    if (this.burndownChart) {
      this.burndownChart.destroy();
    }
    if(ctx){
      this.burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Planned',
              data: plannedData,
              borderColor: 'red',
              fill: false,
              borderWidth: 2
            },
            {
              label: 'Actual',
              data: actualData,
              borderColor: 'blue',
              fill: false,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count issue'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Day'
              },
              ticks: {
                align: 'center',
                padding: 10, // Встановлюємо відступи для більшої чіткості
                autoSkip: false, // Запобігає автоматичному пропуску міток
                maxRotation: 45, // Максимальний кут повороту
                minRotation: 45 // Мінімальний кут повороту
              }
            }
          }
        }
      });
    }
  }

  generalReport(){
    if(this.boardSprints.length > 0){
      const completeSprint: any[] = [];
      const allIssue: any[] = [];
      this.boardSprints.forEach((item: any) => {
        if(item.status == 'complete' || item.status == 'start'){
          completeSprint.push(item);
          
          item.tasks.forEach((task: any) => {
            if(!allIssue.includes(task)){
              allIssue.push(task);
            }
          })
        }
      })
      this.dataProcessing(completeSprint, allIssue);
    }
  }

  certainReport(){
    
    if(this.selectStartDate && this.selectEndDate){
      const completeSprint: any[] = [];
      const allIssue: any[] = []
      this.boardSprints.forEach((item: any)=> {
        if (item.status == 'complete'){
          if(new Date(item.start) >= new Date(this.selectStartDate) && new Date(item.end) <= new Date(this.selectEndDate)){
            completeSprint.push(item);
            item.tasks.forEach((task: any) => {
              if(!allIssue.includes(task)){
                allIssue.push(task);
              }
            })
          }
        }
      })
      console.log(completeSprint, allIssue)
      this.dataProcessing(completeSprint, allIssue);
    }
  }

  dataProcessing(completeSprint: any, allIssue: any){
    let start: any;
    let end: any;
    let labels: any;
    const actualData: any[] = []
    const plannedData: any[] = []

    
    if(completeSprint.length == 1){
      labels = this.getDatesInRange(completeSprint[0].start, completeSprint[0].end);
      start = new Date(completeSprint[0].start);
      end = new Date(completeSprint[0].end);
    }else if(completeSprint.length > 1){
      labels = this.getDatesInRange(completeSprint[0].start, completeSprint[completeSprint.length-1].end);
      start = new Date(completeSprint[0].start);
      end = new Date(completeSprint[completeSprint.length-1].end);
    }
    


    this.tasks$.subscribe((res: any) => {
      let currentDate = start;
      let issueCount = allIssue.length
      const today = new Date()
      while (currentDate <= today && currentDate <= end) {
        res.forEach(
          (item: any) => {
            if(item.field == 'done'){
              if(new Date(item.updatedAt).setHours(0, 0, 0, 0)  == currentDate.setHours(0, 0, 0, 0)){
                issueCount -= 1;
              }
            }
          }
        )
        actualData.push(issueCount);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    })

    const numDays = labels.length;
          
    const step = allIssue.length / (numDays - 1); 

    for (let i = 0; i < numDays; i++) {
        plannedData.push(allIssue.length - i * step);
    }
    this.setChart(labels, plannedData, actualData)
  }

  currentMethod = 'Sprint';
  isMethod: boolean = false;
  allMethod: any[] = ['General reports', 'Certain term']

  currentSprint: any;
  isSprint: boolean = false;
  allSprints: any;

  toggleMethod(){
    this.isMethod = !this.isMethod
    this.isSprint = false;
  }

  setMethod(method: any, index: any){
    this.allMethod.push(this.currentMethod);
    this.currentMethod = method;
    this.allMethod.splice(index, 1)
    this.isMethod = false;
    if(method == 'General reports'){
      this.generalReport()
    }

    if(method == 'Sprint'){
      this.ngOnInit()
    }
  }

  toggleSprint(){
    this.isSprint = !this.isSprint
    this.isMethod = false;
  }

  setSprint(sprint: any, index: any){
    this.allSprints.push(this.currentSprint);
    this.currentSprint = sprint;
    this.allSprints.splice(index, 1)
    this.isSprint = false;
    this.createBurndownChart(sprint);
  }
}
