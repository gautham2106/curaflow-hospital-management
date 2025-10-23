import { useEffect, useCallback } from 'react';

export interface CrossPageSyncOptions {
  onQueueUpdate?: () => void;
  onVisitUpdate?: () => void;
  onSessionUpdate?: () => void;
  onTokenGenerated?: () => void;
}

export function useCrossPageSync(options: CrossPageSyncOptions = {}) {
  const {
    onQueueUpdate,
    onVisitUpdate,
    onSessionUpdate,
    onTokenGenerated
  } = options;

  // Function to trigger updates
  const triggerUpdate = useCallback((type: 'queue' | 'visit' | 'session' | 'token') => {
    // Trigger storage event for cross-tab communication
    localStorage.setItem(`${type}Updated`, Date.now().toString());
    
    // Trigger custom event for same-tab communication
    window.dispatchEvent(new CustomEvent(`${type}Updated`));
  }, []);

  // Listen for updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'queueUpdated' && onQueueUpdate) {
        onQueueUpdate();
      } else if (e.key === 'visitUpdated' && onVisitUpdate) {
        onVisitUpdate();
      } else if (e.key === 'sessionUpdated' && onSessionUpdate) {
        onSessionUpdate();
      } else if (e.key === 'tokenUpdated' && onTokenGenerated) {
        onTokenGenerated();
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.type === 'queueUpdated' && onQueueUpdate) {
        onQueueUpdate();
      } else if (e.type === 'visitUpdated' && onVisitUpdate) {
        onVisitUpdate();
      } else if (e.type === 'sessionUpdated' && onSessionUpdate) {
        onSessionUpdate();
      } else if (e.type === 'tokenUpdated' && onTokenGenerated) {
        onTokenGenerated();
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('queueUpdated', handleCustomEvent as EventListener);
    window.addEventListener('visitUpdated', handleCustomEvent as EventListener);
    window.addEventListener('sessionUpdated', handleCustomEvent as EventListener);
    window.addEventListener('tokenUpdated', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('queueUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('visitUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('sessionUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('tokenUpdated', handleCustomEvent as EventListener);
    };
  }, [onQueueUpdate, onVisitUpdate, onSessionUpdate, onTokenGenerated]);

  return {
    triggerUpdate
  };
}

// Convenience hooks for specific update types
export function useQueueSync(onUpdate: () => void) {
  return useCrossPageSync({ onQueueUpdate: onUpdate });
}

export function useVisitSync(onUpdate: () => void) {
  return useCrossPageSync({ onVisitUpdate: onUpdate });
}

export function useSessionSync(onUpdate: () => void) {
  return useCrossPageSync({ onSessionUpdate: onUpdate });
}

export function useTokenSync(onUpdate: () => void) {
  return useCrossPageSync({ onTokenGenerated: onUpdate });
}

