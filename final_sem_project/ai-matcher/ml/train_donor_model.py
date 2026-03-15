"""
Donor Matching Model Training Script
Uses XGBoost for binary classification of successful donor matches
"""

import pandas as pd
import joblib
import os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, roc_auc_score, classification_report, confusion_matrix
)
import numpy as np

print("=" * 60)
print("MediReach Donor Matching Model Training")
print("=" * 60)

# Set paths
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'donor_training_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'donor_model.pkl')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'feature_columns.pkl')

print(f"\n📁 Loading data from: {DATA_PATH}")

# Load data
try:
    df = pd.read_csv(DATA_PATH)
    print(f"✓ Data loaded successfully: {df.shape[0]} samples, {df.shape[1]} columns")
except FileNotFoundError:
    print(f"❌ Error: Dataset not found at {DATA_PATH}")
    print("Please ensure donor_training_data.csv exists in the data/ directory")
    exit(1)

# Display dataset info
print("\n📊 Dataset Overview:")
print(df.head())
print("\n📈 Target Distribution:")
print(df['successful'].value_counts())
print(f"\nSuccess Rate: {df['successful'].mean():.2%}")

# Separate features and target
X = df.drop('successful', axis=1)
y = df['successful']

feature_names = list(X.columns)
print(f"\n🔧 Features ({len(feature_names)}):")
for i, feature in enumerate(feature_names, 1):
    print(f"  {i}. {feature}")

# Split data for training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n✂️  Data Split:")
print(f"  Training set: {X_train.shape[0]} samples")
print(f"  Test set: {X_test.shape[0]} samples")

# Initialize XGBoost model
print("\n🤖 Initializing XGBoost Classifier...")
model = XGBClassifier(
    n_estimators=200,          # Number of trees
    max_depth=5,                # Maximum tree depth
    learning_rate=0.1,          # Learning rate
    subsample=0.8,              # Subsample ratio of training instances
    colsample_bytree=0.8,       # Subsample ratio of features
    eval_metric='logloss',      # Evaluation metric
    random_state=42,
    use_label_encoder=False
)

# Train model
print("🎯 Training model...")
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)
print("✓ Training completed!")

# Cross-validation
print("\n🔄 Performing 5-fold cross-validation...")
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# Make predictions
print("\n🎯 Making predictions on test set...")
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

print("\n📊 Model Performance Metrics:")
print(f"  Accuracy:  {accuracy:.4f}")
print(f"  Precision: {precision:.4f}")
print(f"  Recall:    {recall:.4f}")
print(f"  F1 Score:  {f1:.4f}")
print(f"  ROC AUC:   {roc_auc:.4f}")

print("\n📋 Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Failed', 'Successful']))

print("\n🔢 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)
print(f"True Negatives:  {cm[0][0]}")
print(f"False Positives: {cm[0][1]}")
print(f"False Negatives: {cm[1][0]}")
print(f"True Positives:  {cm[1][1]}")

# Feature importance
print("\n⭐ Feature Importance:")
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:25s} : {row['importance']:.4f}")

# Save model
print(f"\n💾 Saving model to: {MODEL_PATH}")
joblib.dump(model, MODEL_PATH)
print("✓ Model saved successfully!")

print(f"\n💾 Saving feature names to: {FEATURES_PATH}")
joblib.dump(feature_names, FEATURES_PATH)
print("✓ Feature names saved successfully!")

# Model summary
print("\n" + "=" * 60)
print("✅ TRAINING COMPLETE")
print("=" * 60)
print(f"Model Type: XGBoost Classifier")
print(f"Training Samples: {len(X_train)}")
print(f"Test Samples: {len(X_test)}")
print(f"Features: {len(feature_names)}")
print(f"Best Accuracy: {accuracy:.4f}")
print(f"Best F1 Score: {f1:.4f}")
print("\n📍 Next Steps:")
print("  1. Review model performance metrics")
print("  2. Test inference with: python test_donor_model.py")
print("  3. Deploy to Flask app for production use")
print("  4. Monitor prediction performance in production")
print("=" * 60)
