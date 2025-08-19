import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Faq.css';

function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "How does Smart Transport work?",
      answer: "Smart Transport is a smart transport platform that helps you plan your journeys efficiently. It combines real-time location tracking, route optimization, and public transport schedules to provide you with the best travel options."
    },
    {
      question: "Is my location data secure?",
      answer: "Yes, your privacy is our priority. We only access your location when you're actively using the app, and all data is encrypted. We never share your personal information with third parties without your consent."
    },
    {
      question: "How accurate are the arrival predictions?",
      answer: "Our arrival predictions are based on real-time traffic data and historical patterns. While we strive for maximum accuracy, times may vary slightly due to unexpected traffic conditions or weather events."
    },
    {
      question: "Can I save my frequent routes?",
      answer: "Yes! Once you create an account, you can save your favorite routes and get quick access to them. You'll also receive personalized alerts for your saved routes."
    },
    {
      question: "What happens if a bus or train is delayed?",
      answer: "Our system monitors transport services in real-time. If there's a delay, you'll receive immediate notifications through the app, along with alternative route suggestions if available."
    },
    {
      question: "Is Smart Transport available offline?",
      answer: "While some basic features work offline, you'll need an internet connection for real-time updates, route planning, and live tracking features."
    },
    {
      question: "How do I report an issue with a service?",
      answer: "You can report issues through the app's feedback feature or contact our support team through the Contact Us page. We take all reports seriously and work with transport providers to improve service quality."
    },
    {
      question: "Are wheelchair accessible routes available?",
      answer: "Yes, we provide accessibility information for all routes and stops. You can filter your search results to show only wheelchair-accessible options."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <nav className="faq-nav">
        <Link to="/" className="back-link">← Back to Home</Link>
      </nav>
      
      <div className="faq-container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about UniConnect's services and features.</p>
        </div>

        <div className="faq-content">
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleAccordion(index)}
                >
                  {faq.question}
                  <span className="faq-icon">
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </button>
                <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>

          <div className="faq-contact">
            <h2>Still have questions?</h2>
            <p>Can't find the answer you're looking for? Please reach out to our support team.</p>
            <Link to="/contact" className="contact-button">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Faq;
