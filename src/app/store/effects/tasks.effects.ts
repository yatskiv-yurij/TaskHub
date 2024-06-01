import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { switchMap, mergeMap, map, catchError, tap } from 'rxjs/operators';
import { TasksService } from '../../services/tasks.service';
import * as taskActions from '../actions/task.actions';

@Injectable()
export class TaskEffects {
  
  loadTasks$ = createEffect(() => this.actions$.pipe(
    ofType(taskActions.loadTasks),
    mergeMap(({boardId})  => {
      return this.taskService.getTasks(boardId).pipe(
        map(tasks => taskActions.loadTaskSuccess({ tasks })),
        catchError(() => EMPTY)
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private taskService: TasksService
  ) {}
}