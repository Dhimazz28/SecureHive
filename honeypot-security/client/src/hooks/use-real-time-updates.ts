import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useRealTimeUpdates() {
  useEffect(() => {
    // Set up intervals for real-time data updates
    const intervals: NodeJS.Timeout[] = [];

    // Update metrics every 30 seconds
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
    }, 30000));

    // Update traffic logs every 15 seconds
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/traffic-logs'] });
    }, 15000));

    // Update attack patterns every minute
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/attack-patterns'] });
    }, 60000));

    // Update AI analysis every 45 seconds
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-analysis'] });
    }, 45000));

    // Update dataset stats every 2 minutes
    intervals.push(setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/dataset-stats'] });
    }, 120000));

    // Cleanup intervals on unmount
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, []);
}
