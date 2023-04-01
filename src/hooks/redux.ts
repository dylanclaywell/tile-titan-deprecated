import {
  Selector,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux'
import { createSelector } from 'reselect'

import type { RootState, AppDispatch } from '../store'

type ValueOf<T> = T[keyof T]

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type DispatchFunc = () => AppDispatch
export const useAppDispatch: DispatchFunc = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
