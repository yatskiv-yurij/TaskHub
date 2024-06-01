import { createReducer, on } from "@ngrx/store";

import { createUser, getUser } from "../actions/user.actions";
import { User } from "../models/user.model";

export interface UserState {
    user: User | null
}

export const initialState: UserState = {
    user: null
}

export const UserReducer = createReducer(
    initialState,
    on(createUser, (state) => state),
    on ( getUser , ( state ) => ( { 
        ...state, 
      })), 
    on(createUser, (state, { user }) => ({ 
        ...state, 
        user 
    }))
)