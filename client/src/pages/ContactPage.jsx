import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, User, MessageSquare, Globe, Leaf, ArrowUpRight, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { submitContact } from '../api/contactApi';
import './ContactPage.css';

// --- ORGANIC FLOATERS ---
const ContactOrganicFloaters = memo(() => (
  <div className="ContactPage-Organic-Container">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="ContactPage-Floater"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.1, 0], 
          x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
          y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
        }}
        transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "linear" }}
      >
        <Leaf size={40 + i * 20} strokeWidth={1} />
      </motion.div>
    ))}
  </div>
));

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

    const loadingToast = toast.loading('Establishing connection...', {
      position: 'top-center',
      style: { fontFamily: 'Outfit', fontSize: '12px' }
    });

    try {
      const response = await submitContact(formData);
      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success('TRANSMISSION SUCCESSFUL', {
          duration: 4000,
          position: 'top-center',
          icon: '🛰️',
          style: { fontFamily: 'Outfit', fontSize: '12px' }
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.message || 'TRANSMISSION FAILED', {
          duration: 5000,
          position: 'top-center',
          style: { fontFamily: 'Outfit', fontSize: '12px' }
        });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('BIO LINK INTERRUPTED', {
        duration: 5000,
        position: 'top-center',
        style: { fontFamily: 'Outfit', fontSize: '12px' }
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type.toUpperCase()} COPIED`, {
      duration: 2000,
      icon: <Copy size={14} />,
      position: 'top-center',
      style: { fontFamily: 'Outfit', fontSize: '12px' }
    });
  };

  return (
    <PageTransition>
      <div className="ContactPage-Wrapper">
        <ContactOrganicFloaters />
        <div className="ContactPage-Grid-Overlay" />

        <div className="ContactPage-Container">
          <div className="ContactPage-Header">
            <ScrollReveal direction="down">
              <span className="ContactPage-Badge">COMMUNICATION LINK</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="ContactPage-Title">CONNECT WITH <span className="ContactPage-Highlight">VITAL EXPERTS</span></h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="ContactPage-Subtitle">Initiate a direct dialogue with our nutritional architects to optimize your biological trajectory.</p>
            </ScrollReveal>
          </div>

          <div className="ContactPage-Content">
            {/* Info Cards */}
            <div className="ContactPage-Info-Grid">
              <ScrollReveal direction="left" delay={0.3}>
                <div className="ContactPage-Info-Card">
                  <div className="ContactPage-Icon-Box"><Mail size={24} /></div>
                  <h3>EMAIL ENDPOINT</h3>
                  <p>support@ainutrition.pro</p>
                  <button 
                    onClick={() => copyToClipboard('support@ainutrition.pro', 'Email')}
                    className="ContactPage-Copy-Btn"
                  >
                    COPY ADDRESS
                  </button>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.4}>
                <div className="ContactPage-Info-Card">
                  <div className="ContactPage-Icon-Box"><Phone size={24} /></div>
                  <h3>VOICE CHANNEL</h3>
                  <p>+1 (555) 000-HEALTH</p>
                  <button 
                    onClick={() => copyToClipboard('+1 (555) 000-HEALTH', 'Phone')}
                    className="ContactPage-Copy-Btn"
                  >
                    COPY NUMBER
                  </button>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.5}>
                <div className="ContactPage-Info-Card">
                  <div className="ContactPage-Icon-Box"><MapPin size={24} /></div>
                  <h3>CORE LOCATION</h3>
                  <p>Innovation Hub, Tech District, NY</p>
                  <button 
                    onClick={() => copyToClipboard('Innovation Hub, Tech District, NY', 'Location')}
                    className="ContactPage-Copy-Btn"
                  >
                    COPY COORDS
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* Form Section */}
            <ScrollReveal direction="right" delay={0.3} className="ContactPage-Form-Wrapper">
              <form onSubmit={handleSubmit} className="ContactPage-Form">
                <div className="ContactPage-Form-Group">
                  <label htmlFor="name">FULL NAME</label>
                  <div className="ContactPage-Input-Wrapper">
                    <User className="ContactPage-Input-Icon" size={18} />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="IDENTIFY YOURSELF"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="ContactPage-Form-Group">
                  <label htmlFor="email">EMAIL ADDRESS</label>
                  <div className="ContactPage-Input-Wrapper">
                    <Mail className="ContactPage-Input-Icon" size={18} />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="CONTACT ENDPOINT"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="ContactPage-Form-Group">
                  <label htmlFor="subject">SUBJECT VECTOR</label>
                  <div className="ContactPage-Input-Wrapper">
                    <Globe className="ContactPage-Input-Icon" size={18} />
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="INQUIRY TYPE"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="ContactPage-Form-Group">
                  <label htmlFor="message">MESSAGE BODY</label>
                  <div className="ContactPage-Input-Wrapper ContactPage-Textarea-Wrapper">
                    <MessageSquare className="ContactPage-Input-Icon top" size={18} />
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="TRANSMIT YOUR THOUGHTS"
                      rows="5"
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="ContactPage-Submit-Btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="ContactPage-Spinner"></span>
                      SYNCING
                    </>
                  ) : (
                    <>
                      INITIATE TRANSMISSION
                      <Send size={18} />
                    </>
                  )}
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
