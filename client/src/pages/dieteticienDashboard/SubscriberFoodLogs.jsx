import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSubscriberEntries, addFeedback } from "../../api/foodDiaryApi";
import "./ClientsPage.css";

const Icons = {
  MessageSquare: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
};

const SubscriberFoodLogs = () => {
  const { clientId } = useParams();
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <h1 className="cp-title">{t('dashboard.client.foodDiary')}</h1>
        <p className="cp-subtitle">{entries[0]?.client?.fullName || "Client"}</p>
      </div>

      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([dateKey, dayEntries]) => (
        <div key={dateKey} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "#374151" }}>
            {new Date(dateKey).toLocaleDateString()}
          </h3>
          {dayEntries.map(e => (
            <div key={e._id} className="cp-card" style={{ padding: "1rem", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                  background: e.mealType === "breakfast" ? "#fef3c7" : e.mealType === "lunch" ? "#dbeafe" : e.mealType === "dinner" ? "#fce7f3" : "#e0e7ff",
                  color: e.mealType === "breakfast" ? "#d97706" : e.mealType === "lunch" ? "#2563eb" : e.mealType === "dinner" ? "#db2777" : "#4338ca"
                }}>
                  {t(`dashboard.client.${e.mealType}`)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{e.description}</p>
              {e.notes && <p style={{ margin: "4px 0", fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>{e.notes}</p>}

              {e.dieteticienFeedback ? (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#ecfdf5", borderRadius: 8, borderLeft: "3px solid #10b981" }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#059669" }}>{t('dashboard.client.yourFeedback')}:</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#047857" }}>{e.dieteticienFeedback}</p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input type="text" value={feedback[e._id] || ""}
                    onChange={val => setFeedback(prev => ({ ...prev, [e._id]: val.target.value }))}
                    placeholder={t('dashboard.client.addFeedback')}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13 }} />
                  <button onClick={() => handleFeedback(e._id)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "none",
                      background: "#10b981", color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4, fontSize: 13
                    }}>
                    <Icons.Send /> {t('dashboard.client.send')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noEntries')}
        </p>
      )}
    </motion.div>
  );
};

export default SubscriberFoodLogs;
