"""
MediReach AI Donor Matcher Service
A Flask microservice for intelligent donor-receiver matching using ML algorithms
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from geopy.distance import geodesic
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

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


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'MediReach AI Donor Matcher',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/match-donors', methods=['POST'])
def match_donors():
    """
    Match donors to a request using AI algorithm
    
    Request body:
    {
        "donors": [...],  // Array of donor objects
        "request": {      // Request details
            "type": "Blood",
            "urgency": "High",
            "location": "Mumbai",
            "coordinates": {"lat": 19.076, "lng": 72.877}
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
        
        # Rank donors
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
                'location': request_data.get('location')
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/predict-urgency', methods=['POST'])
def predict_urgency():
    """
    Predict urgency level based on request description (Basic NLP)
    This is a simple keyword-based classifier. Can be enhanced with ML model.
    """
    try:
        data = request.get_json()
        description = data.get('description', '').lower()
        
        # Keyword-based urgency detection
        critical_keywords = ['critical', 'emergency', 'immediately', 'urgent', 'dying', 'severe', 'life-threatening']
        high_keywords = ['soon', 'quickly', 'asap', 'important', 'needed', 'serious']
        
        urgency_score = 0
        
        for keyword in critical_keywords:
            if keyword in description:
                urgency_score += 3
        
        for keyword in high_keywords:
            if keyword in description:
                urgency_score += 1
        
        # Determine urgency level
        if urgency_score >= 6:
            predicted_urgency = 'Critical'
            confidence = 0.9
        elif urgency_score >= 3:
            predicted_urgency = 'High'
            confidence = 0.75
        elif urgency_score >= 1:
            predicted_urgency = 'Medium'
            confidence = 0.6
        else:
            predicted_urgency = 'Low'
            confidence = 0.5
        
        return jsonify({
            'success': True,
            'predictedUrgency': predicted_urgency,
            'confidence': confidence,
            'urgencyScore': urgency_score
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
    print("""
    ╔══════════════════════════════════════════════════╗
    ║   MediReach AI Donor Matcher Service Started    ║
    ║   Version: 1.0.0                                 ║
    ║   Port: 5000                                     ║
    ╚══════════════════════════════════════════════════╝
    
    Available Endpoints:
    - GET  /health                 - Health check
    - POST /api/match-donors       - Match donors to requests
    - POST /api/predict-urgency    - Predict urgency from description
    - POST /api/calculate-distance - Calculate distance between points
    """)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
