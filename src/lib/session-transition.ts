// Session transition utility for handling automatic session changes
import { SessionConfig } from './types';

export interface SessionTransitionInfo {
  currentSession: SessionConfig | null;
  previousSession: SessionConfig | null;
  isTransitioning: boolean;
  timeUntilNextSession: number | null;
}

export function getCurrentSession(sessionConfigs: SessionConfig[]): SessionConfig | null {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  for (const session of sessionConfigs) {
    const [startHour, startMinute] = session.start.split(':').map(Number);
    const [endHour, endMinute] = session.end.split(':').map(Number);
    const startTime = startHour * 100 + startMinute;
    const endTime = endHour * 100 + endMinute;

    if (currentTime >= startTime && currentTime < endTime) {
      return session;
    }
  }
  return null;
}

export function getNextSession(sessionConfigs: SessionConfig[]): SessionConfig | null {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  // Sort sessions by start time
  const sortedSessions = [...sessionConfigs].sort((a, b) => {
    const [aHour, aMinute] = a.start.split(':').map(Number);
    const [bHour, bMinute] = b.start.split(':').map(Number);
    return (aHour * 100 + aMinute) - (bHour * 100 + bMinute);
  });

  // Find the next session that hasn't started yet
  for (const session of sortedSessions) {
    const [startHour, startMinute] = session.start.split(':').map(Number);
    const startTime = startHour * 100 + startMinute;
    
    if (currentTime < startTime) {
      return session;
    }
  }

  // If no session found, return the first session of the next day
  return sortedSessions[0] || null;
}

export function getTimeUntilNextSession(sessionConfigs: SessionConfig[]): number | null {
  const nextSession = getNextSession(sessionConfigs);
  if (!nextSession) return null;

  const now = new Date();
  const [startHour, startMinute] = nextSession.start.split(':').map(Number);
  
  const nextSessionTime = new Date();
  nextSessionTime.setHours(startHour, startMinute, 0, 0);
  
  // If the next session is tomorrow, add a day
  if (nextSessionTime <= now) {
    nextSessionTime.setDate(nextSessionTime.getDate() + 1);
  }
  
  return nextSessionTime.getTime() - now.getTime();
}

export function checkSessionTransition(
  sessionConfigs: SessionConfig[],
  previousSession: SessionConfig | null
): SessionTransitionInfo {
  const currentSession = getCurrentSession(sessionConfigs);
  const isTransitioning = previousSession && currentSession && previousSession.name !== currentSession.name;
  const timeUntilNextSession = getTimeUntilNextSession(sessionConfigs);

  return {
    currentSession,
    previousSession,
    isTransitioning: !!isTransitioning,
    timeUntilNextSession: timeUntilNextSession ? Math.floor(timeUntilNextSession / (1000 * 60)) : null // minutes
  };
}

export function shouldClearPreviousSessionData(
  sessionConfigs: SessionConfig[],
  previousSession: SessionConfig | null
): boolean {
  const currentSession = getCurrentSession(sessionConfigs);
  
  // Clear data if:
  // 1. We have a previous session and current session is different
  // 2. We have a previous session but no current session (between sessions)
  // 3. We're transitioning from one session to another
  return !!(
    previousSession && 
    (currentSession?.name !== previousSession.name || !currentSession)
  );
}

export function getMinutesUntilCurrentSessionEnds(sessionConfigs: SessionConfig[]): number | null {
  const currentSession = getCurrentSession(sessionConfigs);
  if (!currentSession) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  const [endHour, endMinute] = currentSession.end.split(':').map(Number);
  const sessionEndTime = endHour * 60 + endMinute;

  const minutesRemaining = sessionEndTime - currentTime;
  return minutesRemaining > 0 ? minutesRemaining : 0;
}

export function extendSessionByMinutes(session: SessionConfig, minutes: number): SessionConfig {
  const [endHour, endMinute] = session.end.split(':').map(Number);
  const totalMinutes = endHour * 60 + endMinute + minutes;
  const newEndHour = Math.floor(totalMinutes / 60);
  const newEndMinute = totalMinutes % 60;

  return {
    ...session,
    end: `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`
  };
}

export function shiftSessionByMinutes(session: SessionConfig, minutes: number): SessionConfig {
  const [startHour, startMinute] = session.start.split(':').map(Number);
  const [endHour, endMinute] = session.end.split(':').map(Number);

  const newStartMinutes = startHour * 60 + startMinute + minutes;
  const newEndMinutes = endHour * 60 + endMinute + minutes;

  const newStartHour = Math.floor(newStartMinutes / 60);
  const newStartMinute = newStartMinutes % 60;
  const newEndHour = Math.floor(newEndMinutes / 60);
  const newEndMinute = newEndMinutes % 60;

  return {
    ...session,
    start: `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`,
    end: `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`
  };
}

export function willSessionsOverlap(
  currentSession: SessionConfig,
  nextSession: SessionConfig,
  extensionMinutes: number
): boolean {
  const [currentEndHour, currentEndMinute] = currentSession.end.split(':').map(Number);
  const [nextStartHour, nextStartMinute] = nextSession.start.split(':').map(Number);

  const extendedEndMinutes = currentEndHour * 60 + currentEndMinute + extensionMinutes;
  const nextStartMinutes = nextStartHour * 60 + nextStartMinute;

  return extendedEndMinutes > nextStartMinutes;
}

export function formatTimeUntilNextSession(minutes: number | null): string {
  if (!minutes) return 'No upcoming session';

  if (minutes < 60) {
    return `${minutes}m until next session`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h until next session`;
  }

  return `${hours}h ${remainingMinutes}m until next session`;
}

