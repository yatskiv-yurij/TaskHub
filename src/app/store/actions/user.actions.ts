import { createAction, props } from "@ngrx/store";

import { User } from "../models/user.model";

export const createUser = createAction(
    '[User] CreateUser',
    props<{user: User}>()
)

export  const getUser = createAction ( 
    '[User] GetUser' , 
); 