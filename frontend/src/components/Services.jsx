import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Services.css';

function Services() {
  const services = [
    {
      id: 1,
      title: "Real-Time Bus Tracking",
      description: "Track your bus in real-time and never miss a ride. Get accurate arrival predictions and live location updates.",
      icon: "🚌",
      features: ["Live GPS tracking", "Accurate arrival times", "Route visualization"]
    },
    {
      id: 2,
      title: "Smart Route Planning",
      description: "Find the most efficient routes combining multiple transport options for your perfect journey.",
      icon: "🗺️",
      features: ["Multi-modal routing", "Alternative routes", "Walking directions"]
    },
    {
      id: 3,
      title: "Train Services",
      description: "Stay updated with train schedules, platform changes, and service updates in real-time.",
      icon: "🚂",
      features: ["Live schedules", "Platform updates", "Service alerts"]
    }
  ];

  const additionalFeatures = [
    {
      icon: "⚡",
      title: "Fast & Reliable",
      description: "Get instant updates and reliable information about your transportation options."
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access all features on the go with our responsive mobile interface."
    },
    {
      icon: "🎯",
      title: "Precise Tracking",
      description: "Know exactly where your transport is with accurate GPS tracking."
    },
    {
      icon: "💰",
      title: "Cost Effective",
      description: "Save money by finding the most efficient routes and transport options."
    }
  ];

  return (
    <div className="services-page">
      <nav className="services-nav">
        <Link to="/" className="back-link">← Back to Home</Link>
      </nav>

      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-content">
          <h1>Our Services</h1>
          <p>Discover smarter ways to travel with UniConnect's comprehensive transport solutions</p>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <ul className="feature-list">
              {service.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="learn-more">Learn More</button>
          </div>
        ))}
      </section>

      {/* Additional Features Section */}
      <section className="additional-features">
        <h2>Why Choose Smart Transport?</h2>
        <div className="features-grid">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied travelers using UniConnect every day</p>
          <div className="cta-buttons">
            <Link to="/" className="cta-button primary">Start Journey</Link>
            <Link to="/contact" className="cta-button secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;
