// src/pages/AboutUsPage.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './AboutUsPage.css';
// Header is typically included in App.jsx or a layout component,
// so removing it from individual pages to avoid duplication.

function AboutUsPage() {
  return (
    <div className="about-us-container">
      <div className="about-us-card">
        <h2>About AI-Nutrition-Website</h2>
        <p className="intro-text">
          Welcome to **AI-Nutrition-Website**, your dedicated platform for **Personalized Dietary Assessment and AI-Assisted Calorie Tracking**. We are committed to combating obesity and fostering healthy lifestyles through innovative technology and expert guidance.
        </p>

        <section className="mission-section">
          <h3>Our Mission</h3>
          <p>
            Our mission is to empower individuals to achieve their health and wellness goals by providing accessible, personalized nutrition solutions. We believe in a holistic approach that combines the precision of artificial intelligence with the empathy and expertise of professional nutritionists.
          </p>
        </section>

        <section className="what-we-offer-section">
          <h3>What We Offer</h3>
          <div className="feature-list">
            <div className="feature-item">
              <h4>Personalized Dietary Consultations</h4>
              <p>
                Receive customized diet plans tailored to your unique health history, dietary preferences, and specific goals, all under the professional supervision of certified nutritionists.
              </p>
            </div>
            <div className="feature-item">
              <h4>AI-Assisted Calorie Tracking</h4>
              <p>
                Utilize our cutting-edge AI-based food recognition system. Simply upload an image of your meal, and our technology will estimate its calorie content, helping you stay aware and build healthier habits.
              </p>
            </div>
            <div className="feature-item">
              <h4>Engaging Content & Community</h4>
              <p>
                Access a wealth of resources including insightful blogs, latest news, healthy recipes, and lifestyle tips. Connect with a supportive community and share your journey.
              </p>
            </div>
            <div className="feature-item">
              <h4>Structured Plans & Support</h4>
              <p>
                Explore various dietary plans, including seasonal and limited-period options, designed to fit your needs. Our platform supports you every step of the way with professional follow-ups.
              </p>
            </div>
          </div>
        </section>

        <section className="our-approach-section">
          <h3>Our Approach</h3>
          <p>
            We leverage advanced computer vision and deep learning to provide accurate calorie estimations, while always emphasizing that technology complements, rather than replaces, expert human guidance. Our platform is designed to support individuals managing weight, insulin resistance, PCOS, thyroid disorders, and more, helping them adopt sustainable, healthier lifestyles.
          </p>
        </section>

        <p className="call-to-action">
          Ready to start your journey to a healthier you? <NavLink to="/signup">Join Us Today!</NavLink>
        </p>
      </div>
    </div>
  );
}

export default AboutUsPage;
