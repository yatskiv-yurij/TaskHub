import { createAction, props } from "@ngrx/store";

import { Project } from "../models/project.model";

export const setAllProject = createAction(
    '[Project] SetAll',
    props<{project: Project}>()
)
 