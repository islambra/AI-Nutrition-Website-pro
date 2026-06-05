import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Video, Clock, Loader2 } from "lucide-react";
import { getFormationById, getSessions, createSession, deleteSession } from "../../api/formationApi";
import toast from "react-hot-toast";

const FormationSessions = () => {
  const { formationId } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    if (!confirm("Delete this session?")) return;
    try {
      const res = await deleteSession(sessionId);
      if (res.success) {
        toast.success("Session deleted");
        setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      }
    } catch {
      toast.error("Failed to delete");
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
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <Clock size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>No sessions yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add Session" to create your first one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 18px",
                background: "white",
                borderRadius: 12,
                border: "2px solid #e5e7eb",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
                  {session.order}
                </div>
                <div>
                  <strong style={{ fontSize: 14 }}>{session.title}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {session.zoomLink && (
                  <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="mc-pdf-btn" style={{ padding: "8px 12px", fontSize: 12, textDecoration: "none" }}>
                    <Video size={14} /> Zoom
                  </a>
                )}
                <button onClick={() => handleDeleteSession(session._id)} style={{ background: "#fef2f2", border: "none", borderRadius: 8, cursor: "pointer", color: "#ef4444", padding: "8px 12px" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormationSessions;
