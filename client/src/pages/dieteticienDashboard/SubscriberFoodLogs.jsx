import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, Utensils, Calendar, Send } from "lucide-react";
import { getSubscriberEntries, addFeedback } from "../../api/foodDiaryApi";
import "./SubscribersList.css";

const SubscriberFoodLogs = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    fetchEntries();
  }, [clientId]);

  const fetchEntries = async () => {
    try {
      const res = await getSubscriberEntries(clientId);
      if (res.success) setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (entryId) => {
    const text = feedback[entryId];
    if (!text) { toast.error("Feedback is required"); return; }
    try {
      const res = await addFeedback(entryId, text);
      if (res.success) {
        toast.success("Feedback added");
        setFeedback(prev => ({ ...prev, [entryId]: "" }));
        fetchEntries();
      }
    } catch (err) {
      toast.error("Error");
    }
  };

  if (loading) {
    return (
      <div className="sub-detail-page">
        <div className="sub-detail-loading">
          <div className="sub-detail-spinner" />
          <p>{t("dashboard.client.loading")}</p>
        </div>
      </div>
    );
  }

  const grouped = entries.reduce((acc, e) => {
    const key = new Date(e.date).toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <motion.div className="sub-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sub-detail-header">
        <button className="sub-detail-back" onClick={() => navigate("/dieteticien/subscribers")}>
          <ArrowLeft />
        </button>
        <div className="sub-detail-icon-wrap food">
          <Utensils />
        </div>
        <div>
          <h1 className="sub-detail-title">{t("dashboard.client.foodDiary")}</h1>
          <p className="sub-detail-subtitle">{entries[0]?.client?.fullName || "Client"}</p>
        </div>
      </div>

      {/* Empty */}
      {Object.keys(grouped).length === 0 && (
        <motion.div className="sub-detail-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sub-detail-empty-icon food">
            <Utensils />
          </div>
          <h3>{t("dashboard.client.noEntries")}</h3>
          <p>{t("dashboard.client.findDieteticiensDesc")}</p>
        </motion.div>
      )}

      {/* Grouped by Date */}
      <AnimatePresence>
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dateKey, dayEntries]) => (
            <motion.div
              key={dateKey}
              className="food-date-group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="food-date-header">
                <Calendar />
                <h3>{new Date(dateKey).toLocaleDateString()}</h3>
                <span className="food-date-count">{dayEntries.length}</span>
              </div>

              {dayEntries.map(entry => (
                <div key={entry._id} className="food-entry">
                  <div className="food-entry-top">
                    <span className={`food-meal-badge ${entry.mealType}`}>
                      {t(`dashboard.client.${entry.mealType}`)}
                    </span>
                  </div>
                  <p className="food-entry-desc">{entry.description}</p>
                  {entry.notes && <p className="food-entry-notes">{entry.notes}</p>}

                  {entry.dieteticienFeedback ? (
                    <div className="food-feedback-existing">
                      <p className="food-feedback-label">{t("dashboard.client.yourFeedback")}:</p>
                      <p className="food-feedback-text">{entry.dieteticienFeedback}</p>
                    </div>
                  ) : (
                    <div className="food-feedback-form">
                      <input
                        type="text"
                        className="food-feedback-input"
                        value={feedback[entry._id] || ""}
                        onChange={(e) => setFeedback(prev => ({ ...prev, [entry._id]: e.target.value }))}
                        placeholder={t("dashboard.client.addFeedback")}
                      />
                      <button className="food-feedback-btn" onClick={() => handleFeedback(entry._id)}>
                        <Send />
                        {t("dashboard.client.send")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubscriberFoodLogs;
