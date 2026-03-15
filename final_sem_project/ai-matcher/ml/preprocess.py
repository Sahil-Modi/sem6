"""
Preprocessing Module for MediReach ML System
Handles feature engineering and data transformation
"""

import numpy as np
from geopy.distance import geodesic


def encode_urgency(urgency):
    """
    Encode urgency level to numerical value
    Args:
        urgency (str): Urgency level (Low, Medium, High, Critical)
    Returns:
        int: Encoded value (0-3)
    """
    mapping = {
        "Low": 0,
        "Medium": 1,
        "High": 2,
        "Critical": 3
    }
    return mapping.get(urgency, 0)


def decode_urgency(encoded_value):
    """
    Decode numerical urgency value back to label
    Args:
        encoded_value (int): Numerical urgency (0-3)
    Returns:
        str: Urgency label
    """
    mapping = {
        0: "Low",
        1: "Medium",
        2: "High",
        3: "Critical"
    }
    return mapping.get(encoded_value, "Low")


def calculate_distance(donor_coords, receiver_coords):
    """
    Calculate geodesic distance between two points
    Args:
        donor_coords (dict): {'lat': float, 'lng': float}
        receiver_coords (dict): {'lat': float, 'lng': float}
    Returns:
        float: Distance in kilometers
    """
    try:
        donor_point = (donor_coords.get('lat'), donor_coords.get('lng'))
        receiver_point = (receiver_coords.get('lat'), receiver_coords.get('lng'))
        return geodesic(donor_point, receiver_point).kilometers
    except Exception as e:
        print(f"Distance calculation error: {e}")
        return 50.0  # Default distance


def prepare_donor_features(donor, request_data):
    """
    Convert donor + request into ML feature vector
    
    Features:
    1. distance_km: Geographic distance
    2. is_available: Binary availability status
    3. completion_rate: Historical success rate
    4. total_donations: Experience metric
    5. urgent_response_rate: Urgency performance
    6. urgency_encoded: Request urgency level
    7. blood_match: Blood type compatibility
    
    Args:
        donor (dict): Donor information
        request_data (dict): Blood request information
    
    Returns:
        numpy.ndarray: Feature vector [7 features]
    """
    # Feature 1: Distance
    distance = donor.get("distance_km")
    if distance is None:
        # Calculate if not provided
        if donor.get("coordinates") and request_data.get("coordinates"):
            distance = calculate_distance(donor["coordinates"], request_data["coordinates"])
        else:
            distance = 50.0  # Default
    
    # Feature 2: Availability (binary)
    is_available = 1 if donor.get("availability", False) else 0
    
    # Feature 3: Completion rate (success ratio)
    total = donor.get("totalDonations", 0)
    completed = donor.get("completedDonations", 0)
    completion_rate = completed / total if total > 0 else 0.5  # Neutral for new donors
    
    # Feature 4: Total donations (experience)
    total_donations = total
    
    # Feature 5: Urgent response rate
    urgent_response_rate = donor.get("urgentResponseRate", 0.5)
    
    # Feature 6: Urgency encoding
    urgency_encoded = encode_urgency(request_data.get("urgency", "Low"))
    
    # Feature 7: Blood type match (binary)
    blood_match = 1 if donor.get("bloodGroup") == request_data.get("bloodGroup") else 0
    
    # Return feature vector
    return np.array([
        distance,
        is_available,
        completion_rate,
        total_donations,
        urgent_response_rate,
        urgency_encoded,
        blood_match
    ])


def extract_text_features(description, units=1):
    """
    Extract features from text description for urgency prediction
    Args:
        description (str): Request description
        units (int): Number of blood units requested
    Returns:
        dict: Extracted features
    """
    desc_lower = description.lower()
    
    features = {
        'description': description,
        'units': units,
        'length': len(description),
        'word_count': len(description.split()),
        'has_emergency': int('emergency' in desc_lower),
        'has_critical': int('critical' in desc_lower),
        'has_urgent': int('urgent' in desc_lower),
        'has_immediately': int('immediately' in desc_lower or 'immediate' in desc_lower),
    }
    
    return features


def get_feature_names():
    """
    Get standardized feature names for donor matching model
    Returns:
        list: Feature names in correct order
    """
    return [
        'distance_km',
        'is_available',
        'completion_rate',
        'total_donations',
        'urgent_response_rate',
        'urgency_encoded',
        'blood_match'
    ]


def validate_donor_features(features):
    """
    Validate and clip feature values to expected ranges
    Args:
        features (np.ndarray): Feature vector
    Returns:
        np.ndarray: Validated feature vector
    """
    validated = features.copy()
    
    # Distance: 0-500 km
    validated[0] = np.clip(validated[0], 0, 500)
    
    # is_available: 0 or 1
    validated[1] = np.clip(validated[1], 0, 1)
    
    # completion_rate: 0-1
    validated[2] = np.clip(validated[2], 0, 1)
    
    # total_donations: 0-100
    validated[3] = np.clip(validated[3], 0, 100)
    
    # urgent_response_rate: 0-1
    validated[4] = np.clip(validated[4], 0, 1)
    
    # urgency_encoded: 0-3
    validated[5] = np.clip(validated[5], 0, 3)
    
    # blood_match: 0 or 1
    validated[6] = np.clip(validated[6], 0, 1)
    
    return validated
