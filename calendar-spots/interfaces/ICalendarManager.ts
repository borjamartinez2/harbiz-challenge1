import { AvailableSlot } from '../types'

export interface ICalendarManager {
  getAvailableSpots(date: string, durationInMin: number): AvailableSlot[]
}
