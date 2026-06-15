// pages/dashboard/ContactMessages.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Trash2, 
  Eye, 
  Search, 
  Calendar,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox,
  RefreshCw,
  Sparkles,
  Users,
  Clock,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllContacts, deleteContact } from "../../api/contactApi";
import "./ContactMessages.css";

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  // Fetch all contacts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts();
      if (response.success) {
        setContacts(response.contacts);
      } else {
        toast.error(response.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const refreshContacts = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
    toast.success("Messages refreshed");
  };

  // Delete contact
  const handleDelete = async (id, name) => {
    toast((t) => (
      <div className="custom-toast">
        <p>Delete message from <strong>{name}</strong>?</p>
        <div className="toast-actions">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(id);
            }}
            className="toast-confirm"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="toast-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: "top-center",
    });
  };

  const confirmDelete = async (id) => {
    try {
      const response = await deleteContact(id);
      if (response.success) {
        toast.success("Message deleted successfully");
        setContacts(contacts.filter(contact => contact._id !== id));
        if (selectedContact?._id === id) {
          setShowModal(false);
          setSelectedContact(null);
        }
      } else {
        toast.error(response.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete message");
    }
  };

  // View contact details
  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Stats
  const stats = {
    total: contacts.length,
    month: contacts.filter(c => {
      const date = new Date(c.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    week: contacts.filter(c => {
      const date = new Date(c.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return date >= weekAgo;
    }).length,
    today: contacts.filter(c => {
      const today = new Date().toDateString();
      return new Date(c.createdAt).toDateString() === today;
    }).length
  };

  if (loading) {
    return (
      <div className="contact-messages-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <Sparkles className="spinner-icon" size={32} />
        </div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="contact-messages-page"
    >
      {/* Header Section */}
      <div className="messages-header-section">
        <div className="header-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="page-badge">
              <Mail size={14} />
              <span>Inbox Management</span>
            </div>
            <h1 className="page-title">Contact Messages</h1>
            <p className="page-description">View and manage all customer inquiries and messages</p>
          </motion.div>
        </div>
        <motion.div 
          className="header-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            onClick={refreshContacts} 
            className="refresh-btn"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="stats-grid"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="stat-card">
          <div className="stat-icon-wrapper total-icon">
            <Mail size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Messages</span>
          </div>
          <div className="stat-trend">
            <span>All time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper month-icon">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.month}</span>
            <span className="stat-label">This Month</span>
          </div>
          <div className="stat-trend">
            <TrendingUp size={12} />
            <span>New inquiries</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper week-icon">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.week}</span>
            <span className="stat-label">Last 7 Days</span>
          </div>
          <div className="stat-trend">
            <MessageCircle size={12} />
            <span>Recent activity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper today-icon">
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
          <div className="stat-trend">
            <span>New today</span>
          </div>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        className="search-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="clear-search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="search-info">
          <Users size={14} />
          <span>{filteredContacts.length} message{filteredContacts.length !== 1 ? 's' : ''} found</span>
        </div>
      </motion.div>

      {/* Messages Content - Grid View */}
      {currentContacts.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="empty-icon">
            <Inbox size={48} />
          </div>
          <h3>No messages found</h3>
          <p>
            {searchTerm
              ? `No results found for "${searchTerm}"` 
              : "No contact messages have been submitted yet"}
          </p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search-btn">
              Clear search
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid-view">
          <AnimatePresence>
            {currentContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                className="message-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="card-header">
                  <div className="customer-avatar large">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="card-header-info">
                    <h4>{contact.name}</h4>
                    <p>{contact.email}</p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-subject">
                    <strong>Subject:</strong> {contact.subject}
                  </div>
                  <div className="card-message">
                    {contact.message.substring(0, 100)}
                    {contact.message.length > 100 && "..."}
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleView(contact)} className="card-view-btn">
                    <Eye size={14} /> View Details
                  </button>
                  <button onClick={() => handleDelete(contact._id, contact.name)} className="card-delete-btn">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="pagination-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredContacts.length)} of {filteredContacts.length} messages
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, index) => {
              if (
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 2 && index <= currentPage + 1)
              ) {
                return (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              } else if (index === currentPage - 3 || index === currentPage + 2) {
                return <span key={index} className="page-dots">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Message Details Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">
                  <div className="title-icon">
                    <Mail size={18} />
                  </div>
                  <h2>Message Details</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">From</div>
                    <div className="info-value">
                      <User size={14} />
                      <span>{selectedContact.name}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">
                      <Mail size={14} />
                      <a href={`mailto:${selectedContact.email}`} className="email-link">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="info-item full-width">
                    <div className="info-label">Subject</div>
                    <div className="info-value subject-value">
                      <MessageSquare size={14} />
                      <span>{selectedContact.subject}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">Received</div>
                    <div className="info-value">
                      <Calendar size={14} />
                      <span>{formatDate(selectedContact.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="message-section">
                  <div className="message-label">Message Content</div>
                  <div className="message-content">
                    {selectedContact.message}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => handleDelete(selectedContact._id, selectedContact.name)}
                  className="modal-delete-btn"
                >
                  <Trash2 size={16} />
                  Delete Message
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-close-btn"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContactMessages;