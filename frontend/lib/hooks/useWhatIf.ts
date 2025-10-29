/**
 * React hook for handling what-if simulations
 */

import { useState, useCallback } from 'react';
import { whatIf, PredictionResult } from '../services/predictions';
import { APIError } from '../api';

interface UseWhatIfReturn {
  loading: boolean;
  error: string | null;
  result: PredictionResult | null;
  runSimulation: (
    courseCode: string,
    baseFeatures: Record<string, number>,
    deltas: Record<string, number>
  ) => Promise<void>;
  clearError: () => void;
}

export function useWhatIf(): UseWhatIfReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const runSimulation = useCallback(async (
    courseCode: string,
    baseFeatures: Record<string, number>,
    deltas: Record<string, number>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const simulationResult = await whatIf(courseCode, baseFeatures, deltas);
      setResult(simulationResult);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Error al ejecutar simulación. Verifica que el backend esté corriendo.');
      }
      console.error('What-if simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    runSimulation,
    clearError,
  };
}
