import { createReducer, on } from "@ngrx/store";
import { setAllBoard } from "../actions/board.actions";
import { Board } from "../models/board.model";

export interface BoardState {
    board: Board | null
}

export const initialState: BoardState = {
    board: null
}

export const BoardReducer = createReducer(
    initialState,
    on(setAllBoard, (state) => state),
    on(setAllBoard, (state, { board }) => ({ 
        ...state, 
        board 
    }))
)

