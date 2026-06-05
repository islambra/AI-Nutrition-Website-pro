import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, Users, Video, Loader2, Eye, Clock, User, Search } from "lucide-react";
import { getMyFormations, deleteFormation } from "../../api/formationApi";
import toast from "react-hot-toast";
import "../../components/FormationCard.css";

const MyFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

      {!loading && formations.length > 0 && (
        <div className="mc-search-bar" style={{ marginBottom: 20 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by formation name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {formations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
          <Video size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 18, fontWeight: 600 }}>No formations yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Create your first formation to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {formations.filter((f) =>
            f.title?.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((f) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fc-card"
            >
              <div className="fc-image-wrapper">
                {f.image ? (
                  <img src={f.image} alt={f.title} className="fc-image" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--health-mint)" }}>
                    <Video size={48} style={{ color: "var(--health-green)", opacity: 0.3 }} />
                  </div>
                )}
                <div className="fc-image-overlay" />
              </div>

              <div className="fc-body">
                <div className="fc-badge-row">
                  <span className="fc-badge"><Clock size={12} /> {f.durationWeeks} weeks</span>
                  <span className="fc-price-badge">{f.price.toLocaleString()} DZD</span>
                </div>

                <h3 className="fc-title">{f.title}</h3>
                <p className="fc-desc">{f.description}</p>

                <div className="fc-meta-row">
                  <span className="fc-meta-item"><Calendar size={14} /> {f.sessionsCount} sessions</span>
                  <span className="fc-meta-item"><Users size={14} /> {f.durationWeeks} weeks</span>
                </div>

                {f.creatorInfo && (
                  <div className="fc-creator-row">
                    {f.creatorInfo.photo ? (
                      <img src={f.creatorInfo.photo} alt={f.creatorInfo.fullName} className="fc-creator-avatar" />
                    ) : (
                      <div className="fc-creator-avatar-fallback">
                        <User size={16} />
                      </div>
                    )}
                    <div className="fc-creator-info">
                      <span className="fc-creator-label">Created by</span>
                      <span className="fc-creator-name">{f.creatorInfo.fullName}</span>
                    </div>
                  </div>
                )}

                <div className="fc-actions">
                  <button onClick={() => navigate(`/dieteticien/formations/${f._id}/sessions`)} className="fc-btn fc-btn-outline">
                    <Video size={14} /> Sessions
                  </button>
                  <button onClick={() => navigate(`/dieteticien/formations/edit/${f._id}`)} className="fc-btn fc-btn-outline">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(f._id)} className="fc-btn fc-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFormations;
