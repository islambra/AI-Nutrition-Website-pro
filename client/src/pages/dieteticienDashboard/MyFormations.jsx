import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, Users, Video, Loader2, Eye, Clock, User, Search, AlertTriangle, X } from "lucide-react";
import { getMyFormations, deleteFormation } from "../../api/formationApi";
import toast from "react-hot-toast";
import "./MyFormations.css";
import "../../components/FormationCard.css";

const MyFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
    try {
      setDeleting(true);
      const res = await deleteFormation(id);
      if (res.success) {
        toast.success("Formation deleted successfully");
        fetchMyFormations();
      }
    } catch {
      toast.error("Failed to delete formation");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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
    <div className="mf-container">
      <div className="mf-header">
        <div className="mf-header-left">
          <h2 className="mf-header-title">My Formations</h2>
          <p className="mf-header-sub">Manage your online training programs</p>
        </div>
        <NavLink to="/dieteticien/formations/create" className="mf-create-btn">
          <Plus size={18} /> New Formation
        </NavLink>
      </div>

      {!loading && formations.length > 0 && (
        <div className="mf-search-bar">
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
        <div className="mf-empty">
          <Video size={56} className="mf-empty-icon" />
          <p className="mf-empty-title">No formations yet</p>
          <p className="mf-empty-sub">Create your first formation to get started.</p>
        </div>
      ) : (
        <div className="mf-list">
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
                  <button onClick={() => setDeleteTarget(f._id)} className="fc-btn fc-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mf-modal-overlay"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="mf-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="mf-modal-close"
                onClick={() => !deleting && setDeleteTarget(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>

              <div className="mf-modal-icon-wrap">
                <div className="mf-modal-icon">
                  <AlertTriangle size={28} />
                </div>
              </div>

              <h3 className="mf-modal-title">Delete Formation</h3>
              <p className="mf-modal-message">
                Are you sure you want to delete this formation? All sessions and associated data will be permanently removed. This action cannot be undone.
              </p>

              <div className="mf-modal-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mf-modal-btn cancel"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mf-modal-btn confirm"
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="AP-Spin" size={16} /> : <Trash2 size={16} />}
                  {deleting ? "Deleting..." : "Delete Formation"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyFormations;
