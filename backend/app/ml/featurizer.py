from __future__ import annotations

from typing import Dict, Iterable, List

import numpy as np
from fastapi import HTTPException, status


def to_feature_vector(features: Dict[str, float], expected_order: Iterable[str] | None = None, allow_empty: bool = False) -> np.ndarray:
    if not features and not allow_empty:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="features payload is empty")

    if not features:
        return np.array([[]], dtype=float)  # Return empty array

    if expected_order:
        order: List[str] = list(expected_order)
        missing = [key for key in order if key not in features]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Missing feature(s): {', '.join(missing)}",
            )
        ordered_values = [float(features[key]) for key in order]
    else:
        ordered_keys = sorted(features.keys())
        ordered_values = [float(features[key]) for key in ordered_keys]

    return np.array([ordered_values], dtype=float)
