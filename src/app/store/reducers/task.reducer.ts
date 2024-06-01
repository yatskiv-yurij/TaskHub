import { createReducer, on } from "@ngrx/store";

import { addTask, loadTaskSuccess } from "../actions/task.actions";
import { Task } from "src/app/store/models/task.model";

export interface TaskState {
    tasks: Task[]
}

export const initialState: TaskState = {
    tasks: []
}

export const TasksReducer = createReducer(
    initialState,
    on(addTask, (state, {task}) => ({
        ...state,
        tasks: [...state.tasks, task]
    })),
    on(loadTaskSuccess, (state, { tasks }) => ({
        ...state,
        tasks
    }))
)