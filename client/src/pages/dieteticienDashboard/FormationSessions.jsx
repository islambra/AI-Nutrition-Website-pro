import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Video, Clock, Monitor, Loader2, AlertCircle } from "lucide-react";
import { getFormationById, getSessions, createSession, deleteSession } from "../../api/formationApi";
import CountdownTimer from "../../components/CountdownTimer";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./FormationSessions.css";

const FormationSessions = () => {
  const { formationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formation, setFormation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const canJoinSession = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end && session.zoomLink;
  };

  const sessionIsPast = (session) => {
    return new Date(session.endTime) < new Date();
  };

  const getNextSessionIndex = (sessions) => {
    const now = new Date();
    return sessions.findIndex((s) => new Date(s.endTime) > now);
  };

  const [sessionForm, setSessionForm] = useState({
    title: "", description: "", startTime: "", endTime: ""
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [fRes, sRes] = await Promise.all([
          getFormationById(formationId),
          getSessions(formationId)
        ]);
        if (fRes.success) setFormation(fRes.data);
        if (sRes.success) setSessions(sRes.data);
      } catch {
        toast.error(t("dashboard.dieteticien.formationSessions.loadFailed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title || !sessionForm.startTime || !sessionForm.endTime) {
      toast.error(t("dashboard.dieteticien.formationSessions.fillFields"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await createSession(formationId, {
        ...sessionForm,
        startTime: new Date(sessionForm.startTime).toISOString(),
        endTime: new Date(sessionForm.endTime).toISOString(),
      });
      if (res.success) {
        toast.success("Session created with Zoom link!");
        setSessions((prev) => [...prev, res.data]);
        setShowForm(false);
        setSessionForm({ title: "", description: "", startTime: "", endTime: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("dashboard.dieteticien.formationSessions.loadFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await deleteSession(sessionId);
      if (res.success) {
        toast.success("Session deleted");
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="AP-Spin" size={48} />
      </div>
    );
  }

  return (
    <div className="mc-container fs-container">
      <button onClick={() => navigate("/dieteticien/formations")} className="fs-back-btn">
        <ArrowLeft size={16} /> Back to Formations
      </button>

      <div className="fs-header">
        <h2 className="fs-title">{formation?.title}</h2>
        <p className="fs-subtitle">Manage sessions for this formation</p>
      </div>

      <div className="fs-toolbar">
        <h3 className="fs-count-label">Sessions ({sessions.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="fs-add-btn">
          {!showForm && <Plus size={18} />} {showForm ? "Cancel" : "Add Session"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          onSubmit={handleCreateSession}
          className="fs-form"
        >
          <input
            className="fs-input"
            placeholder="Session Title *"
            value={sessionForm.title}
            onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))}
          />
          <textarea
            className="fs-textarea"
            placeholder="Description (optional)"
            rows={2}
            value={sessionForm.description}
            onChange={(e) => setSessionForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="fs-time-grid">
            <div>
              <label className="fs-label">Start Time *</label>
              <input
                className="fs-input"
                type="datetime-local"
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm((p) => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="fs-label">End Time *</label>
              <input
                className="fs-input"
                type="datetime-local"
                value={sessionForm.endTime}
                onChange={(e) => setSessionForm((p) => ({ ...p, endTime: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="fs-submit-btn">
            {submitting ? <Loader2 className="AP-Spin" size={16} /> : null}
            Create Session (auto-generates Zoom link)
          </button>
        </motion.form>
      )}

      {sessions.length === 0 ? (
        <div className="fs-empty">
          <Clock size={48} className="fs-empty-icon" />
          <p className="fs-empty-title">No sessions yet</p>
          <p className="fs-empty-sub">Click "Add Session" to create your first one.</p>
        </div>
      ) : (
        <div className="fs-session-list">
          {sessions.map((session, i) => {
            const isLive = canJoinSession(session);
            const isPast = sessionIsPast(session);
            const isNext = i === getNextSessionIndex(sessions) && !isPast;
            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`fs-session-item ${isLive ? "live" : ""} ${isPast ? "past" : ""} ${isNext ? "next" : ""}`}
              >
                <div className="fs-session-body">
                  <div className="fs-order-badge">
                    {isPast ? <Monitor size={18} /> : isLive ? <Video size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="fs-session-info">
                    <strong>{session.title}</strong>
                    <span className="fs-session-time">
                      {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" — "}
                      {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isPast && <span className="fs-status-badge ended">{t("dashboard.dieteticien.formationSessions.ended")}</span>}
                    {isLive && <span className="fs-status-badge live">Live Now</span>}
                    {isNext && !isPast && !isLive && <span className="fs-status-badge upcoming">Upcoming</span>}
                  </div>
                </div>
                <div className="fs-session-actions">
                  {isLive ? (
                    <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="fs-join-btn">
                      <Video size={14} /> {t("dashboard.dieteticien.formationSessions.joinNow")}
                    </a>
                  ) : !isPast && session.zoomLink ? (
                    <div className="fs-countdown">
                      <Clock size={12} />
                      <CountdownTimer targetDate={session.startTime} />
                    </div>
                  ) : null}
                  <button onClick={() => setDeleteConfirm(session._id)} className="fs-delete-btn">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="pa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="pa-confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pa-confirm-icon">
                <AlertCircle size={28} />
              </div>
              <h3>Delete this session?</h3>
              <p>This action cannot be undone. The session and its Zoom link will be permanently removed.</p>
              <div className="pa-confirm-actions">
                <button
                  className="pa-confirm-cancel"
                  onClick={() => setDeleteConfirm(null)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className="pa-confirm-reject"
                  onClick={() => handleDeleteSession(deleteConfirm)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormationSessions;
