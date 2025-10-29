from __future__ import annotations

from typing import Dict, Tuple

import numpy as np

from app.ml.featurizer import to_feature_vector
from app.ml.model_loader import ModelLoader


class InferenceService:
    pass_mark = 0.5

    @classmethod
    def predict(cls, *, features: Dict[str, float]) -> Tuple[str, float, Dict[str, float], float | None]:
        model = ModelLoader.load()
        # Convert features dict to vector (sorted by key for consistency)
        vector = to_feature_vector(features, allow_empty=False)
        proba, est_grade = cls._predict_proba_and_grade(model, vector)
        score = float(proba[0][1])
        label = "Aprobar" if score >= cls.pass_mark else "Desaprobar"
        details: Dict[str, float] = {"probabilities": {"fail": float(proba[0][0]), "pass": score}}
        if est_grade is not None:
            details["estimated_grade"] = float(est_grade)
        return label, score, details, est_grade

    @staticmethod
    def _predict_proba_and_grade(model, vector: np.ndarray) -> Tuple[np.ndarray, float | None]:
        if hasattr(model, "predict_proba"):
            # Classifier - return probabilities directly
            return model.predict_proba(vector), None

        # Regressor - convert grade prediction (0-20) to pass/fail probability
        if hasattr(model, "predict"):
            prediction = model.predict(vector)
            proba = np.zeros((len(vector), 2), dtype=float)

            for idx, grade in enumerate(prediction):
                # Convert grade (0-20) to pass probability
                # Passing grade is 10.5 (standard Peruvian university passing grade)
                # Use sigmoid-like conversion for smooth probability transition
                normalized = (grade - 10.5) / 5.0  # Scale around threshold
                pass_prob = 1 / (1 + np.exp(-normalized))  # Sigmoid function
                proba[idx, 1] = pass_prob  # Probability of passing
                proba[idx, 0] = 1 - pass_prob  # Probability of failing

            return proba, float(prediction[0]) if len(prediction) > 0 else None

        raise RuntimeError("Model does not support prediction")
