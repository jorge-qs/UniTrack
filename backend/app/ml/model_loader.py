from __future__ import annotations

import threading
from pathlib import Path
from typing import Any

import joblib
import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)


class ModelNotAvailable(Exception):
    pass


class _MockModel:
    """Mock model that accepts any number of features and generates realistic predictions."""

    def __init__(self) -> None:
        self.version = "mock"
        self.n_features_in_ = None  # Accept any number of features

    def predict_proba(self, X):
        import numpy as np

        # Generate pseudo-random but deterministic predictions based on input
        # This ensures same input always gives same prediction
        np.random.seed(42)

        # Use feature values to influence the prediction
        if X.shape[1] > 0:
            # Use sum of features normalized to create a "score"
            feature_sum = np.sum(X, axis=1)
            # Normalize to 0-1 range and add some randomness
            normalized = (feature_sum - np.min(feature_sum)) / (np.max(feature_sum) - np.min(feature_sum) + 1e-8)
            # Add noise and clip to [0.2, 0.9] range for realistic predictions
            pass_prob = np.clip(0.5 + normalized * 0.3 + np.random.randn(len(X)) * 0.1, 0.2, 0.9)
        else:
            # Fallback for empty features
            pass_prob = np.random.uniform(0.4, 0.8, size=len(X))

        fail_prob = 1 - pass_prob
        return np.column_stack([fail_prob, pass_prob])

    def predict(self, X):
        import numpy as np

        proba = self.predict_proba(X)
        return np.where(proba[:, 1] >= 0.5, 1, 0)


class ModelLoader:
    _lock = threading.Lock()
    _model: Any | None = None
    _version: str | None = None

    @classmethod
    def load(cls) -> Any:
        with cls._lock:
            if cls._model is not None:
                return cls._model

            settings = get_settings()
            model_path = Path(settings.model_path)
            if not model_path.exists():
                logger.warning("model_file_missing", path=str(model_path))
                cls._model = _MockModel()
                cls._version = "mock"
                return cls._model

            logger.info("loading_model", path=str(model_path))
            try:
                cls._model = joblib.load(model_path)
            except Exception:
                logger.exception("model_load_failed", path=str(model_path))
                cls._model = _MockModel()
                cls._version = "mock"
                return cls._model

            cls._version = getattr(cls._model, "version", settings.model_version)
            return cls._model

    @classmethod
    def version(cls) -> str:
        if cls._version:
            return cls._version
        settings = get_settings()
        return settings.model_version
