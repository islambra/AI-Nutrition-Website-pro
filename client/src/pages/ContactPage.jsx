import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './ContactPage.css';
import Header from '../components/Header';

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null); // Clear previous status

    try {
      // Replace with your actual backend contact form endpoint
      const response = await axios.post('YOUR_BACKEND_CONTACT_ENDPOINT', {
        name,
        email,
        subject,
        message,
      });

      console.log('Contact form submitted successfully:', response.data);
      setStatus('success');
      // Clear form fields on success
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="contact-page-container">
      <div className="contact-card">
        <h2>Contact Us</h2>
        <p className="contact-intro">
          Have a question or want to get in touch? Fill out the form below.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          {status === 'success' && (
            <p className="success-message">Your message has been sent successfully!</p>
          )}
          {status === 'error' && (
            <p className="error-message">Failed to send message. Please try again later.</p>
          )}

          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            ></textarea>
          </div>

          <button type="submit" className="contact-submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <p className="back-to-home">
          <NavLink to="/">Back to Home</NavLink>
        </p>
      </div>
    </div>
    </>
  );
}

export default ContactPage;
