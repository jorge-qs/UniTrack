/**
 * Prediction Service
 * Handles ML model predictions and what-if scenarios
 */

import { api } from '../api';

// Types matching backend schemas
export interface PredictRequest {
  cod_curso: string;
  features: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface WhatIfRequest extends PredictRequest {
  deltas: Record<string, number>;
}

export interface PredictionResult {
  cod_curso: string;
  prediction_label: string;
  score: number;
  version: string;
  details: Record<string, any>;
  estimated_grade?: number | null;
  max_grade?: number | null;
}

export interface InferenceRecord {
  id: string;
  cod_curso: string;
  prediction_label: string;
  score: number;
  version: string;
  created_at: string;
  input_payload: Record<string, any>;
  output_payload: Record<string, any>;
}

export interface HistoryResponse {
  items: InferenceRecord[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Make a prediction for a course
 */
export async function predict(
  courseCode: string,
  features: Record<string, number>,
  metadata?: Record<string, any>
): Promise<PredictionResult> {
  const request: PredictRequest = {
    cod_curso: courseCode,
    features,
    metadata,
  };

  return api.post<PredictionResult>('/predict', request);
}

/**
 * Run a what-if scenario
 */
export async function whatIf(
  courseCode: string,
  features: Record<string, number>,
  deltas: Record<string, number>,
  metadata?: Record<string, any>
): Promise<PredictionResult> {
  const request: WhatIfRequest = {
    cod_curso: courseCode,
    features,
    deltas,
    metadata,
  };

  return api.post<PredictionResult>('/whatif', request);
}

/**
 * Get prediction history
 */
export async function getHistory(
  limit: number = 50,
  offset: number = 0
): Promise<HistoryResponse> {
  return api.get<HistoryResponse>(`/history?limit=${limit}&offset=${offset}`);
}
