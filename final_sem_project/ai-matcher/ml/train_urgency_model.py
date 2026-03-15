"""
Urgency Prediction Model Training Script
Uses TF-IDF + Logistic Regression for multi-class urgency classification
"""

import pandas as pd
import joblib
import os
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, classification_report, confusion_matrix
)
import numpy as np

print("=" * 60)
print("MediReach Urgency Prediction Model Training")
print("=" * 60)

# Set paths
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'urgency_training_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'urgency_model.pkl')

print(f"\n📁 Loading data from: {DATA_PATH}")

# Load data
try:
    df = pd.read_csv(DATA_PATH)
    print(f"✓ Data loaded successfully: {df.shape[0]} samples, {df.shape[1]} columns")
except FileNotFoundError:
    print(f"❌ Error: Dataset not found at {DATA_PATH}")
    print("Please ensure urgency_training_data.csv exists in the data/ directory")
    exit(1)

# Display dataset info
print("\n📊 Dataset Overview:")
print(df.head())
print("\n📈 Urgency Label Distribution:")
print(df['urgency_label'].value_counts().sort_index())

# Separate features and target
X = df['description']
y = df['urgency_label']

# Display label mapping
urgency_labels = sorted(y.unique())
print(f"\n🏷️  Urgency Labels ({len(urgency_labels)}):")
for i, label in enumerate(urgency_labels):
    count = (y == label).sum()
    percentage = count / len(y) * 100
    print(f"  {i+1}. {label:10s} : {count:3d} samples ({percentage:5.1f}%)")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n  Data Split:")
print(f"  Training set: {X_train.shape[0]} samples")
print(f"  Test set: {X_test.shape[0]} samples")

# Create ML Pipeline
print("\n🤖 Building ML Pipeline...")
print("  1. TF-IDF Vectorizer (max_features=5000)")
print("  2. Logistic Regression (multi-class)")

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=5000,      # Maximum number of features
        ngram_range=(1, 2),     # Use unigrams and bigrams
        min_df=1,               # Minimum document frequency (1 for small datasets)
        max_df=1.0,             # Maximum document frequency (1.0 = no upper limit for small datasets)
        lowercase=True,
        stop_words='english'
    )),
    ('clf', LogisticRegression(
        max_iter=1000,
        multi_class='multinomial',
        solver='lbfgs',
        random_state=42,
        C=1.0                   # Regularization strength
    ))
])

# Train model
print("\n🎯 Training model...")
pipeline.fit(X_train, y_train)
print("✓ Training completed!")

# Cross-validation
print("\n🔄 Performing 5-fold cross-validation...")
# Convert Series to numpy array for type compatibility with cross_val_score
cv_scores = cross_val_score(pipeline, X.to_numpy(), y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# Make predictions
print("\n🎯 Making predictions on test set...")
y_pred = pipeline.predict(X_test)
y_pred_proba = pipeline.predict_proba(X_test)

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

print("\n📊 Model Performance Metrics:")
print(f"  Accuracy:  {accuracy:.4f}")
print(f"  Precision: {precision:.4f} (weighted)")
print(f"  Recall:    {recall:.4f} (weighted)")
print(f"  F1 Score:  {f1:.4f} (weighted)")

print("\n📋 Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=urgency_labels))

print("\n🔢 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred, labels=urgency_labels)
print("\n" + " " * 12 + "  ".join([f"{label:8s}" for label in urgency_labels]))
for i, label in enumerate(urgency_labels):
    print(f"{label:10s} : " + "  ".join([f"{cm[i][j]:8d}" for j in range(len(urgency_labels))]))

# Per-class accuracy
print("\n📊 Per-Class Accuracy:")
for i, label in enumerate(urgency_labels):
    correct = cm[i][i]
    total = cm[i].sum()
    acc = correct / total if total > 0 else 0
    print(f"  {label:10s} : {acc:.4f} ({correct}/{total})")

# Feature importance (top TF-IDF features per class)
print("\n⭐ Top Features per Urgency Class:")
vectorizer = pipeline.named_steps['tfidf']
classifier = pipeline.named_steps['clf']

feature_names = vectorizer.get_feature_names_out()

for i, label in enumerate(urgency_labels):
    print(f"\n  {label}:")
    # Get coefficients for this class
    coef = classifier.coef_[i]
    top_indices = np.argsort(coef)[-10:][::-1]
    for idx in top_indices:
        print(f"    - {feature_names[idx]:20s} : {coef[idx]:7.4f}")

# Test predictions on sample descriptions
print("\n🧪 Sample Predictions:")
test_samples = [
    "Emergency bleeding patient needs blood immediately",
    "Urgent surgery scheduled for tomorrow",
    "Routine transfusion needed for regular patient",
    "Critical accident case hemorrhaging severely"
]

for sample in test_samples:
    pred = pipeline.predict([sample])[0]
    proba = pipeline.predict_proba([sample])[0]
    confidence = max(proba)
    print(f"\n  Text: '{sample[:50]}...'")
    print(f"  Prediction: {pred} (confidence: {confidence:.3f})")

# Save model
print(f"\n💾 Saving model to: {MODEL_PATH}")
joblib.dump(pipeline, MODEL_PATH)
print("✓ Model saved successfully!")

# Model summary
print("\n" + "=" * 60)
print("✅ TRAINING COMPLETE")
print("=" * 60)
print(f"Model Type: TF-IDF + Logistic Regression")
print(f"Training Samples: {len(X_train)}")
print(f"Test Samples: {len(X_test)}")
print(f"Urgency Classes: {len(urgency_labels)}")
print(f"Best Accuracy: {accuracy:.4f}")
print(f"Best F1 Score: {f1:.4f}")
print("\n📍 Next Steps:")
print("  1. Review model performance metrics")
print("  2. Test inference with: python test_urgency_model.py")
print("  3. Deploy to Flask app for production use")
print("  4. Monitor prediction accuracy in production")
print("=" * 60)
