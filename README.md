# IWB25-200
# 🚌 Smart Public Transport Assistant

An AI-powered public transport assistant application that provides intelligent transport recommendations in Sri Lanka, featuring real-time tracking, schedule optimization, and route planning with interactive maps.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing with Postman](#testing-with-postman)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

The Smart Public Transport Assistant is a comprehensive web application designed to revolutionize public transportation in Sri Lanka. It combines real-time data processing, intelligent route planning, and user-friendly interfaces to provide the best travel experience for commuters.

### Key Capabilities:
- **Real-time Journey Planning** - Current location-based route suggestions
- **Advanced Trip Planning** - Future trip scheduling with custom dates/times
- **Interactive Maps** - OpenStreetMap integration with route visualization
- **Multi-modal Transport** - Bus and train route options
- **Smart Notifications** - Real-time alerts and delay notifications
- **AI-powered Predictions** - Intelligent delay predictions and route optimization

## ✨ Features

### Section 1: Real-Time Journey Planning
- 📍 **Automatic GPS Detection** - Continuously track user's current location
- 🔍 **Destination Search** - Autocomplete search with city suggestions
- 🚌 **Multi-Modal Results** - Bus, train, and combined transport options
- ⏱️ **Live Timetables** - Real-time schedules with delay information
- 🗺️ **Route Visualization** - Interactive map showing complete routes

### Section 2: Advanced Journey Planning
- 📅 **Future Trip Planning** - Schedule trips up to 7 days in advance
- ⏰ **Time Preferences** - Departure or arrival time options
- 🔄 **Alternative Routes** - Multiple route suggestions with comparisons
- 🔔 **Smart Notifications** - Schedule reminders and delay alerts
- 💰 **Cost Comparison** - Fare information for different transport options

## 🛠️ Technology Stack

### Backend
- **Framework**: Ballerina
- **Port**: 8083
- **Database**: Mock data (PostgreSQL ready)
- **APIs**: RESTful services with CORS support
- **Modules**: Modular architecture (alerts, auth, location, predictions, schedules, trips)

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design
- **Maps**: Leaflet with OpenStreetMap
- **HTTP Client**: Axios
- **Port**: 5175

### Additional Tools
- **Maps**: OpenStreetMap with Leaflet
- **Routing**: OSRM (Open Source Routing Machine)
- **Icons**: Emoji-based iconography
- **Responsive**: Mobile-first design approach

## 📁 Project Structure

```
IWB25-200/
├── backend/                    # Ballerina backend application
│   ├── main.bal               # Main service file with API endpoints
│   ├── Ballerina.toml         # Project configuration
│   ├── Dependencies.toml      # Dependencies configuration
│   ├── modules/               # Modular backend components
│   │   ├── alerts/            # Alert management module
│   │   ├── auth/              # Authentication module
│   │   ├── location/          # Location services module
│   │   ├── predictions/       # AI prediction module
│   │   ├── schedules/         # Schedule management module
│   │   └── trips/             # Trip planning module
│   └── target/                # Compiled files and cache
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── App.css           # Global styles
│   │   ├── components/       # React components
│   │   │   ├── DestinationSearch.jsx
│   │   │   ├── LocationTracker.jsx
│   │   │   ├── RouteMap.jsx
│   │   │   ├── TransportOptions.jsx
│   │   │   └── NotificationPanel.jsx
│   │   └── services/
│   │       └── api.js        # API service layer
│   ├── package.json          # Dependencies and scripts
│   └── vite.config.js        # Vite configuration
│
└── README.md                 # This file
```

## 📋 Prerequisites

Before running the Smart Public Transport Assistant, ensure you have the following installed:

### Backend Requirements
- **Ballerina**: Version 2201.8.0 or higher
  ```bash
  # Download from: https://ballerina.io/downloads/
  # Verify installation:
  bal version
  ```

### Frontend Requirements
- **Node.js**: Version 16.0 or higher
  ```bash
  # Download from: https://nodejs.org/
  # Verify installation:
  node --version
  npm --version
  ```

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/IWB25-200.git
cd IWB25-200
```

### 2. Backend Setup
```bash
cd backend

# Verify Ballerina installation
bal version

# Install dependencies (if any)
bal build

# The backend will compile all modules automatically
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Verify React and Vite installation
npm list react vite
```

## 🏃‍♂️ Running the Application

### Option 1: Run Both Services Simultaneously

**Terminal 1 - Backend:**
```bash
cd backend
bal run
```
🌐 Backend will start on: `http://localhost:8083`

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```
🌐 Frontend will start on: `http://localhost:5175`

### Option 2: Using Separate Commands

**Start Backend:**
```bash
cd backend
bal run main.bal
```

**Start Frontend (in another terminal):**
```bash
cd frontend
npm start
# or
npm run dev
```

### 🎉 Access the Application

Once both servers are running, open your browser and navigate to:
**http://localhost:5175**

The application will automatically connect to the backend running on port 8083.

## 📡 API Documentation

### Base URL
```
http://localhost:8083
```

### Authentication
Currently using mock authentication. JWT implementation ready for production.

### Core Endpoints

#### Location Services
```http
# Get nearby stops
GET /location/nearbyStops?lat={latitude}&lng={longitude}&radius={meters}

# Example
GET /location/nearbyStops?lat=6.9344&lng=79.8441&radius=1000
```

#### Route Planning
```http
# Get route options
GET /routes/options?fromLat={lat}&fromLng={lng}&toLat={lat}&toLng={lng}

# Example  
GET /routes/options?fromLat=6.9344&fromLng=79.8441&toLat=6.8887&toLng=79.8590
```

#### Transport Schedules
```http
# Bus schedules
GET /bus/schedule?stop_id={id}&route={route}

# Train schedules
GET /train/schedule?from_station={id}&to_station={id}
```

#### Trip Planning
```http
# Create trip plan
POST /trips/plan
Content-Type: application/json

{
    "fromLocation": "Colombo Fort",
    "toLocation": "Bambalapitiya", 
    "date": "2025-08-19",
    "time": "09:30",
    "timeType": "departure",
    "tripType": "one_way"
}
```

#### Real-time Updates
```http
# Get delays
GET /realtime/delays?transport_type={type}&route_id={id}

# Get alerts
GET /alerts

# Get predictions
GET /predictions
```

## 🧪 Testing with Postman

### Import Collection
1. Open Postman
2. Create new collection "Smart Transport API"
3. Add requests for each endpoint above

### Sample Test Requests

**1. Test Location Services:**
```http
GET http://localhost:8083/location/nearbyStops?lat=6.9344&lng=79.8441&radius=1000
```

**2. Test Route Planning:**
```http
GET http://localhost:8083/routes/options?fromLat=6.9344&fromLng=79.8441&toLat=6.8887&toLng=79.8590
```

**3. Test Trip Planning:**
```http
POST http://localhost:8083/trips/plan
Content-Type: application/json

{
    "fromLocation": "Colombo Fort",
    "toLocation": "Kandy",
    "date": "2025-08-20",
    "time": "08:00",
    "timeType": "departure",
    "tripType": "one_way"
}
```

## 🔧 Development

### Backend Development

**Build the project:**
```bash
cd backend
bal build
```

**Run tests:**
```bash
bal test
```

**Add new module:**
```bash
cd backend/modules
mkdir newmodule
cd newmodule
# Create newmodule.bal and Module.md
```

### Frontend Development

**Development server with hot reload:**
```bash
cd frontend
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Lint code:**
```bash
npm run lint
```

### Adding New Components

**Create new React component:**
```bash
cd frontend/src/components
touch NewComponent.jsx
```

**Basic component template:**
```jsx
import React from 'react';

const NewComponent = () => {
  return (
    <div className="new-component">
      <h2>New Component</h2>
    </div>
  );
};

export default NewComponent;
```

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
bal build
# Generates backend.jar in target/bin/
```

**Frontend:**
```bash
cd frontend
npm run build
# Generates dist/ folder with static files
```

### Environment Variables

Create `.env` files for different environments:

**.env (Frontend):**
```env
VITE_API_BASE_URL=http://localhost:8083
VITE_MAP_PROVIDER=openstreetmap
```

**Config.toml (Backend):**
```toml
[backend]
port = 8083
cors_origin = "http://localhost:5175"
```

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use:**
```bash
# Kill process using port 8083
netstat -ano | findstr :8083
taskkill /PID <PID_NUMBER> /F

# Kill process using port 5175  
netstat -ano | findstr :5175
taskkill /PID <PID_NUMBER> /F
```

**2. Backend Build Errors:**
```bash
cd backend
bal clean
bal build
```

**3. Frontend Package Issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**4. CORS Issues:**
- Ensure backend CORS is configured for frontend URL
- Check browser developer tools for specific CORS errors

**5. Map Not Loading:**
- Verify internet connection for map tiles
- Check browser console for Leaflet errors
- Ensure proper coordinates format

### Performance Optimization

**Backend:**
- Use connection pooling for database
- Implement caching for frequent requests
- Add request rate limiting

**Frontend:**
- Implement lazy loading for components
- Optimize images and assets
- Use React.memo for expensive components

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Fully Supported |
| Firefox | Latest | ✅ Fully Supported |
| Safari | Latest | ✅ Fully Supported |
| Edge | Latest | ✅ Fully Supported |
| IE | Any | ❌ Not Supported |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style and formatting
- Add comments for complex logic
- Write tests for new features
- Update documentation for API changes
- Test on multiple browsers before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors


## 🙏 Acknowledgments

- Ballerina team for the excellent backend framework
- OpenStreetMap contributors for map data
- React community for frontend components
- Sri Lankan transport authorities for inspiration



---

**🚌 Happy Traveling with Smart Public Transport Assistant! 🚌**
