from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "network_logs.csv"


class AnomalyDetectionModel:
    """
    Simple anomaly detection wrapper using IsolationForest.
    """

    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.is_trained: bool = False
        self.feature_names: List[str] = []

    def _load_dataset(self) -> pd.DataFrame:
        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
        df = pd.read_csv(DATA_PATH)
        # TODO: yahan pe apne numeric feature columns select kar:
        # e.g. self.feature_names = ["bytes", "packets", "duration"]
        self.feature_names = [
            c for c in df.columns
            if np.issubdtype(df[c].dtype, np.number)
        ]
        if not self.feature_names:
            raise ValueError("No numeric columns found for anomaly detection")
        return df[self.feature_names]

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "is_trained": self.is_trained,
            "feature_names": self.feature_names,
            "algorithm": "IsolationForest",
        }

    def train(self, data: np.ndarray, contamination: float = 0.1) -> Dict[str, Any]:
        """
        Agar data empty ya bahut chhota hai, to CSV dataset se train karo.
        """
        if data is None or len(data) < 10:
            df = self._load_dataset()
            X = df.values
        else:
            X = np.asarray(data).reshape(-1, 1)

        self.model = IsolationForest(
            contamination=contamination,
            n_estimators=100,
            random_state=42,
        )
        self.model.fit(X)
        self.is_trained = True

        scores = -self.model.score_samples(X)
        labels = (self.model.predict(X) == -1).astype(int)

        return {
            "status": "trained",
            "samples": int(len(X)),
            "contamination": contamination,
            "mean_score": float(np.mean(scores)),
            "anomaly_count": int(labels.sum()),
        }

    def predict(self, series: np.ndarray):
        """
        Single time-series ke liye score + label.
        """
        if not self.is_trained or self.model is None:
            raise RuntimeError("Model not trained")

        X = np.asarray(series).reshape(-1, 1)
        scores = -self.model.score_samples(X)
        labels = (self.model.predict(X) == -1).astype(int).tolist()
        return scores.tolist(), labels

    def predict_batch(self, sequences: List[List[float]]) -> Dict[str, Any]:
        """
        Multiple sequences ke liye predictions.
        """
        if not self.is_trained or self.model is None:
            raise RuntimeError("Model not trained")

        results = []
        for seq in sequences:
            s = np.asarray(seq).reshape(-1, 1)
            scores = -self.model.score_samples(s)
            labels = (self.model.predict(s) == -1).astype(int).tolist()
            results.append(
                {
                    "data": seq,
                    "scores": scores.tolist(),
                    "labels": labels,
                    "anomaly_count": int(sum(labels)),
                }
            )
        return {
            "status": "success",
            "results": results,
        }


def load_model() -> AnomalyDetectionModel:
   
    model = AnomalyDetectionModel()
    # optionally: pehle se dataset se train:
    df = model._load_dataset()
    model.train(df.values.ravel())
    return model


def get_model() -> AnomalyDetectionModel:
    """
    Fallback jab load_model fail ho jaye.
    """
    return AnomalyDetectionModel()
