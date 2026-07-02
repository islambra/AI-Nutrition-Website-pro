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
import { useTranslation } from 'react-i18next';
import PageTransition from '../../components/PageTransition';
import './ConsultationRequests.css';

function ConsultationRequests() {
  const { t } = useTranslation();
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
      toast.error(t("dashboard.dieteticien.consultationRequests.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await acceptConsultation(id);   // no arguments needed – Zoom created automatically
      toast.success(t("dashboard.dieteticien.consultationRequests.accepted"));
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t("dashboard.dieteticien.consultationRequests.acceptError"));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await rejectConsultation(id);
      toast.success(t("dashboard.dieteticien.consultationRequests.rejected"));
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t("dashboard.dieteticien.consultationRequests.rejectError"));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleComplete = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await completeConsultation(id);
      toast.success(t("dashboard.dieteticien.consultationRequests.markedCompleted"));
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t("dashboard.dieteticien.consultationRequests.completeError"));
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="CR-Loading">
          <Loader2 className="CR-Spin" size={48} />
          <p>{t("dashboard.dieteticien.consultationRequests.loading")}</p>
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
              {t("dashboard.dieteticien.consultationRequests.title")}
            </h1>
            <p className="CR-Subtitle">
              {t("dashboard.dieteticien.consultationRequests.subtitle")}
            </p>
          </header>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="CR-EmptyState"
            >
              <Inbox size={64} className="CR-EmptyIcon" />
              <h3>{t("dashboard.dieteticien.consultationRequests.noPending")}</h3>
              <p>{t("dashboard.dieteticien.consultationRequests.allProcessed")}</p>
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
                          {req.user?.fullName || t("dashboard.dieteticien.consultationRequests.unknownClient")}
                        </h4>
                        <p className="CR-ClientEmail">
                          {req.user?.email || t("dashboard.dieteticien.consultationRequests.noEmail")}
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
                            {req.plan?.planName || t("dashboard.dieteticien.consultationRequests.na")}
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
                          {t("dashboard.dieteticien.consultationRequests.acceptZoom")}
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
                          {t("dashboard.dieteticien.consultationRequests.reject")}
                        </button>
                      </div>
                    )}

                    {/* ACCEPTED: show Zoom details */}
                    {req.status === 'accepted' && (
                      <div className="CR-ZoomDetails">
                        <h4 className="CR-ZoomDetailsTitle">
                          <Video size={18} /> {t("dashboard.dieteticien.consultationRequests.zoomCreated")}
                        </h4>
                        <div className="CR-ZoomLinkRow">
                          <LinkIcon size={16} />
                          <span>{t("dashboard.dieteticien.consultationRequests.clientLink")}</span>
                          <a href={req.zoomLink} target="_blank" rel="noreferrer">
                            {t("dashboard.dieteticien.consultationRequests.openZoom")} <ExternalLink size={14} />
                          </a>
                        </div>
                        {req.zoomStartUrl && (
                          <div className="CR-ZoomLinkRow">
                            <LinkIcon size={16} />
                            <span>{t("dashboard.dieteticien.consultationRequests.hostLink")}</span>
                            <a href={req.zoomStartUrl} target="_blank" rel="noreferrer">
                              {t("dashboard.dieteticien.consultationRequests.startHost")} <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                        {req.meetingPassword && (
                          <div className="CR-ZoomLinkRow">
                            <span>{t("dashboard.dieteticien.consultationRequests.passcode")} </span>
                            <strong>{req.meetingPassword}</strong>
                          </div>
                        )}
                        <button
                          className="CR-CompleteBtn"
                          disabled={processing[req._id]}
                          onClick={() => handleComplete(req._id)}
                        >
                          {t("dashboard.dieteticien.consultationRequests.markCompleted")}
                        </button>
                      </div>
                    )}

                    {/* REJECTED or COMPLETED – simple message */}
                    {req.status === 'rejected' && (
                      <p className="CR-RejectedMsg">{t("dashboard.dieteticien.consultationRequests.wasRejected")}</p>
                    )}
                    {req.status === 'completed' && (
                      <p className="CR-CompletedMsg">{t("dashboard.dieteticien.consultationRequests.completed")}</p>
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