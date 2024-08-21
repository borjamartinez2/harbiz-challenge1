import * as moment from 'moment'
import * as fs from 'fs'
import * as path from 'path'
import { ICalendarManager } from './interfaces'
import { AvailableSlot, ScheduleCalendar, TimeSlot } from './types'

class CalendarManager implements ICalendarManager {
  private calendar: ScheduleCalendar
  private readonly __inputDateFormat = 'DD-MM-YYYY'
  private readonly __outputDateFormat = 'YYYY-MM-DD'
  private readonly __hourMinFormat = 'HH:mm'

  constructor(private calendarId: number) {
    this.calendar = this.loadCalendar()
  }

  // Retrieves available slots from the calendar considering the date, session duration, and additional time before and after the session.
  public getAvailableSpots(date: string, durationInMin: number): AvailableSlot[] {
    if (!moment(date, this.__inputDateFormat, true).isValid()) {
      throw new Error(`Invalid date format, expected ${this.__inputDateFormat}`)
    }
    if (durationInMin <= 0) {
      throw new Error('Duration must be greater than zero')
    }

    const { durationAfter, durationBefore, sessions, slots } = this.calendar
    const dateISO = moment(date, this.__inputDateFormat).format(this.__outputDateFormat)
    const slotsOfDay = slots[date] ?? []
    const sessionsOfDay = sessions[date] ?? []
    const totalDuration = durationInMin + durationAfter + durationBefore

    // Gets available slots by filtering slots of the day, checking if each slot is available and has the required duration.
    if (!slotsOfDay.length) return []

    // Gets available slots by filtering slots of the day, checking if each slot is available and has the required duration.
    const availableSlots = slotsOfDay.filter(
      (slot) => this.isSlotAvailable(sessionsOfDay, slot) && this.isSlotShiftEnough(slot, totalDuration),
    )

    return availableSlots.map((slot) =>
      this.createAvailableSlot({ slotStartHour: slot.start, dateISO, durationInMin, durationBefore, totalDuration }),
    )
  }

  // Retrieves a calendar object from a JSON file based on the provided calendar ID.
  private loadCalendar(): ScheduleCalendar {
    const relativeRoute = `./calendars/calendar.${this.calendarId}.json`
    const jsonPath = path.join(__dirname, relativeRoute)

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File ${jsonPath} does not exist`)
    }

    const fileContent = fs.readFileSync(jsonPath, 'utf-8')
    return JSON.parse(fileContent) as ScheduleCalendar
  }

  // Check if the slot is available by checking for overlaps with current booked sessions
  private isSlotAvailable(sessions: TimeSlot[], slot: TimeSlot): boolean {
    const slotStart = moment(slot.start, this.__hourMinFormat)
    const slotEnd = moment(slot.end, this.__hourMinFormat)

    return !sessions.some((session) => {
      const sessionStart = moment(session.start, this.__hourMinFormat)
      const sessionEnd = moment(session.end, this.__hourMinFormat)

      return (
        (slotStart.isSame(sessionStart) && slotEnd.isSame(sessionEnd)) || // This condition checks if the slot start and end times exactly match the session start and end times.
        (slotStart.isAfter(sessionStart) && slotStart.isBefore(sessionEnd)) || // This condition checks if the slot start time falls within the session, but the end time may be outside the session.
        (slotEnd.isAfter(sessionStart) && slotEnd.isBefore(sessionEnd)) || // This condition checks if the slot end time falls within the session, but the start time may be outside the session.
        (slotStart.isBefore(sessionStart) && slotEnd.isAfter(sessionEnd)) // This condition checks if the slot completely overlaps the session, meaning it starts before and ends after the session.
      )
    })
  }

  // Checks if the duration of a given time slot is equal to or greater than a specified duration.
  private isSlotShiftEnough(slot: TimeSlot, requiredDuration: number): boolean {
    const startTime = moment(slot.start, this.__hourMinFormat)
    const endTime = moment(slot.end, this.__hourMinFormat)
    const slotDuration = endTime.diff(startTime, 'minutes')

    return slotDuration >= requiredDuration
  }

  private createAvailableSlot({
    slotStartHour,
    dateISO,
    durationInMin,
    durationBefore,
    totalDuration,
  }: {
    slotStartHour: string
    dateISO: string
    durationInMin: number
    durationBefore: number
    totalDuration: number
  }): AvailableSlot {
    const slotStart = moment.utc(dateISO + ' ' + slotStartHour)
    const endHour = slotStart.clone().add(totalDuration, 'minutes')
    const clientStartHour = slotStart.clone().add(durationBefore, 'minutes')
    const clientEndHour = slotStart.clone().add(durationInMin, 'minutes')

    return {
      startHour: slotStart.toDate(),
      endHour: endHour.toDate(),
      clientStartHour: clientStartHour.toDate(),
      clientEndHour: clientEndHour.toDate(),
    }
  }
}

export default CalendarManager
