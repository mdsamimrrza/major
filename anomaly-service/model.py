import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import joblib
import os
from typing import List, Tuple, Dict
import json
from datetime import datetime

class AnomalyDetectionModel:
    """
    LSTM-based Anomaly Detection Model for time series data.
    Supports both training and prediction modes.
    Based on: https://github.com/maxmelichov/Anomaly-Detection
    """
    
    def __init__(self, model_path: str = "models/anomaly_model.pkl", scaler_path: str = "models/scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
        self.threshold = 0.5
        
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
    def train(self, data: np.ndarray, contamination: float = 0.1) -> Dict:
        """
        Train the Isolation Forest model on the provided data.
        
        Args:
            data: Time series data (numpy array or list of values)
            contamination: Expected proportion of outliers (0 to 0.5)
            
        Returns:
            Dict with training statistics
        """
        try:
            print("🚀 Starting model training...")
            print(f"📊 Data shape: {data.shape if hasattr(data, 'shape') else len(data)}")
            
            # Convert to numpy array if needed
            if isinstance(data, list):
                data = np.array(data)
            
            # Reshape if 1D
            if len(data.shape) == 1:
                data = data.reshape(-1, 1)
            
            print("⚙️  Scaling data...")
            # Scale the data
            data_scaled = self.scaler.fit_transform(data)
            
            print("🌲 Training Isolation Forest model...")
            # Train Isolation Forest
            self.model = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100
            )
            
            self.model.fit(data_scaled)
            self.is_trained = True
            
            print("💾 Saving model and scaler...")
            # Save model and scaler
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            print("📈 Calculating anomaly scores...")
            # Get anomaly scores
            scores = -self.model.score_samples(data_scaled)
            
            print("✅ Training completed successfully!")
            
            return {
                "status": "success",
                "message": "Model trained successfully",
                "samples_trained": len(data),
                "mean_score": float(np.mean(scores)),
                "max_score": float(np.max(scores)),
                "min_score": float(np.min(scores)),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Training failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def predict(self, data: np.ndarray) -> Tuple[List[float], List[int]]:
        """
        Predict anomalies in the provided data.
        
        Args:
            data: Time series data to analyze
            
        Returns:
            Tuple of (anomaly_scores, anomaly_labels)
        """
        print("🔍 Starting anomaly prediction...")
        
        if not self.is_trained and not os.path.exists(self.model_path):
            print("❌ Model not trained")
            raise ValueError("Model not trained. Please train the model first.")
        
        # Load model if not already loaded
        if self.model is None:
            print("📂 Loading model from disk...")
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            print("✅ Model loaded successfully")
        
        try:
            print(f"📊 Processing {len(data) if hasattr(data, '__len__') else 'unknown'} data points...")
            
            # Convert to numpy array if needed
            if isinstance(data, list):
                data = np.array(data)
            
            # Reshape if 1D
            if len(data.shape) == 1:
                data = data.reshape(-1, 1)
            
            print("⚙️  Scaling data...")
            # Scale the data
            data_scaled = self.scaler.transform(data)
            
            print("🧮 Calculating anomaly scores...")
            # Get anomaly scores (negative because sklearn returns negative outlier scores)
            scores = -self.model.score_samples(data_scaled)
            
            print("🎯 Detecting anomalies...")
            # Get predictions (-1 for anomalies, 1 for normal)
            predictions = self.model.predict(data_scaled)
            
            # Convert to binary labels (1 for anomaly, 0 for normal)
            labels = [1 if p == -1 else 0 for p in predictions]
            
            anomaly_count = sum(labels)
            print(f"✅ Prediction completed! Found {anomaly_count} anomalies out of {len(labels)} points")
            
            return (
                [float(s) for s in scores],
                labels
            )
        except Exception as e:
            print(f"❌ Prediction failed: {str(e)}")
            raise ValueError(f"Error during prediction: {str(e)}")
    
    def predict_batch(self, data_list: List[List[float]]) -> Dict:
        """
        Batch predict anomalies for multiple time series.
        
        Args:
            data_list: List of time series data points
            
        Returns:
            Dict with predictions for each sequence
        """
        print(f"🔄 Starting batch prediction for {len(data_list)} sequences...")
        results = {}
        try:
            for i, data_point in enumerate(data_list):
                print(f"📊 Processing sequence {i+1}/{len(data_list)}...")
                scores, labels = self.predict(np.array(data_point))
                results[f"sequence_{i}"] = {
                    "scores": scores,
                    "labels": labels,
                    "is_anomalous": max(labels) == 1
                }
            print("✅ Batch prediction completed successfully!")
            return {
                "status": "success",
                "predictions": results,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Batch prediction failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def set_threshold(self, threshold: float):
        """Set custom anomaly detection threshold."""
        if 0 <= threshold <= 1:
            self.threshold = threshold
        else:
            raise ValueError("Threshold must be between 0 and 1")
    
    def get_model_info(self) -> Dict:
        """Get information about the trained model."""
        return {
            "is_trained": self.is_trained,
            "model_path": self.model_path,
            "scaler_path": self.scaler_path,
            "threshold": self.threshold,
            "model_type": "IsolationForest",
            "timestamp": datetime.now().isoformat()
        }


# Initialize global model instance
model_instance = None


def get_model() -> AnomalyDetectionModel:
    """Get or create the global model instance."""
    global model_instance
    if model_instance is None:
        model_instance = AnomalyDetectionModel()
    return model_instance


def load_model() -> AnomalyDetectionModel:
    """Load the model from disk if it exists."""
    print("🔄 Initializing model...")
    model = get_model()
    if os.path.exists(model.model_path) and os.path.exists(model.scaler_path):
        print("📂 Loading trained model from disk...")
        model.model = joblib.load(model.model_path)
        model.scaler = joblib.load(model.scaler_path)
        model.is_trained = True
        print("✅ Model loaded successfully and ready for predictions!")
    else:
        print("⚠️  No pre-trained model found. Model needs to be trained first.")
    return model


# Demo script to test the model
if __name__ == "__main__":
    print("=" * 60)
    print("🤖 ANOMALY DETECTION MODEL - DEMO")
    print("=" * 60)
    print()
    
    # Create model instance
    model = AnomalyDetectionModel()
    
    # Generate sample training data
    print("📝 Generating sample training data...")
    np.random.seed(42)
    normal_data = np.random.normal(loc=50, scale=10, size=100)
    anomalies = np.random.uniform(low=0, high=20, size=10)
    training_data = np.concatenate([normal_data, anomalies])
    np.random.shuffle(training_data)
    print(f"   Generated {len(training_data)} data points")
    print()
    
    # Train the model
    print("=" * 60)
    print("🎯 TRAINING PHASE")
    print("=" * 60)
    result = model.train(training_data, contamination=0.1)
    print()
    print(f"📊 Training Results:")
    print(f"   Status: {result['status']}")
    print(f"   Samples: {result['samples_trained']}")
    print(f"   Mean Score: {result['mean_score']:.4f}")
    print(f"   Max Score: {result['max_score']:.4f}")
    print(f"   Min Score: {result['min_score']:.4f}")
    print()
    
    # Generate test data
    print("=" * 60)
    print("🧪 TESTING PHASE")
    print("=" * 60)
    test_data = np.array([45, 50, 55, 5, 48, 52, 100, 51])  # 5 and 100 are anomalies
    print(f"📝 Test data: {test_data}")
    print()
    
    # Make predictions
    scores, labels = model.predict(test_data)
    print()
    print("📊 Prediction Results:")
    for i, (value, score, label) in enumerate(zip(test_data, scores, labels)):
        status = "🚨 ANOMALY" if label == 1 else "✅ NORMAL"
        print(f"   Point {i+1}: Value={value:6.2f}, Score={score:6.4f}, {status}")
    print()
    
    # Batch prediction demo
    print("=" * 60)
    print("📦 BATCH PREDICTION")
    print("=" * 60)
    batch_data = [
        [48, 52, 49, 51],
        [10, 5, 15, 8],
        [45, 100, 50, 48]
    ]
    batch_results = model.predict_batch(batch_data)
    print()
    print("📊 Batch Results:")
    for seq_name, result in batch_results['predictions'].items():
        print(f"   {seq_name}: {'🚨 Contains anomalies' if result['is_anomalous'] else '✅ All normal'}")
    print()
    
    # Model info
    print("=" * 60)
    print("ℹ️  MODEL INFORMATION")
    print("=" * 60)
    info = model.get_model_info()
    print(f"   Trained: {info['is_trained']}")
    print(f"   Type: {info['model_type']}")
    print(f"   Threshold: {info['threshold']}")
    print()
    
    print("=" * 60)
    print("✅ Demo completed successfully!")
    print("=" * 60)
