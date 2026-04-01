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
  Loader,
  X,
  Inbox,
  RefreshCw
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
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="contact-messages-loading">
        <div className="loading-spinner">
          <Loader className="spinner-icon" size={48} />
        </div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="contact-messages-page"
    >
      {/* Header Section */}
      <div className="messages-header-section">
        <div className="header-left">
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-description">View and manage all customer inquiries and messages</p>
        </div>
        <div className="header-right">
          <button 
            onClick={refreshContacts} 
            className="refresh-btn"
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
          <div className="total-badge">
            <Mail size={16} />
            <span>{contacts.length} Total</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
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
              <X size={16} />
            </button>
          )}
        </div>
        <div className="search-info">
          {filteredContacts.length} message{filteredContacts.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Messages Table */}
      {currentContacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Inbox size={64} />
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
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentContacts.map((contact, index) => (
                    <motion.tr
                      key={contact._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="message-row"
                    >
                      <td className="name-cell">
                        <div className="cell-content">
                          <User size={14} className="cell-icon" />
                          <span>{contact.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        <div className="cell-content">
                          <Mail size={14} className="cell-icon" />
                          <span className="email-text">{contact.email}</span>
                        </div>
                      </td>
                      <td className="subject-cell">
                        <span className="subject-badge">{contact.subject}</span>
                      </td>
                      <td className="date-cell">
                        <div className="cell-content">
                          <Calendar size={14} className="cell-icon" />
                          <span>{formatDate(contact.createdAt)}</span>
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleView(contact)}
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id, contact.name)}
                          className="action-btn delete-btn"
                          title="Delete Message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
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
            </div>
          )}
        </>
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
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">
                  <Mail size={20} />
                  <h2>Message Details</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="info-section">
                  <div className="info-row">
                    <div className="info-label">From:</div>
                    <div className="info-value">
                      <User size={14} />
                      <span>{selectedContact.name}</span>
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-label">Email:</div>
                    <div className="info-value">
                      <Mail size={14} />
                      <span className="email-text">{selectedContact.email}</span>
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-label">Subject:</div>
                    <div className="info-value subject-value">
                      <MessageSquare size={14} />
                      <span>{selectedContact.subject}</span>
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-label">Received:</div>
                    <div className="info-value">
                      <Calendar size={14} />
                      <span>{formatDate(selectedContact.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="message-section">
                  <div className="message-label">Message:</div>
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