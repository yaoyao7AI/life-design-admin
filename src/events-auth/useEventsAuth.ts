import { useContext } from 'react';
import { EventsAuthContext } from './EventsAuthContext';
import type { EventsAuthContextValue } from './types';

export function useEventsAuth(): EventsAuthContextValue {
  const ctx = useContext(EventsAuthContext);
  if (!ctx) {
    throw new Error('useEventsAuth must be used within EventsAuthProvider');
  }
  return ctx;
}
