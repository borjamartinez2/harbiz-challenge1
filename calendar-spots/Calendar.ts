import * as moment from 'moment'
import * as fs from 'fs'
import { Calendar, TimeSlot, AvailableSlot } from './types'
import * as path from 'path'

// Retrieves available slots from the calendar considering the date, session duration, and additional time before and after the session.
function getAvailableSpots(calendarId: number, date: string, durationInMin: number): AvailableSlot[] {
  if (!moment(date, 'DD-MM-YYYY', true).isValid()) throw new Error('Invalid date format, expected DD-MM-YYYY')
  if (durationInMin <= 0) throw new Error('Duration must be greater than zero')

  const { durationAfter, durationBefore, sessions, slots } = getCalendar(calendarId)
  const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
  const slotsOfDay = slots[date] ?? []
  const sessionsOfDay = sessions[date] ?? []
  const durationWithExtraTimes = durationInMin + durationAfter + durationBefore

  // If there are no available slots for this day, return an empty array to skip unnecessary logic.
  if (!slotsOfDay.length) return []

  // Gets available slots by filtering slots of the day, checking if each slot is available and has the required duration.
  const availableSlots = slotsOfDay.filter(
    (slot) => checkSlotAvailability(sessionsOfDay, slot) && checkSlotDuration(slot, durationWithExtraTimes),
  )

  return availableSlots.map((slot) => {
    const slotStartHour = moment.utc(dateISO + ' ' + slot.start)

    const endHour = slotStartHour.clone().add(durationWithExtraTimes, 'minutes')
    const clientStartHour = slotStartHour.clone().add(durationBefore, 'minutes')
    const clientEndHour = slotStartHour.clone().add(durationInMin, 'minutes')

    return {
      startHour: slotStartHour.toDate(),
      endHour: endHour.toDate(),
      clientStartHour: clientStartHour.toDate(),
      clientEndHour: clientEndHour.toDate(),
    }
  })
}

// Retrieves a calendar object from a JSON file based on the provided calendar ID.
function getCalendar(calendarId: number): Calendar {
  const relativeRoute = `./calendars/calendar.${calendarId}.json`
  const jsonPath = path.join(__dirname, relativeRoute)

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File ${jsonPath} not exist`)
  }

  const file = fs.readFileSync(relativeRoute, 'utf-8')
  return JSON.parse(file) as Calendar
}

// Check if the slot is available by checking for overlaps with current booked sessions
function checkSlotAvailability(sessions: TimeSlot[], slot: TimeSlot): boolean {
  return !sessions.some((session) => session.start === slot.start && session.end === slot.end)
}

// Checks if the duration of a given time slot is equal to or greater than a specified duration.
function checkSlotDuration(slot: TimeSlot, duration: number): boolean {
  const startTime = moment(slot.start, 'HH:mm')
  const endTime = moment(slot.end, 'HH:mm')
  const durationInMinutes = endTime.diff(startTime, 'minutes')

  return durationInMinutes >= duration
}

export default { getAvailableSpots }
