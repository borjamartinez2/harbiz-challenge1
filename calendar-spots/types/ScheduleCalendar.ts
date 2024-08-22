import { TimeSlot } from '.'

export type ScheduleCalendar = {
  durationBefore: number
  durationAfter: number
  slots: { [date: string]: TimeSlot[] }
  sessions: { [date: string]: TimeSlot[] }
}
