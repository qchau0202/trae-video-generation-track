import { useContext } from 'react'
import { LiquidContext } from './liquidContext'

export function useApp() {
  return useContext(LiquidContext)
}
