import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSubscriberProgress } from "../../api/progressApi";
import "./ClientsPage.css";

const SubscriberProgress = () => {
  const { clientId } = useParams();
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <h1 className="cp-title">{t('dashboard.client.progressTracking')}</h1>
        <p className="cp-subtitle">{entries[0]?.client?.fullName || "Client"}</p>
      </div>

      {sorted.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noProgress')}
        </p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.date')}</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.weight')} (kg)</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.waist')} (cm)</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.bodyFat')} (%)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(e => (
                  <tr key={e._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{e.weight}</td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{e.waist || "-"}</td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{e.bodyFat || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubscriberProgress;
