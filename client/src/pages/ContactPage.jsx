import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageSquare, Leaf, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import { submitContact } from '../api/contactApi';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await submitContact(formData);
      if (response.success) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focused: { scale: 1.01 },
    blurred: { scale: 1 }
  };

  return (
    <PageTransition>
      <div className="ContactPage">
        <div className="ContactPage-Bg">
          <div className="ContactPage-Bg-Orb ContactPage-Bg-Orb--1" />
          <div className="ContactPage-Bg-Orb ContactPage-Bg-Orb--2" />
          <div className="ContactPage-Bg-Grid" />
        </div>

        <div className="ContactPage-Inner">
          <motion.div
            className="ContactPage-Left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ContactPage-Left-Content">
              <motion.div
                className="ContactPage-Logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="ContactPage-Logo-Icon">
                  <Leaf size={24} strokeWidth={1.5} />
                </div>
                <span>BiteWise</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="ContactPage-Tag">Get in touch</span>
                <h1 className="ContactPage-Title">
                  Let's start a
                  <br />
                  <span className="ContactPage-Title-Highlight">
                    conversation
                    <Sparkles size={28} className="ContactPage-Sparkle" strokeWidth={1.5} />
                  </span>
                </h1>
                <p className="ContactPage-Desc">
                  Whether you have a question about our nutrition plans, 
                  want to collaborate, or just want to say hello — we'd love to hear from you.
                </p>
              </motion.div>

              <motion.div
                className="ContactPage-Features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {[
                  { icon: Mail, text: 'We reply within 24 hours' },
                  { icon: MessageSquare, text: 'All inquiries welcome' },
                  { icon: Sparkles, text: 'Expert nutrition advice' },
                ].map((item, i) => (
                  <div key={i} className="ContactPage-Feature">
                    <div className="ContactPage-Feature-Icon">
                      <item.icon size={14} strokeWidth={2} />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="ContactPage-Right"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ContactPage-Card">
              <div className="ContactPage-Card-Header">
                <h2>Send a message</h2>
                <p>Fill in the form below and we'll get back to you.</p>
              </div>

              <form onSubmit={handleSubmit} className="ContactPage-Form">
                <div className="ContactPage-Field">
                  <label htmlFor="name">Your name</label>
                  <motion.div
                    className="ContactPage-Input"
                    variants={inputVariants}
                    animate={focusedField === 'name' ? 'focused' : 'blurred'}
                  >
                    <User size={16} strokeWidth={1.5} className="ContactPage-Input-Icon" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="email">Email address</label>
                  <motion.div
                    className="ContactPage-Input"
                    variants={inputVariants}
                    animate={focusedField === 'email' ? 'focused' : 'blurred'}
                  >
                    <Mail size={16} strokeWidth={1.5} className="ContactPage-Input-Icon" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="john@example.com"
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="subject">Subject</label>
                  <motion.div
                    className="ContactPage-Input"
                    variants={inputVariants}
                    animate={focusedField === 'subject' ? 'focused' : 'blurred'}
                  >
                    <MessageSquare size={16} strokeWidth={1.5} className="ContactPage-Input-Icon" />
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="How can we help?"
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="message">Message</label>
                  <motion.div
                    className="ContactPage-Input"
                    variants={inputVariants}
                    animate={focusedField === 'message' ? 'focused' : 'blurred'}
                  >
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tell us about your inquiry..."
                      rows="4"
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <motion.button
                  type="submit"
                  className="ContactPage-Submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  {loading ? (
                    <span className="ContactPage-Loader" />
                  ) : (
                    <>
                      Send message
                      <ArrowRight size={16} strokeWidth={2} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default ContactPage;
