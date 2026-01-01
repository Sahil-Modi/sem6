# MediReach AI Donor Matcher Service

AI-powered microservice for intelligent donor-receiver matching using machine learning algorithms.

## Features

- **Distance-Based Matching**: Uses geolocation to find nearest donors
- **Reliability Scoring**: Tracks donor performance and completion rates
- **Urgency Prioritization**: Prioritizes critical requests automatically
- **Smart Ranking Algorithm**: Combines multiple factors with weighted scoring

## Setup

### 1. Install Python Dependencies

```bash
cd ai-matcher
pip install -r requirements.txt
```

### 2. Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```http
GET /health
```

### 2. Match Donors
```http
POST /api/match-donors
Content-Type: application/json

{
  "donors": [
    {
      "id": "donor123",
      "name": "John Doe",
      "bloodGroup": "O+",
      "location": "Mumbai",
      "coordinates": {"lat": 19.076, "lng": 72.877},
      "availability": true,
      "totalDonations": 5,
      "completedDonations": 4
    }
  ],
  "request": {
    "type": "Blood",
    "urgency": "High",
    "location": "Mumbai",
    "coordinates": {"lat": 19.080, "lng": 72.880}
  },
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "totalDonors": 50,
  "matchesFound": 10,
  "topMatches": [
    {
      "id": "donor123",
      "name": "John Doe",
      "matchScore": 95.5,
      "distance": 2.3,
      "reliability": 80.0
    }
  ]
}
```

### 3. Predict Urgency
```http
POST /api/predict-urgency
Content-Type: application/json

{
  "description": "Patient in critical condition needs blood immediately"
}
```

### 4. Calculate Distance
```http
POST /api/calculate-distance
Content-Type: application/json

{
  "point1": {"lat": 19.076, "lng": 72.877},
  "point2": {"lat": 19.080, "lng": 72.880}
}
```

## Algorithm

The matching algorithm uses a weighted scoring system:

- **Distance (50%)**: Proximity to receiver
- **Availability (25%)**: Current availability status
- **Reliability (15%)**: Past performance and completion rate
- **Urgency Bonus (10%)**: Response rate for urgent requests

### Scoring Formula
```
Match Score = (Distance × 0.50) + (Availability × 0.25) + (Reliability × 0.15) + (Urgency × 0.10)
```

## Integration with React Frontend

Update your React app to use this service:

```javascript
const matchDonors = async (donors, requestData) => {
  const response = await fetch('http://localhost:5000/api/match-donors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      donors: donors,
      request: requestData,
      limit: 10
    })
  });
  
  const data = await response.json();
  return data.topMatches;
};
```

## Future Enhancements

- Machine Learning model for urgency prediction using TensorFlow
- Real-time donor availability tracking
- Blood group compatibility checking
- Historical pattern analysis for better matching
- Multi-language NLP support for descriptions

## License

MIT License - MediReach Project
