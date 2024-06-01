import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from '../reducers/task.reducer';

// Отримати фічу (загалом весь стан для цієї фічі)
export const selectTaskFeature = createFeatureSelector<TaskState>('tasks');

// Отримати масив задач
export const selectTasks = createSelector(
  selectTaskFeature,
  (state: TaskState) => state.tasks
);