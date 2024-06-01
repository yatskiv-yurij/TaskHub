import { createAction, props } from "@ngrx/store";

import { Task } from "src/app/store/models/task.model";

export const addTask = createAction(
    '[Tasks] AddTask', 
    props<{task: Task}>()
);

export const loadTasks = createAction(
    '[Task] Load Tasks',
    props<{ boardId: string }>()
);

export const loadTaskSuccess = createAction(
    '[Tasks] LoadTask', 
    props<{tasks: Task[]}>()
);