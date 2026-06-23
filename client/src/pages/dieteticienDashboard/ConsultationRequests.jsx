// pages/dieteticienDashboard/ConsultationRequests.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Check, X, Link as LinkIcon, Calendar, User, FileText,
  Clock, AlertCircle, MessageSquare, ExternalLink, Video, Inbox
} from 'lucide-react';
import {
  getDieteticienRequests,
  acceptConsultation,
  rejectConsultation,
  completeConsultation,   // optional – mark as done
} from '../../api/consultationApi';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';
import './ConsultationRequests.css';

function ConsultationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getDieteticienRequests();
      if (res.success) setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load consultation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await acceptConsultation(id);   // no arguments needed – Zoom created automatically
      toast.success('Consultation accepted – Zoom meeting created!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error accepting');
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await rejectConsultation(id);
      toast.success('Consultation rejected');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting');
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleComplete = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await completeConsultation(id);
      toast.success('Consultation marked as completed');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error completing');
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="CR-Loading">
          <Loader2 className="CR-Spin" size={48} />
          <p>Loading requests...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="CR-Wrapper">
        <div className="CR-Container">
          <header className="CR-Header">
            <h1 className="CR-Title">
              Consultation <span className="CR-Highlight">Requests</span>
            </h1>
            <p className="CR-Subtitle">
              Manage client sessions – accept to auto‑create a Zoom meeting
            </p>
          </header>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="CR-EmptyState"
            >
              <Inbox size={64} className="CR-EmptyIcon" />
              <h3>No Pending Requests</h3>
              <p>All consultation requests have been processed.</p>
            </motion.div>
          ) : (
            <div className="CR-Grid">
              {requests.map((req, index) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="CR-Card"
                >
                  <div className="CR-CardBody">
                    {/* Client Info */}
                    <div className="CR-ClientInfo">
                      <div className="CR-ClientAvatar">
                        {req.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="CR-ClientName">
                          {req.user?.fullName || 'Unknown Client'}
                        </h4>
                        <p className="CR-ClientEmail">
                          {req.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    {/* Plan & Schedule */}
                    <div className="CR-DetailsGrid">
                      <div className="CR-DetailItem">
                        <FileText size={16} />
                        <div>
                          <span className="CR-DetailLabel">Plan</span>
                          <span className="CR-DetailValue">
                            {req.plan?.planName || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="CR-DetailItem">
                        <Calendar size={16} />
                        <div>
                          <span className="CR-DetailLabel">Requested Date</span>
                          <span className="CR-DetailValue">
                            {new Date(req.requestedDateTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      {req.note && (
                        <div className="CR-DetailItem CR-NoteItem">
                          <MessageSquare size={16} />
                          <div>
                            <span className="CR-DetailLabel">Note</span>
                            <span className="CR-DetailValue">{req.note}</span>
                          </div>
                        </div>
                      )}
                      <div className="CR-DetailItem">
                        <Clock size={16} />
                        <div>
                          <span className="CR-DetailLabel">Status</span>
                          <span
                            className={`CR-StatusBadge ${
                              req.status === 'accepted'
                                ? 'CR-StatusAccepted'
                                : req.status === 'rejected'
                                ? 'CR-StatusRejected'
                                : 'CR-StatusPending'
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PENDING: show Accept / Reject */}
                    {req.status === 'pending' && (
                      <div className="CR-ActionBtns">
                        <button
                          className="CR-AcceptBtn"
                          disabled={processing[req._id]}
                          onClick={() => handleAccept(req._id)}
                        >
                          {processing[req._id] ? (
                            <Loader2 size={16} className="CR-Spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Accept & Create Zoom
                        </button>
                        <button
                          className="CR-RejectBtn"
                          disabled={processing[req._id]}
                          onClick={() => handleReject(req._id)}
                        >
                          {processing[req._id] ? (
                            <Loader2 size={16} className="CR-Spin" />
                          ) : (
                            <X size={16} />
                          )}
                          Reject
                        </button>
                      </div>
                    )}

                    {/* ACCEPTED: show Zoom details */}
                    {req.status === 'accepted' && (
                      <div className="CR-ZoomDetails">
                        <h4 className="CR-ZoomDetailsTitle">
                          <Video size={18} /> Zoom Meeting Created
                        </h4>
                        <div className="CR-ZoomLinkRow">
                          <LinkIcon size={16} />
                          <span>Client Link:</span>
                          <a href={req.zoomLink} target="_blank" rel="noreferrer">
                            Open in Zoom <ExternalLink size={14} />
                          </a>
                        </div>
                        {req.zoomStartUrl && (
                          <div className="CR-ZoomLinkRow">
                            <LinkIcon size={16} />
                            <span>Host Link (start meeting):</span>
                            <a href={req.zoomStartUrl} target="_blank" rel="noreferrer">
                              Start as Host <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                        {req.meetingPassword && (
                          <div className="CR-ZoomLinkRow">
                            <span>Passcode: </span>
                            <strong>{req.meetingPassword}</strong>
                          </div>
                        )}
                        <button
                          className="CR-CompleteBtn"
                          disabled={processing[req._id]}
                          onClick={() => handleComplete(req._id)}
                        >
                          Mark as Completed
                        </button>
                      </div>
                    )}

                    {/* REJECTED or COMPLETED – simple message */}
                    {req.status === 'rejected' && (
                      <p className="CR-RejectedMsg">This request was rejected.</p>
                    )}
                    {req.status === 'completed' && (
                      <p className="CR-CompletedMsg">Consultation completed.</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default ConsultationRequests;