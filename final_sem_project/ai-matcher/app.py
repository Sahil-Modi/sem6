"""
MediReach AI Donor Matcher Service
A Flask microservice for intelligent donor-receiver matching using ML algorithms

Version 2.0: Production ML System
- XGBoost for donor matching
- TF-IDF + Logistic Regression for urgency prediction
- Real-time inference with trained models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from geopy.distance import geodesic
from datetime import datetime
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ML Model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml')
DONOR_MODEL_PATH = os.path.join(MODEL_DIR, 'donor_model.pkl')
URGENCY_MODEL_PATH = os.path.join(MODEL_DIR, 'urgency_model.pkl')
FEATURES_PATH = os.path.join(MODEL_DIR, 'feature_columns.pkl')

# Load ML models at startup
print("🤖 Loading ML models...")
try:
    from ml.preprocess import prepare_donor_features, encode_urgency
    
    if os.path.exists(DONOR_MODEL_PATH):
        donor_model = joblib.load(DONOR_MODEL_PATH)
        print("✓ Donor matching model loaded")
        USE_ML_DONOR = True
    else:
        print("⚠️  Donor model not found - using fallback rule-based system")
        USE_ML_DONOR = False
        donor_model = None
    
    if os.path.exists(URGENCY_MODEL_PATH):
        urgency_model = joblib.load(URGENCY_MODEL_PATH)
        print("✓ Urgency prediction model loaded")
        USE_ML_URGENCY = True
    else:
        print("⚠️  Urgency model not found - using fallback rule-based system")
        USE_ML_URGENCY = False
        urgency_model = None
        
except Exception as e:
    print(f"❌ Error loading models: {e}")
    print("⚠️  Falling back to rule-based systems")
    USE_ML_DONOR = False
    USE_ML_URGENCY = False
    donor_model = None
    urgency_model = None


class DonorMatcher:
    """
    AI-powered donor matching algorithm
    Considers: Distance, Availability, Urgency, Past Performance
    """
    
    def __init__(self):
        self.weights = {
            'distance': 0.50,      # 50% weight to proximity
            'availability': 0.25,  # 25% weight to availability
            'reliability': 0.15,   # 15% weight to past performance
            'urgency_bonus': 0.10  # 10% weight to urgency match
        }
    
    def calculate_distance_score(self, donor_coords, receiver_coords, max_distance=100):
        """
        Calculate score based on distance (closer = higher score)
        Args:
            donor_coords: tuple (lat, lng)
            receiver_coords: tuple (lat, lng)
            max_distance: maximum distance in km for scoring
        Returns:
            float: score between 0 and 1
        """
        if not donor_coords or not receiver_coords:
            return 0.0
        
        try:
            distance = geodesic(donor_coords, receiver_coords).kilometers
            # Inverse exponential decay - closer donors get much higher scores
            score = np.exp(-distance / (max_distance / 3))
            return min(score, 1.0)
        except Exception as e:
            print(f"Distance calculation error: {e}")
            return 0.0
    
    def calculate_availability_score(self, donor):
        """
        Score based on donor's availability status
        """
        if donor.get('availability', False):
            return 1.0
        return 0.2  # Still consider unavailable donors but with low score
    
    def calculate_reliability_score(self, donor):
        """
        Score based on donor's past performance
        Uses donation history to calculate reliability
        """
        total_donations = donor.get('totalDonations', 0)
        completed_donations = donor.get('completedDonations', 0)
        
        if total_donations == 0:
            return 0.5  # Neutral score for new donors
        
        completion_rate = completed_donations / total_donations
        
        # Bonus for experienced donors
        experience_bonus = min(total_donations * 0.05, 0.3)
        
        return min(completion_rate + experience_bonus, 1.0)
    
    def calculate_urgency_bonus(self, request_urgency, donor):
        """
        Bonus score for donors who respond well to urgent requests
        """
        if request_urgency in ['Critical', 'High']:
            # Prefer donors with good urgent response history
            urgent_response_rate = donor.get('urgentResponseRate', 0.5)
            return urgent_response_rate
        return 0.5
    
    def calculate_match_score(self, donor, request_data):
        """
        Calculate overall match score for a donor-request pair
        Returns:
            float: composite score between 0 and 1
        """
        receiver_coords = request_data.get('coordinates')
        donor_coords = donor.get('coordinates')
        
        # Get coordinates as tuples
        if receiver_coords:
            receiver_coords = (receiver_coords.get('lat'), receiver_coords.get('lng'))
        if donor_coords:
            donor_coords = (donor_coords.get('lat'), donor_coords.get('lng'))
        
        # Calculate individual scores
        distance_score = self.calculate_distance_score(donor_coords, receiver_coords)
        availability_score = self.calculate_availability_score(donor)
        reliability_score = self.calculate_reliability_score(donor)
        urgency_score = self.calculate_urgency_bonus(request_data.get('urgency'), donor)
        
        # Calculate weighted composite score
        total_score = (
            distance_score * self.weights['distance'] +
            availability_score * self.weights['availability'] +
            reliability_score * self.weights['reliability'] +
            urgency_score * self.weights['urgency_bonus']
        )
        
        return total_score
    
    def rank_donors(self, donors, request_data):
        """
        Rank donors based on match score
        Returns:
            list: sorted list of donors with match scores
        """
        ranked_donors = []
        
        for donor in donors:
            score = self.calculate_match_score(donor, request_data)
            
            # Add distance info if coordinates available
            distance = None
            if request_data.get('coordinates') and donor.get('coordinates'):
                try:
                    receiver_coords = (
                        request_data['coordinates']['lat'],
                        request_data['coordinates']['lng']
                    )
                    donor_coords = (
                        donor['coordinates']['lat'],
                        donor['coordinates']['lng']
                    )
                    distance = geodesic(receiver_coords, donor_coords).kilometers
                except:
                    pass
            
            ranked_donors.append({
                'id': donor.get('id'),
                'name': donor.get('name'),
                'bloodGroup': donor.get('bloodGroup'),
                'location': donor.get('location'),
                'phone': donor.get('phone'),
                'availability': donor.get('availability'),
                'matchScore': round(score * 100, 2),  # Convert to percentage
                'distance': round(distance, 2) if distance else None,
                'reliability': round(self.calculate_reliability_score(donor) * 100, 2)
            })
        
        # Sort by match score (highest first)
        ranked_donors.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return ranked_donors


# Initialize matcher
matcher = DonorMatcher()


@app.route('/', methods=['GET'])
def home():
    """Root endpoint - API information"""
    return jsonify({
        'service': 'MediReach AI Donor Matcher',
        'version': '2.0.0',
        'status': 'running',
        'mlModels': {
            'donorMatching': USE_ML_DONOR,
            'urgencyPrediction': USE_ML_URGENCY
        },
        'endpoints': {
            'health': '/health',
            'matchDonors': '/api/match-donors',
            'predictUrgency': '/api/predict-urgency',
            'calculateDistance': '/api/calculate-distance'
        },
        'documentation': 'See ML_PRODUCTION_GUIDE.md for API documentation'
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with ML model status"""
    return jsonify({
        'status': 'healthy',
        'service': 'MediReach AI Donor Matcher',
        'version': '2.0.0',
        'mlModels': {
            'donorMatching': {
                'enabled': USE_ML_DONOR,
                'type': 'XGBoost Classifier' if USE_ML_DONOR else 'Rule-Based',
                'status': 'active' if USE_ML_DONOR else 'fallback'
            },
            'urgencyPrediction': {
                'enabled': USE_ML_URGENCY,
                'type': 'TF-IDF + Logistic Regression' if USE_ML_URGENCY else 'Rule-Based',
                'status': 'active' if USE_ML_URGENCY else 'fallback'
            }
        },
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/match-donors', methods=['POST'])
def match_donors():
    """
    Match donors to a request using ML model or fallback rule-based system
    
    Request body:
    {
        "donors": [...],  // Array of donor objects
        "request": {      // Request details
            "type": "Blood",
            "urgency": "High",
            "location": "Mumbai",
            "coordinates": {"lat": 19.076, "lng": 72.877},
            "bloodGroup": "A+"
        },
        "limit": 10  // Optional: number of top matches to return
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        donors = data.get('donors', [])
        request_data = data.get('request', {})
        limit = data.get('limit', 10)
        
        if not donors:
            return jsonify({'error': 'No donors provided'}), 400
        
        if not request_data:
            return jsonify({'error': 'No request data provided'}), 400
        
        ranked_donors = []
        
        # ML-based matching
        if USE_ML_DONOR and donor_model:
            print(f"🤖 Using ML model for {len(donors)} donors")
            
            for donor in donors:
                try:
                    # Calculate distance
                    if request_data.get('coordinates') and donor.get('coordinates'):
                        receiver_coords = (
                            request_data['coordinates']['lat'],
                            request_data['coordinates']['lng']
                        )
                        donor_coords = (
                            donor['coordinates']['lat'],
                            donor['coordinates']['lng']
                        )
                        distance = geodesic(receiver_coords, donor_coords).kilometers
                        donor['distance_km'] = distance
                    else:
                        distance = 50.0  # Default distance
                        donor['distance_km'] = distance
                    
                    # Prepare features
                    features = prepare_donor_features(donor, request_data)
                    
                    # Get ML prediction probability
                    prob = donor_model.predict_proba([features])[0][1]  # Probability of success
                    
                    ranked_donors.append({
                        'id': donor.get('id'),
                        'name': donor.get('name'),
                        'bloodGroup': donor.get('bloodGroup'),
                        'location': donor.get('location'),
                        'phone': donor.get('phone'),
                        'availability': donor.get('availability'),
                        'matchScore': round(prob * 100, 2),  # ML probability as percentage
                        'matchProbability': round(prob, 4),
                        'distance': round(distance, 2),
                        'reliability': round((donor.get('completedDonations', 0) / 
                                            max(donor.get('totalDonations', 1), 1)) * 100, 2),
                        'method': 'ML'
                    })
                except Exception as e:
                    print(f"Error processing donor {donor.get('id')}: {e}")
                    continue
            
            # Sort by match probability (highest first)
            ranked_donors.sort(key=lambda x: x['matchProbability'], reverse=True)
            
        else:
            # Fallback to rule-based system
            print(f"⚙️  Using rule-based system for {len(donors)} donors")
            ranked_donors = matcher.rank_donors(donors, request_data)
        
        # Return top matches
        top_matches = ranked_donors[:limit]
        
        return jsonify({
            'success': True,
            'totalDonors': len(donors),
            'matchesFound': len(top_matches),
            'topMatches': top_matches,
            'requestDetails': {
                'type': request_data.get('type'),
                'urgency': request_data.get('urgency'),
                'location': request_data.get('location'),
                'bloodGroup': request_data.get('bloodGroup')
            },
            'matchingMethod': 'ML' if USE_ML_DONOR else 'Rule-Based',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in match_donors: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/predict-urgency', methods=['POST'])
def predict_urgency():
    """
    ML-based urgency prediction with fallback to rule-based system
    Analyzes request descriptions to predict urgency level with confidence scores
    """
    try:
        data = request.get_json()
        description = data.get('description', '')
        units = data.get('units', 1)
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # ML-based prediction
        if USE_ML_URGENCY and urgency_model:
            print("🤖 Using ML model for urgency prediction")
            
            try:
                # Get prediction
                predicted_urgency = urgency_model.predict([description])[0]
                probabilities = urgency_model.predict_proba([description])[0]
                confidence = float(max(probabilities))
                
                # Get all class probabilities
                classes = urgency_model.classes_
                class_probabilities = {
                    class_name: float(prob) 
                    for class_name, prob in zip(classes, probabilities)
                }
                
                # Generate recommendation based on prediction
                recommendations = {
                    'Critical': {
                        'message': 'Immediate action required. Notify all available donors within 10km radius.',
                        'radius': 50,
                        'priority': 'immediate',
                        'response_time': '< 1 hour'
                    },
                    'High': {
                        'message': 'Urgent attention needed. Prioritize donor notifications.',
                        'radius': 25,
                        'priority': 'high',
                        'response_time': '< 6 hours'
                    },
                    'Medium': {
                        'message': 'Standard processing. Notify donors within 24 hours.',
                        'radius': 15,
                        'priority': 'normal',
                        'response_time': '< 24 hours'
                    },
                    'Low': {
                        'message': 'Routine request. Standard notification schedule.',
                        'radius': 10,
                        'priority': 'routine',
                        'response_time': '< 48 hours'
                    }
                }
                
                rec = recommendations.get(predicted_urgency, recommendations['Low'])
                
                return jsonify({
                    'success': True,
                    'predictedUrgency': predicted_urgency,
                    'confidence': round(confidence, 3),
                    'classProbabilities': class_probabilities,
                    'recommendation': rec['message'],
                    'suggestedActions': {
                        'notificationRadius': rec['radius'],
                        'priorityLevel': rec['priority'],
                        'estimatedResponseTime': rec['response_time']
                    },
                    'method': 'ML',
                    'modelInfo': {
                        'type': 'TF-IDF + Logistic Regression',
                        'classes': list(classes)
                    }
                })
                
            except Exception as e:
                print(f"ML prediction error: {e}, falling back to rule-based")
                # Fall through to rule-based system
        
        # Fallback to rule-based prediction
        print("⚙️  Using rule-based system for urgency prediction")
        description_lower = description.lower()
        
        # Enhanced keyword dictionary with medical terminology
        critical_keywords = {
            'emergency': 3,
            'critical': 3,
            'immediately': 3,
            'dying': 4,
            'life-threatening': 4,
            'severe': 3,
            'hemorrhage': 4,
            'bleeding': 3,
            'accident': 3,
            'trauma': 3,
            'surgery': 2,
            'intensive care': 3,
            'icu': 3,
            'code red': 4,
            'cardiac': 3,
            'stroke': 3,
            'anemia': 2,
            'transfusion': 2,
            'massive blood loss': 4,
            'shock': 3,
            'organ failure': 4
        }
        
        high_keywords = {
            'urgent': 2,
            'soon': 2,
            'quickly': 2,
            'asap': 2,
            'important': 1,
            'needed': 1,
            'serious': 2,
            'hospital': 1,
            'operation': 2,
            'scheduled surgery': 2,
            'planned procedure': 1,
            'chemotherapy': 2,
            'dialysis': 2,
            'treatment': 1,
            'pre-operative': 2,
            'post-operative': 2,
            'tomorrow': 2,
            'today': 3,
            'tonight': 3
        }
        
        medium_keywords = {
            'required': 1,
            'need': 1,
            'help': 1,
            'please': 1,
            'next week': 1,
            'few days': 1,
            'scheduled': 1,
            'elective': 1,
            'planned': 1
        }
        
        # Calculate weighted urgency score
        urgency_score = 0
        matched_keywords = []
        
        # Check critical keywords
        for keyword, weight in critical_keywords.items():
            if keyword in description_lower:
                urgency_score += weight
                matched_keywords.append((keyword, 'critical', weight))
        
        # Check high keywords
        for keyword, weight in high_keywords.items():
            if keyword in description_lower:
                urgency_score += weight
                matched_keywords.append((keyword, 'high', weight))
        
        # Check medium keywords
        for keyword, weight in medium_keywords.items():
            if keyword in description_lower:
                urgency_score += weight
                matched_keywords.append((keyword, 'medium', weight))
        
        # Additional factors
        # Large unit requests typically indicate urgency
        if units >= 5:
            urgency_score += 2
            matched_keywords.append(('large quantity', 'factor', 2))
        elif units >= 3:
            urgency_score += 1
            matched_keywords.append(('moderate quantity', 'factor', 1))
        
        # Time-based indicators
        time_indicators = ['hours', 'hour', 'minutes', 'now']
        for indicator in time_indicators:
            if indicator in description_lower:
                urgency_score += 2
                matched_keywords.append((indicator, 'time-critical', 2))
                break
        
        # Negative indicators (reduce urgency)
        non_urgent_keywords = ['routine', 'regular', 'checkup', 'preventive', 'scheduled for next month']
        for keyword in non_urgent_keywords:
            if keyword in description_lower:
                urgency_score = max(0, urgency_score - 2)
                matched_keywords.append((keyword, 'non-urgent', -2))
        
        # Determine urgency level with confidence
        if urgency_score >= 8:
            predicted_urgency = 'Critical'
            confidence = min(0.95, 0.7 + (urgency_score * 0.03))
            recommendation = 'Immediate action required. Notify all available donors within 10km radius.'
        elif urgency_score >= 5:
            predicted_urgency = 'High'
            confidence = min(0.85, 0.6 + (urgency_score * 0.04))
            recommendation = 'Urgent attention needed. Prioritize donor notifications.'
        elif urgency_score >= 2:
            predicted_urgency = 'Medium'
            confidence = min(0.75, 0.5 + (urgency_score * 0.05))
            recommendation = 'Standard processing. Notify donors within 24 hours.'
        else:
            predicted_urgency = 'Low'
            confidence = 0.6
            recommendation = 'Routine request. Standard notification schedule.'
        
        # Calculate feature importance
        feature_analysis = {
            'keywordMatches': len([k for k in matched_keywords if k[1] != 'factor']),
            'medicalTerminology': len([k for k in matched_keywords if k[1] == 'critical']),
            'timeIndicators': len([k for k in matched_keywords if k[1] == 'time-critical']),
            'quantityFactor': units,
            'totalScore': urgency_score
        }
        
        return jsonify({
            'success': True,
            'predictedUrgency': predicted_urgency,
            'confidence': round(confidence, 3),
            'urgencyScore': urgency_score,
            'recommendation': recommendation,
            'matchedKeywords': [{'keyword': k[0], 'category': k[1], 'weight': k[2]} for k in matched_keywords],
            'featureAnalysis': feature_analysis,
            'suggestedActions': {
                'notificationRadius': 50 if predicted_urgency == 'Critical' else 25 if predicted_urgency == 'High' else 15,
                'priorityLevel': 'immediate' if urgency_score >= 8 else 'high' if urgency_score >= 5 else 'normal',
                'estimatedResponseTime': '< 1 hour' if urgency_score >= 8 else '< 6 hours' if urgency_score >= 5 else '< 24 hours'
            },
            'method': 'Rule-Based'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/calculate-distance', methods=['POST'])
def calculate_distance():
    """
    Calculate distance between two coordinates
    """
    try:
        data = request.get_json()
        point1 = data.get('point1')  # {'lat': ..., 'lng': ...}
        point2 = data.get('point2')
        
        if not point1 or not point2:
            return jsonify({'error': 'Both points required'}), 400
        
        coords1 = (point1['lat'], point1['lng'])
        coords2 = (point2['lat'], point2['lng'])
        
        distance = geodesic(coords1, coords2).kilometers
        
        return jsonify({
            'success': True,
            'distance': round(distance, 2),
            'unit': 'kilometers'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    ml_donor_status = "✓ Loaded" if USE_ML_DONOR else "⚠ Using fallback"
    ml_urgency_status = "✓ Loaded" if USE_ML_URGENCY else "⚠ Using fallback"
    
    print(f"""
    ╔══════════════════════════════════════════════════╗
    ║   MediReach AI Donor Matcher Service v2.0       ║
    ║   Production ML System                           ║
    ║   Port: 5000                                     ║
    ╚══════════════════════════════════════════════════╝
    
    🤖 ML Models Status:
    - Donor Matching: {ml_donor_status}
    - Urgency Prediction: {ml_urgency_status}
    
    📡 Available Endpoints:
    - GET  /health                 - Health check
    - POST /api/match-donors       - Match donors to requests (ML)
    - POST /api/predict-urgency    - Predict urgency from description (ML)
    - POST /api/calculate-distance - Calculate distance between points
    
    ⚙️  Fallback: Rule-based systems active for any missing models
    """)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
