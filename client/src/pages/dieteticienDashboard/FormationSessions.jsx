import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Video, Clock, Monitor, Loader2, AlertCircle } from "lucide-react";
import { getFormationById, getSessions, createSession, deleteSession } from "../../api/formationApi";
import CountdownTimer from "../../components/CountdownTimer";
import toast from "react-hot-toast";
import "./FormationSessions.css";

const FormationSessions = () => {
  const { formationId } = useParams();
  const navigate = useNavigate();
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
        toast.error("Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title || !sessionForm.startTime || !sessionForm.endTime) {
      toast.error("Please fill in all fields");
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
      toast.error(error.response?.data?.message || "Failed to create session");
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
    <div className="mc-container" style={{ maxWidth: 800 }}>
      <button onClick={() => navigate("/dieteticien/formations")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 14, padding: 0, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Formations
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{formation?.title}</h2>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>Manage sessions for this formation</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sessions ({sessions.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="mc-pdf-btn" style={{ padding: "10px 18px", border: "none", cursor: "pointer", textDecoration: "none", fontSize: 13 }}>
          <Plus size={16} /> {showForm ? "Cancel" : "Add Session"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          onSubmit={handleCreateSession}
          style={{
            background: "#f9fafb",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            placeholder="Session Title *"
            value={sessionForm.title}
            onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
          />
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={sessionForm.description}
            onChange={(e) => setSessionForm((p) => ({ ...p, description: e.target.value }))}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Start Time *</label>
              <input
                type="datetime-local"
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm((p) => ({ ...p, startTime: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#374151" }}>End Time *</label>
              <input
                type="datetime-local"
                value={sessionForm.endTime}
                onChange={(e) => setSessionForm((p) => ({ ...p, endTime: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="mc-pdf-btn" style={{ padding: "12px 20px", border: "none", cursor: submitting ? "not-allowed" : "pointer", justifyContent: "center", fontSize: 14 }}>
            {submitting ? <Loader2 className="AP-Spin" size={16} /> : null}
            Create Session (auto-generates Zoom link)
          </button>
        </motion.form>
      )}

      {sessions.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <Clock size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>No sessions yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Session" to create your first one.</p>
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
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
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
                    {isPast && <span className="fs-status-badge ended">Ended</span>}
                    {isLive && <span className="fs-status-badge live">Live Now</span>}
                    {isNext && !isPast && !isLive && <span className="fs-status-badge upcoming">Upcoming</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isLive ? (
                    <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="mc-pdf-btn" style={{ padding: "8px 12px", fontSize: 12, textDecoration: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}>
                      <Video size={14} /> Join Now
                    </a>
                  ) : !isPast && session.zoomLink ? (
                    <div className="fs-countdown">
                      <Clock size={12} />
                      <CountdownTimer targetDate={session.startTime} />
                    </div>
                  ) : null}
                  <button onClick={() => setDeleteConfirm(session._id)} style={{ background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", color: "#ef4444", padding: "8px 12px" }}>
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
                  Cancel
                </button>
                <button
                  className="pa-confirm-reject"
                  onClick={() => handleDeleteSession(deleteConfirm)}
                >
                  Delete
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
