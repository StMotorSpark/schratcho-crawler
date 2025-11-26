/**
 * Analytics Module
 * 
 * Basic analytics system for logging key user actions.
 * Events are stored in memory and can be retrieved for analysis.
 * In the future, this could be extended to send events to a backend.
 */

import type { AnalyticsEvent, AnalyticsEventType } from './types';

/**
 * Maximum number of events to keep in memory.
 */
const MAX_EVENTS = 1000;

/**
 * In-memory event store.
 */
let events: AnalyticsEvent[] = [];

/**
 * Event listeners for real-time analytics.
 */
type EventListener = (event: AnalyticsEvent) => void;
const listeners: EventListener[] = [];

/**
 * Log an analytics event.
 */
export function logEvent(
  type: AnalyticsEventType,
  data?: Record<string, unknown>
): void {
  const event: AnalyticsEvent = {
    type,
    timestamp: Date.now(),
    data,
  };

  // Add to event store
  events.push(event);

  // Trim if over limit
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  // Notify listeners
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error('Analytics listener error:', error);
    }
  }
}

/**
 * Get all logged events.
 */
export function getEvents(): AnalyticsEvent[] {
  return [...events];
}

/**
 * Get events of a specific type.
 */
export function getEventsByType(type: AnalyticsEventType): AnalyticsEvent[] {
  return events.filter((e) => e.type === type);
}

/**
 * Get events within a time range.
 */
export function getEventsByTimeRange(
  startTime: number,
  endTime: number = Date.now()
): AnalyticsEvent[] {
  return events.filter(
    (e) => e.timestamp >= startTime && e.timestamp <= endTime
  );
}

/**
 * Add an event listener for real-time analytics.
 */
export function addEventListener(listener: EventListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Clear all events (useful for testing or privacy).
 */
export function clearEvents(): void {
  events = [];
}

/**
 * Get summary statistics for analytics.
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  sessionCount: number;
  ticketCount: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
} {
  const eventsByType: Record<string, number> = {};
  let totalGoldEarned = 0;
  let totalGoldSpent = 0;

  for (const event of events) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

    if (event.type === 'gold_earned' && event.data?.amount) {
      totalGoldEarned += event.data.amount as number;
    }
    if (event.type === 'gold_spent' && event.data?.amount) {
      totalGoldSpent += event.data.amount as number;
    }
  }

  return {
    totalEvents: events.length,
    eventsByType,
    sessionCount: eventsByType['session_start'] || 0,
    ticketCount: eventsByType['ticket_start'] || 0,
    totalGoldEarned,
    totalGoldSpent,
  };
}
