export type TimeSlot = {
  start: string
  end: string
}

export type Calendar = {
  durationBefore: number
  durationAfter: number
  slots: { [date: string]: TimeSlot[] }
  sessions: { [date: string]: TimeSlot[] }
}

export type AvailableSlot = {
  startHour: Date
  endHour: Date
  clientStartHour: Date
  clientEndHour: Date
}
