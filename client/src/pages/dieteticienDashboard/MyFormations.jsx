import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, Users, Video, Loader2, ArrowLeft } from "lucide-react";
import { getMyFormations, deleteFormation } from "../../api/formationApi";
import toast from "react-hot-toast";

const MyFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchMyFormations(); }, []);

  const fetchMyFormations = async () => {
    try {
      setLoading(true);
      const res = await getMyFormations();
      if (res.success) setFormations(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this formation? This cannot be undone.")) return;
    try {
      const res = await deleteFormation(id);
      if (res.success) {
        toast.success("Formation deleted");
        fetchMyFormations();
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
    <div className="mc-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>My Formations</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>Manage your online training programs</p>
        </div>
        <NavLink to="/dieteticien/formations/create" className="mc-pdf-btn" style={{ padding: "12px 24px", textDecoration: "none" }}>
          <Plus size={18} /> New Formation
        </NavLink>
      </div>

      {formations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
          <Video size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 18, fontWeight: 600 }}>No formations yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Create your first formation to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {formations.map((f) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                border: "2px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {f.image && (
                <img src={f.image} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ margin: "4px 0", fontSize: 13, color: "#6b7280", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.description}</p>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} /> {f.sessionsCount} sessions</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} /> {f.durationWeeks} weeks</span>
                  <span style={{ fontWeight: 700, color: "#059669" }}>{f.price.toLocaleString()} DZD</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => navigate(`/dieteticien/formations/${f._id}/sessions`)} className="mc-pdf-btn" style={{ background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 12 }}>
                  <Video size={14} /> Sessions
                </button>
                <button onClick={() => navigate(`/dieteticien/formations/edit/${f._id}`)} className="mc-pdf-btn" style={{ background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 12 }}>
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(f._id)} className="mc-pdf-btn" style={{ background: "#fef2f2", color: "#ef4444", border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 12 }}>
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

export default MyFormations;
