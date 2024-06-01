import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterDataService {
  private dataChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private resolution: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private status: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private priority: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private labels: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private executants: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() { }

  setResolution(data: any): void{
    this.resolution.next(data)
  }
  getResolution(): Observable<Array<any>>{
    return this.resolution.asObservable();
  }
  
  setStatus(data: any): void{
    this.status.next(data)
  }
  getStatus(): Observable<Array<any>>{
    return this.status.asObservable();
  }

  setPriority(data: any): void{
    this.priority.next(data)
  }
  getPriority(): Observable<Array<any>>{
    return this.priority.asObservable();
  }

  setLabels(data: any): void{
    this.labels.next(data)
  }
  getLabels(): Observable<Array<any>>{
    return this.labels.asObservable();
  }

  setExecutant(data: any): void{
    this.executants.next(data)
  }
  getExecutant(): Observable<Array<any>>{
    return this.executants.asObservable();
  }

  clean(){
    this.resolution.next([])
    this.status.next([])
    this.priority.next([])
    this.labels.next([])
    this.executants.next([])
  }

  filterData(tasks: any): Observable<any>{
    let newTasks = tasks
    if(this.labels.getValue()?.length > 0){
      newTasks = newTasks.filter(
        (task: any) => {
          return this.labels.getValue()?.some((item: any) => {
            return task.label?._id.toString() === item.toString();
          });
        }
      )
    }

    if(this.priority.getValue()?.length > 0){
      newTasks = newTasks.filter(
        (task: any) => {
          return this.priority.getValue()?.some((item: any) => {
            return task.priority?._id.toString() === item.toString();
          });
        }
      )
    }

    if(this.executants.getValue()?.length > 0){
      newTasks = newTasks.filter(
        (task: any) => {
          return this.executants.getValue()?.some((item: any) => {
            return task.performer?._id.toString() === item.toString();
          });
        }
      )
    }

    if(this.status.getValue()?.length > 0){
      newTasks = newTasks.filter(
        (task: any) => {
          return this.status.getValue()?.some((item: any) => {
            if(item == 1){
              return task.field == 'to do';
            }else if(item == 2){
              return task.field == 'doing';
            }else{
              return task.field == 'done';
            }
            
          });
        }
      )
    }

    if(this.resolution.getValue()?.length > 0){
      newTasks = newTasks.filter(
        (task: any) => {
          return this.resolution.getValue()?.some((item: any) => {
            if(item == 1){
              return task.status == 'unresolved' || task.status == undefined;
            }else{
              return task.status == 'resolved';
            }
            
          });
        }
      )
    }

    return of(newTasks);
  }

  setDataChange(): void{
    this.dataChange.next(!this.dataChange)
  }

  getDataChange(): Observable<boolean>{
    return this.dataChange.asObservable();
  }
}
