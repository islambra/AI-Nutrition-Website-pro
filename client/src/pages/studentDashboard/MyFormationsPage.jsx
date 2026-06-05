import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award, Calendar, Users, Video, Clock, Monitor, Loader2, FileText, ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyPurchasedFormations } from "../../api/formationApi";
import CountdownTimer from "../../components/CountdownTimer";
import "./MyCourses.css";

const MyFormationsPage = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await getMyPurchasedFormations();
      if (response.success) setFormations(response.data);
    } catch (error) {
      console.error("Error fetching formations:", error);
    } finally {
      setLoading(false);
    }
  };

  const canJoinSession = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end && session.zoomLink;
  };

  const sessionIsPast = (session) => {
    return new Date(session.endTime) < new Date();
  };

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div className="mc-badge">
          <Award size={20} />
          <span>My Learning</span>
        </div>
        <h1 className="mc-title">
          My <span className="mc-gradient">Formations</span>
        </h1>
        <p className="mc-subtitle">
          Your purchased training programs with live sessions
        </p>
      </div>

      {loading ? (
        <div className="mc-loader-wrapper">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award size={60} color="#2D5A27" />
          </motion.div>
          <p>Loading formations...</p>
        </div>
      ) : formations.length === 0 ? (
        <div className="mc-empty">
          <Award size={48} />
          <p>You haven't purchased any formations yet.</p>
          <p style={{ fontSize: 13, opacity: 0.5, marginTop: 8 }}>
            Browse available formations in the Services page.
          </p>
          <button
            onClick={() => navigate("/services")}
            className="mc-pdf-btn"
            style={{ marginTop: 16, padding: "10px 20px", border: "none", cursor: "pointer" }}
          >
            Browse Formations
          </button>
        </div>
      ) : (
        formations.map((uf) => {
          const f = uf.formation;
          return (
            <motion.div
              key={uf._id}
              className="mc-formation-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mc-formation-header">
                <div className="mc-formation-info">
                  {f.image && (
                    <img src={f.image} alt={f.title} className="mc-formation-thumb" />
                  )}
                  <div>
                    <h3>{f.title}</h3>
                    <p className="mc-formation-desc">{f.description}</p>
                    <div className="mc-formation-meta">
                      <span><Calendar size={14} /> {f.sessionsCount} sessions</span>
                      <span><Users size={14} /> {f.durationWeeks} weeks</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mc-formation-sessions">
                <h4>
                  <Video size={16} /> Sessions
                </h4>
                {uf.sessions && uf.sessions.length > 0 ? (
                  <div className="mc-session-list">
                    {uf.sessions.map((session) => (
                      <div
                        key={session._id}
                        className={`mc-session-item ${
                          canJoinSession(session) ? "live" : ""
                        } ${sessionIsPast(session) ? "past" : ""}`}
                      >
                        <div className="mc-session-left">
                          <div className="mc-session-order">
                            {sessionIsPast(session) ? (
                              <Monitor size={18} />
                            ) : canJoinSession(session) ? (
                              <Video size={18} />
                            ) : (
                              <Clock size={18} />
                            )}
                          </div>
                          <div className="mc-session-info">
                            <strong>Session {session.order}: {session.title}</strong>
                            <span className="mc-session-time">
                              {new Date(session.startTime).toLocaleDateString()} {" "}
                              {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {" — "}
                              {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {session.description && (
                              <span className="mc-session-desc">{session.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="mc-session-right">
                          {canJoinSession(session) ? (
                            <a
                              href={session.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mc-join-btn"
                            >
                              <Video size={14} /> Join Now
                            </a>
                          ) : !sessionIsPast(session) && session.zoomLink ? (
                            <div className="mc-countdown-wrapper">
                              <Clock size={12} />
                              <CountdownTimer targetDate={session.startTime} />
                            </div>
                          ) : sessionIsPast(session) ? (
                            <span className="mc-session-past-badge">Ended</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mc-empty" style={{ padding: 20 }}>
                    <p>No sessions scheduled yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default MyFormationsPage;
