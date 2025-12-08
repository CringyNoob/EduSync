import { useState, useEffect, useCallback } from 'react';
import { Session } from '../types/auth.types';
import { useAuth } from './useAuth';

export const useSession = () => {
  const { getSessions, revokeSession } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [getSessions]);

  const handleRevokeSession = useCallback(
    async (sessionId: string) => {
      try {
        await revokeSession(sessionId);
        // Refresh sessions after revoking
        await fetchSessions();
      } catch (err: any) {
        setError(err.message || 'Failed to revoke session');
        throw err;
      }
    },
    [revokeSession, fetchSessions]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    refetch: fetchSessions,
    revokeSession: handleRevokeSession,
  };
};
