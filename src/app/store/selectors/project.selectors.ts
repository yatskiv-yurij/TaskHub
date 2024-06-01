import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState } from '../reducers/project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>('project');

export const selectProject = createSelector(
    selectProjectState,
    (state: ProjectState) => state.project
)