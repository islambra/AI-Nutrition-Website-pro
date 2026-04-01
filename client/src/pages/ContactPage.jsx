import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, User, MessageSquare, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="contact-v2-wrapper">
        <div className="contact-v2-container">
          <div className="contact-v2-header">
            <ScrollReveal direction="down">
              <span className="contact-v2-badge">Contact Us</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="contact-v2-title">Get in Touch with <span className="contact-v2-highlight">Our Experts</span></h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="contact-v2-subtitle">Have questions or want to start your journey? We're here to help.</p>
            </ScrollReveal>
          </div>

          <div className="contact-v2-content">
            {/* Info Cards */}
            <div className="contact-v2-info-grid">
              <ScrollReveal direction="left" delay={0.3}>
                <div className="contact-v2-info-card">
                  <div className="contact-v2-icon-box"><Mail size={24} /></div>
                  <h3>Email Us</h3>
                  <p>support@ainutrition.pro</p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.4}>
                <div className="contact-v2-info-card">
                  <div className="contact-v2-icon-box"><Phone size={24} /></div>
                  <h3>Call Us</h3>
                  <p>+1 (555) 000-HEALTH</p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.5}>
                <div className="contact-v2-info-card">
                  <div className="contact-v2-icon-box"><MapPin size={24} /></div>
                  <h3>Visit Us</h3>
                  <p>Innovation Hub, Tech District, NY</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Form Section */}
            <ScrollReveal direction="right" delay={0.3} className="contact-v2-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-v2-form">
                <div className="contact-v2-form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="contact-v2-input-wrapper">
                    <User className="contact-v2-input-icon" size={18} />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="contact-v2-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="contact-v2-input-wrapper">
                    <Mail className="contact-v2-input-icon" size={18} />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="contact-v2-form-group">
                  <label htmlFor="subject">Subject</label>
                  <div className="contact-v2-input-wrapper">
                    <Globe className="contact-v2-input-icon" size={18} />
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="contact-v2-form-group">
                  <label htmlFor="message">Message</label>
                  <div className="contact-v2-input-wrapper contact-v2-textarea-wrapper">
                    <MessageSquare className="contact-v2-input-icon top" size={18} />
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here..."
                      rows="5"
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="contact-v2-submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <Send size={18} />}
                </button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default ContactPage;
