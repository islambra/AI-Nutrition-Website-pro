import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Calendar, Users, Video, Clock, Monitor,
  FileText, ArrowLeft, Search, ExternalLink, User, BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyPurchasedFormations } from "../../api/formationApi";
import CountdownTimer from "../../components/CountdownTimer";
import { useTranslation } from 'react-i18next';
import "./MyCourses.css";

const MyFormationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormation, setSelectedFormation] = useState(null);

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

  const getNextSessionIndex = (sessions) => {
    const now = new Date();
    return sessions.findIndex((s) => new Date(s.endTime) > now);
  };

  const filteredFormations = formations.filter((uf) =>
    uf.formation?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedFormation) {
    return (
      <div className="mc-container">
        <div className="mc-header">
          <div className="mc-badge">
            <Award size={20} />
            <span>{t('dashboard.student.myLearning')}</span>
          </div>
          <h1 className="mc-title">
            {t('dashboard.student.myFormationsTitle')}
          </h1>
          <p className="mc-subtitle">
            {t('dashboard.student.myFormationsDesc')}
          </p>
        </div>

        {!loading && formations.length > 0 && (
          <div className="mc-search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('dashboard.student.searchFormations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="mc-loader-wrapper">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award size={60} color="#2D5A27" />
            </motion.div>
            <p>{t('dashboard.student.loadingFormations')}</p>
          </div>
        ) : formations.length === 0 ? (
          <div className="mc-empty">
            <Award size={48} />
            <p>{t('dashboard.student.noFormations')}</p>
            <p style={{ fontSize: 13, opacity: 0.5, marginTop: 8 }}>
              {t('dashboard.student.browseFormations')}
            </p>
            <button
              onClick={() => navigate("/services")}
              className="mc-pdf-btn"
            >
              {t('dashboard.student.browseFormationsBtn')}
            </button>
          </div>
        ) : (
          <div className="mc-formation-grid">
            {filteredFormations.map((uf) => {
              const f = uf.formation;
              return (
                <motion.div
                  key={uf._id}
                  className="fc-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedFormation(uf)}
                >
                  <div className="fc-card-image">
                    {f.image ? (
                      <img src={f.image} alt={f.title} />
                    ) : (
                      <div className="fc-card-image-placeholder">
                        <BookOpen size={40} />
                      </div>
                    )}
                  </div>
                  <div className="fc-card-body">
                    <h3 className="fc-card-title">{f.title}</h3>
                    <div className="fc-card-creator">
                      {f.creatorInfo?.photo ? (
                        <img src={f.creatorInfo.photo} alt="" className="fc-creator-avatar" />
                      ) : (
                        <div className="fc-creator-avatar fc-creator-avatar-fallback">
                          {(f.creatorInfo?.fullName || "U").charAt(0)}
                        </div>
                      )}
                      {t('dashboard.student.createdBy', { name: f.creatorInfo?.fullName || t('common.unknown') })}
                    </div>
                    <div className="fc-card-meta">
                      <span><Calendar size={13} /> {f.sessionsCount} {t('dashboard.student.sessions')}</span>
                      <span><Users size={13} /> {f.durationWeeks} {t('dashboard.student.weeks')}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const f = selectedFormation.formation;
  const sessions = selectedFormation.sessions || [];
  const nextIdx = getNextSessionIndex(sessions);

  return (
    <div className="mc-container">
      <AnimatePresence mode="wait">
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <button className="fc-back-btn" onClick={() => setSelectedFormation(null)}>
            <ArrowLeft size={18} />
            {t('dashboard.student.backToFormations')}
          </button>

          <div className="fc-detail-hero">
            {f.image && <img src={f.image} alt={f.title} className="fc-detail-hero-img" />}
            <div className="fc-detail-hero-overlay">
              <h1 className="fc-detail-title">{f.title}</h1>
              <div className="fc-detail-creator">
                {f.creatorInfo?.photo ? (
                  <img src={f.creatorInfo.photo} alt="" className="fc-detail-creator-avatar" />
                ) : (
                  <div className="fc-detail-creator-avatar fc-detail-creator-avatar-fallback">
                    {(f.creatorInfo?.fullName || "U").charAt(0)}
                  </div>
                )}
                {t('dashboard.student.createdBy', { name: f.creatorInfo?.fullName || t('common.unknown') })}
              </div>
            </div>
          </div>

          <div className="fc-detail-stats">
            <div className="fc-stat">
              <div className="fc-stat-icon"><Calendar size={20} /></div>
              <div>
                <span className="fc-stat-value">{f.sessionsCount}</span>
                <span className="fc-stat-label">{t('dashboard.student.sessions')}</span>
              </div>
            </div>
            <div className="fc-stat">
              <div className="fc-stat-icon"><Users size={20} /></div>
              <div>
                <span className="fc-stat-value">{f.durationWeeks}</span>
                <span className="fc-stat-label">{t('dashboard.student.weeks')}</span>
              </div>
            </div>
            <div className="fc-stat">
              <div className="fc-stat-icon"><Clock size={20} /></div>
              <div>
                <span className="fc-stat-value">
                  {new Date(f.startDate).toLocaleDateString()}
                </span>
                <span className="fc-stat-label">{t('dashboard.student.startDate')}</span>
              </div>
            </div>
          </div>

          <div className="fc-detail-section">
            <h2>{t('dashboard.student.description')}</h2>
            <p className="fc-description">{f.description}</p>
          </div>

          {f.files && f.files.length > 0 && (
            <div className="fc-detail-section">
              <h2><FileText size={18} /> {t('dashboard.student.formationMaterials')}</h2>
              <div className="fc-files-grid">
                {f.files.map((file, i) => {
                const iconClass = file.type === "pdf"
                  ? "file-pdf"
                  : file.type === "drive"
                    ? "file-drive"
                    : "file-link";
                return (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fc-file-item"
                  >
                    <div className={`fc-file-icon ${iconClass}`}>
                      {file.type === "pdf" ? (
                        <FileText size={20} />
                      ) : (
                        <ExternalLink size={20} />
                      )}
                    </div>
                    <span className="fc-file-name">{file.name}</span>
                    <span className="fc-file-type">{file.type.toUpperCase()}</span>
                  </a>
                );
              })}
              </div>
            </div>
          )}

          <div className="fc-detail-section">
            <h2><Video size={18} /> {t('dashboard.student.sessions')}</h2>
            {sessions.length === 0 ? (
              <div className="mc-empty" style={{ padding: 20 }}>
                <p>{t('common.noResults')}</p>
              </div>
            ) : (
              <div className="mc-session-list">
                {sessions.map((session, i) => {
                  const isLive = canJoinSession(session);
                  const isPast = sessionIsPast(session);
                  const isNext = i === nextIdx && !isPast;
                  return (
                    <div
                      key={session._id}
                      className={`mc-session-item ${isLive ? "live" : ""} ${isPast ? "past" : ""} ${isNext ? "next" : ""}`}
                    >
                      <div className="mc-session-left">
                        <div className="mc-session-order">
                          {isPast ? <Monitor size={18} /> : isLive ? <Video size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="mc-session-info">
                          <strong>{t('dashboard.student.sessionN', { number: session.order, title: session.title })}</strong>
                          <span className="mc-session-time">
                            {new Date(session.startTime).toLocaleDateString()}{" "}
                            {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" — "}
                            {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {session.description && (
                            <span className="mc-session-desc">{session.description}</span>
                          )}
                          {isNext && <span className="fc-next-badge">{t('dashboard.student.nextSession')}</span>}
                        </div>
                      </div>
                      <div className="mc-session-right">
                        {isLive ? (
                          <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="mc-join-btn">
                            <Video size={14} /> {t('dashboard.student.joinNow')}
                          </a>
                        ) : !isPast && session.zoomLink ? (
                          <div className="mc-countdown-wrapper">
                            <Clock size={12} />
                            <CountdownTimer targetDate={session.startTime} />
                          </div>
                        ) : isPast ? (
                          <span className="mc-session-past-badge">{t('dashboard.student.ended')}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MyFormationsPage;
