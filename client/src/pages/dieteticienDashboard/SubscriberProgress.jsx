import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Activity, Calendar, TrendingUp } from "lucide-react";
import { getSubscriberProgress } from "../../api/progressApi";
import "./SubscribersList.css";

const SubscriberProgress = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSubscriberProgress(clientId);
        if (res.success) setEntries(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [clientId]);

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

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div className="sub-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sub-detail-header">
        <button className="sub-detail-back" onClick={() => navigate("/dieteticien/subscribers")}>
          <ArrowLeft />
        </button>
        <div className="sub-detail-icon-wrap progress">
          <Activity />
        </div>
        <div>
          <h1 className="sub-detail-title">{t("dashboard.client.progressTracking")}</h1>
          <p className="sub-detail-subtitle">{entries[0]?.client?.fullName || "Client"}</p>
        </div>
      </div>

      {/* Empty */}
      {sorted.length === 0 && (
        <motion.div className="sub-detail-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sub-detail-empty-icon progress">
            <TrendingUp />
          </div>
          <h3>{t("dashboard.client.noProgress")}</h3>
          <p>{t("dashboard.client.findDieteticiensDesc")}</p>
        </motion.div>
      )}

      {/* Table */}
      {sorted.length > 0 && (
        <motion.div
          className="progress-table-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <table className="progress-table">
            <thead>
              <tr>
                <th>{t("dashboard.client.date")}</th>
                <th>{t("dashboard.client.weight")} (kg)</th>
                <th>{t("dashboard.client.waist")} (cm)</th>
                <th>{t("dashboard.client.bodyFat")} (%)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(entry => (
                <tr key={entry._id}>
                  <td>
                    <span className="progress-cell-date">
                      <Calendar />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="progress-cell-value">{entry.weight}</span>
                  </td>
                  <td>
                    {entry.waist ? (
                      <span className="progress-cell-value">{entry.waist}</span>
                    ) : (
                      <span className="progress-cell-na">—</span>
                    )}
                  </td>
                  <td>
                    {entry.bodyFat ? (
                      <span className="progress-cell-value">{entry.bodyFat}</span>
                    ) : (
                      <span className="progress-cell-na">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubscriberProgress;
