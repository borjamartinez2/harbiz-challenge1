import * as moment from 'moment'
import CalendarManager from './Calendar'
import * as assert from 'assert'

describe('getAvailableSpot', function () {
  it('Should get 1 available spots of calendar 1', function () {
    const calendarManager = new CalendarManager(1)
    const result = calendarManager.getAvailableSpots('10-04-2023', 30)
    assert.ok(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-10T16:00:00.000Z').valueOf())
    assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-10T16:50:00.000Z').valueOf())
  })
})

describe('getAvailableSpot', function () {
  it('Should get 1 available spots of calendar 2', function () {
    const calendarManager = new CalendarManager(2)
    const result = calendarManager.getAvailableSpots('13-04-2023', 25)
    assert.ok(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-13T18:00:00.000Z').valueOf())
    assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-13T18:25:00.000Z').valueOf())
  })
})

describe('getAvailableSpot', function () {
  it('Should get no available spots of calendar 3', function () {
    const calendarManager = new CalendarManager(3)
    const result = calendarManager.getAvailableSpots('16-04-2023', 25)
    assert.ok(result)
    assert.equal(result.length, 0)
  })
})
