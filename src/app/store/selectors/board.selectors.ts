import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardState } from '../reducers/board.reducers';

export const selectBoardState = createFeatureSelector<BoardState>('board');

export const selectBoard = createSelector(
    selectBoardState,
    (state: BoardState) => state.board
)