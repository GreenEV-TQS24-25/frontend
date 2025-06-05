import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, isBefore } from 'date-fns'
import { Session } from '@/lib/types'

interface WeeklyCalendarProps {
  sessions: Session[]
  onSelectTime: (date: Date, duration: number) => void
  spotId: number
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)

export function WeeklyCalendar({ sessions, onSelectTime, spotId }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null)

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const isTimeSlotAvailable = (date: Date) => {
    // Check if the time slot is in the past
    if (isBefore(date, new Date())) {
      return false
    }

    // Check if there's any session that overlaps with this time slot
    return !sessions.some(session => {
      const sessionStart = new Date(session.startTime)
      const sessionEnd = new Date(sessionStart.getTime() + (session.duration || 0) * 1000)
      return date >= sessionStart && date < sessionEnd
    })
  }

  const isTimeSlotUserSession = (date: Date) => {
    return sessions.some(session => {
      const sessionStart = new Date(session.startTime)
      const sessionEnd = new Date(sessionStart.getTime() + (session.duration || 0) * 1000)
      return date >= sessionStart && date < sessionEnd
    })
  }

  const isTimeSlotInSelection = (date: Date) => {
    if (!selectedTimeSlot || !selectionEnd) return false
    
    const start = selectedTimeSlot < selectionEnd ? selectedTimeSlot : selectionEnd
    const end = selectedTimeSlot < selectionEnd ? selectionEnd : selectedTimeSlot
    
    return date >= start && date <= end
  }

  const handleTimeSlotClick = (date: Date) => {
    if (!isTimeSlotAvailable(date)) return

    if (!selectedTimeSlot) {
      // Start new selection
      setSelectedTimeSlot(date)
      setSelectionEnd(date)
    } else if (isSameDay(date, selectedTimeSlot)) {
      // Update selection end time
      setSelectionEnd(date)
      const duration = Math.abs(date.getHours() - selectedTimeSlot.getHours() + 1) * 3600 // Convert to seconds
      onSelectTime(selectedTimeSlot, duration)
    } else {
      // Reset selection and start new one
      setSelectedTimeSlot(date)
      setSelectionEnd(date)
    }
  }

  const handleTimeSlotHover = (date: Date) => {
    if (selectedTimeSlot && isSameDay(date, selectedTimeSlot)) {
      setSelectionEnd(date)
      const duration = Math.abs(date.getHours() - selectedTimeSlot.getHours() + 1) * 3600 // Convert to seconds
      onSelectTime(selectedTimeSlot, duration)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-1">
          {/* Time column */}
          <div className="col-span-1">
            <div className="h-10" /> {/* Header spacer */}
            {HOURS.map(hour => (
              <div key={hour} className="h-12 text-sm text-gray-500 flex items-center justify-end pr-2">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {DAYS.map(day => {
            const currentDate = addDays(currentWeek, day)
            return (
              <div key={day} className="col-span-1">
                <div className="h-10 text-center font-medium">
                  {format(currentDate, 'EEE')}
                  <div className="text-sm text-gray-500">
                    {format(currentDate, 'd')}
                  </div>
                </div>
                {HOURS.map(hour => {
                  const timeSlot = new Date(currentDate)
                  timeSlot.setHours(hour, 0, 0, 0)
                  const isAvailable = isTimeSlotAvailable(timeSlot)
                  const isToday = isSameDay(timeSlot, new Date())
                  const isSelected = isTimeSlotInSelection(timeSlot)
                  const isFirstSelected = selectedTimeSlot && 
                    isSameDay(timeSlot, selectedTimeSlot) && 
                    timeSlot.getHours() === selectedTimeSlot.getHours()
                  const isUserSession = isTimeSlotUserSession(timeSlot)

                  return (
                    <div
                      key={hour}
                      className={`h-12 border ${
                        isFirstSelected
                          ? 'border-blue-500 bg-blue-100'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isUserSession
                          ? 'border-gray-200 bg-yellow-200 hover:bg-yellow-300'
                          : isAvailable
                          ? 'border-gray-200 bg-green-50 hover:bg-green-100 cursor-pointer'
                          : 'border-gray-200 bg-gray-100'
                      } ${isToday ? 'border-blue-500' : ''}`}
                      onClick={() => handleTimeSlotClick(timeSlot)}
                      onMouseEnter={() => handleTimeSlotHover(timeSlot)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 