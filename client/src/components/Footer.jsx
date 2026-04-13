// src/components/Footer.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>About AI-Nutrition</h3>
          <p>Your partner in personalized dietary assessment and AI-assisted calorie tracking for a healthier, happier life.</p>
          <div className="contact-info">
            <span><i className="fa-solid fa-phone"></i> +123 456 7890</span>
            <span><i className="fa-solid fa-envelope"></i> info@ainutrition.com</span>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About Us</NavLink></li>
            <li><NavLink to="/services">Services</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/signup">Sign Up</NavLink></li>
          </ul>
        </div>

        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" className="fa-brands fa-facebook-f"></a>
            <a href="#" className="fa-brands fa-twitter"></a>
            <a href="#" className="fa-brands fa-instagram"></a>
            <a href="#" className="fa-brands fa-linkedin-in"></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} AI-Nutrition. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
