import { createAction, props } from "@ngrx/store";

import { Board } from "../models/board.model";

export const setAllBoard = createAction(
    '[Board] SetAll',
    props<{board: Board}>()
)