/**
 * React hook for handling predictions
 */

import { useState, useCallback } from 'react';
import { predict, PredictionResult } from '../services/predictions';
import { APIError } from '../api';

interface UsePredictionReturn {
  loading: boolean;
  error: string | null;
  result: PredictionResult | null;
  makePrediction: (courseCode: string, features: Record<string, number>) => Promise<void>;
  clearError: () => void;
}

export function usePrediction(): UsePredictionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const makePrediction = useCallback(async (
    courseCode: string,
    features: Record<string, number>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const predictionResult = await predict(courseCode, features);
      setResult(predictionResult);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Error al obtener predicción. Verifica que el backend esté corriendo.');
      }
      console.error('Prediction error:', err);
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
    makePrediction,
    clearError,
  };
}
