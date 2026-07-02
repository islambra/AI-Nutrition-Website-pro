import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageSquare, Leaf, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation, Trans } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import { submitContact } from '../api/contactApi';
import './ContactPage.css';

function ContactPage() {
  const { t } = useTranslation();
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
        toast.success(t('contact.sentSuccess'));
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(response.message || t('contact.sendFailed'));
      }
    } catch (err) {
      toast.error(t('contact.somethingWrong'));
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
                <span>{t('contact.brandName')}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="ContactPage-Tag">{t('contact.tag')}</span>
                <h1 className="ContactPage-Title">
                  <Trans i18nKey="contact.title">
                    Let's start a<br /><span>conversation</span>
                  </Trans>
                  <Sparkles size={28} className="ContactPage-Sparkle" strokeWidth={1.5} />
                </h1>
                <p className="ContactPage-Desc">
                  {t('contact.desc')}
                </p>
              </motion.div>

              <motion.div
                className="ContactPage-Features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {[
                  { icon: Mail, text: t('contact.featureReply') },
                  { icon: MessageSquare, text: t('contact.featureInquiries') },
                  { icon: Sparkles, text: t('contact.featureAdvice') },
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
                <h2>{t('contact.cardTitle')}</h2>
                <p>{t('contact.cardDesc')}</p>
              </div>

              <form onSubmit={handleSubmit} className="ContactPage-Form">
                <div className="ContactPage-Field">
                  <label htmlFor="name">{t('contact.yourName')}</label>
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
                      placeholder={t('contact.namePlaceholder')}
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="email">{t('contact.emailAddress')}</label>
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
                      placeholder={t('contact.emailPlaceholder')}
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="subject">{t('contact.subject')}</label>
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
                      placeholder={t('contact.subjectPlaceholder')}
                      required
                      disabled={loading}
                    />
                  </motion.div>
                </div>

                <div className="ContactPage-Field">
                  <label htmlFor="message">{t('contact.message')}</label>
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
                      placeholder={t('contact.messagePlaceholder')}
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
                      {t('contact.sendMessage')}
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
