import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home({ onStartJourney }) {
  return (
    <div className="home-page">


      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚌</div>
            <h3>Real-Time Tracking</h3>
            <p>Know exactly where your bus is and when it will arrive</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Smart Routes</h3>
            <p>Get the fastest route combinations for your journey</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Instant Alerts</h3>
            <p>Receive updates about delays and schedule changes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access all features on the go from your phone</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>50K+</h3>
            <p>Daily Users</p>
          </div>
          <div className="stat-card">
            <h3>100+</h3>
            <p>Routes Covered</p>
          </div>
          <div className="stat-card">
            <h3>98%</h3>
            <p>Accuracy Rate</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Set Your Location</h3>
            <p>Enable location services or enter your starting point</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Choose Destination</h3>
            <p>Select where you want to go on campus</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get Routes</h3>
            <p>View available transport options and pick your route</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Track Journey</h3>
            <p>Follow your journey with real-time updates</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Campus Travel?</h2>
          <p>Join thousands of students using UniConnect every day</p>
          <button 
            className="cta-button cta-primary"
            onClick={onStartJourney}
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
