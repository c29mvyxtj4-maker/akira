import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

/**
 * CalendarBlock - Embedded calendar view
 * Shows month view with events
 * Syncs with Calendar section if linked
 */
export default function CalendarBlock({
  block,
  onUpdate,
  canEdit,
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 14)) // August 14, 2026
  const [events, setEvents] = useState(block.metadata?.events || [])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleAddEvent = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const newEvent = {
      id: `event_${Date.now()}`,
      date: dateStr,
      title: 'New Event',
      time: '10:00 AM',
    }
    const newEvents = [...events, newEvent]
    setEvents(newEvents)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        events: newEvents,
      },
    })
  }

  const handleDeleteEvent = (eventId) => {
    const newEvents = events.filter((e) => e.id !== eventId)
    setEvents(newEvents)
    onUpdate(block.id, {
      metadata: {
        ...block.metadata,
        events: newEvents,
      },
    })
  }

  // Get events for a specific day
  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.date === dateStr)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const isToday = (day) => {
    const today = new Date(2026, 7, 14)
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-surface-1 rounded-lg border border-surface-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-lg font-semibold text-text-1">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1.5 text-text-2 hover:text-brand-500 hover:bg-surface-0 rounded transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-surface-2 rounded-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-surface-1 border-b border-surface-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-2 py-3 text-center font-semibold text-sm text-text-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-surface-2">
          {calendarDays.map((day, idx) => (
            <motion.div
              key={idx}
              className={`min-h-24 p-2 bg-surface-0 ${
                day === null ? '' : 'hover:bg-surface-1 transition-colors cursor-pointer'
              } ${isToday(day) ? 'bg-brand-500/10 border border-brand-500' : ''}`}
              onClick={() => day && canEdit && handleAddEvent(day)}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <div
                    className={`text-sm font-semibold ${
                      isToday(day) ? 'text-brand-500' : 'text-text-1'
                    } mb-1`}
                  >
                    {day}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {getEventsForDay(day).map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative text-xs px-2 py-1 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors truncate"
                      >
                        <div className="truncate">{event.title}</div>
                        {canEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2"
                          >
                            ×
                          </button>
                        )}
                      </motion.div>
                    ))}

                    {/* Add event button */}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddEvent(day)
                        }}
                        className="opacity-0 hover:opacity-100 w-full p-1 text-text-3 hover:text-brand-500 transition-opacity"
                        title="Add event"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Events List */}
      {events.length > 0 && (
        <div className="p-4 bg-surface-1 rounded-lg border border-surface-2 space-y-2">
          <div className="text-sm font-semibold text-text-1 mb-3">Events</div>
          {events.map((event) => (
            <div key={event.id} className="group flex items-center justify-between p-2 bg-surface-0 rounded hover:bg-surface-2 transition-colors">
              <div>
                <div className="text-sm font-medium text-text-1">{event.title}</div>
                <div className="text-xs text-text-3">{event.date} at {event.time}</div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-danger transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
