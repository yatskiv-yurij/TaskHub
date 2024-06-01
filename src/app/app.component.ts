import { Component } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

import { Task } from './store/models/task.model';
import { Observable } from 'rxjs';
import { TaskState } from './store/reducers/task.reducer';
import { loadTasks } from './store/actions/task.actions';
import { Store } from '@ngrx/store';
import { selectTasks } from './store/selectors/tasks.selectors';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TaskHub'; 

  constructor(router: Router, viewportScroller: ViewportScroller) {
    viewportScroller.setOffset([0, 50]);
    router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e: Scroll) => {
      if (e.anchor) {
        setTimeout(() => {
          viewportScroller.scrollToAnchor(e.anchor!);
        })
      } else if (e.position) {
        viewportScroller.scrollToPosition(e.position);
      } else {
        viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

}
