import { createReducer, on } from "@ngrx/store";

import { setAllProject } from "../actions/project.actions";
import { Project } from "../models/project.model";

export interface ProjectState {
    project: Project | null
}

export const initialState: ProjectState = {
    project: null
}

export const ProjectReducer = createReducer(
    initialState,
    on(setAllProject, (state) => state),
    on(setAllProject, (state, { project }) => ({ 
        ...state, 
        project 
    }))
)