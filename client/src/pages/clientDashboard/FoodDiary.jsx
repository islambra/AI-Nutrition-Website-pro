import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMyEntries, createEntry, deleteEntry } from "../../api/foodDiaryApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  MessageSquare: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const FoodDiary = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState("breakfast");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, entriesRes] = await Promise.all([
          getMySubscriptions(),
          getMyEntries()
        ]);
        if (subRes.success) {
          const active = subRes.data.find(s => s.isActive);
          setActiveSub(active || null);
        }
        if (entriesRes.success) setEntries(entriesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!description) { toast.error("Description is required"); return; }
    if (!activeSub) { toast.error("No active subscription"); return; }
    setSubmitting(true);
    try {
      const res = await createEntry({
        dieteticienId: activeSub.dieteticien._id,
        date,
        mealType,
        description,
        notes
      });
      if (res.success) {
        toast.success("Entry added");
        setDescription("");
        setNotes("");
        const updated = await getMyEntries();
        if (updated.success) setEntries(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      toast.success("Entry deleted");
    } catch (err) {
      toast.error("Error");
    }
  };

  if (loading) {
    return (
      <div className="aff-dashboard">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <div className="aff-hero">
          <h1 className="aff-hero-title">{t('dashboard.client.foodDiary')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.foodDiaryDesc')}</p>
        </div>
      </ScrollReveal>

      {!activeSub ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
          {t('dashboard.client.needSubscription')}
        </div>
      ) : (
        <ScrollReveal>
          <div style={{ background: "#f9fafb", borderRadius: 16, padding: "1.5rem", marginBottom: 24, border: "1.5px solid #e5e7eb" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.date')}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.mealType')}</label>
                <select value={mealType} onChange={e => setMealType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff" }}>
                  {MEAL_TYPES.map(m => <option key={m} value={m}>{t(`dashboard.client.${m}`)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t('dashboard.client.foodDescPlaceholder')}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.notes')}</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none",
                background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14,
                display: "flex", alignItems: "center", gap: 8
              }}>
              <Icons.Plus /> {submitting ? t('common.loading') : t('dashboard.client.addEntry')}
            </motion.button>
          </div>
        </ScrollReveal>
      )}

      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([dateKey, dayEntries]) => (
        <ScrollReveal key={dateKey}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "1.5rem 0 0.75rem", color: "#374151" }}>
            {new Date(dateKey).toLocaleDateString()}
          </h3>
          {dayEntries.map(e => (
            <div key={e._id} className="aff-card aff-card-primary" style={{ padding: "1rem", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: e.mealType === "breakfast" ? "#fef3c7" : e.mealType === "lunch" ? "#dbeafe" : e.mealType === "dinner" ? "#fce7f3" : "#e0e7ff",
                      color: e.mealType === "breakfast" ? "#d97706" : e.mealType === "lunch" ? "#2563eb" : e.mealType === "dinner" ? "#db2777" : "#4338ca"
                    }}>
                      {t(`dashboard.client.${e.mealType}`)}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{e.description}</p>
                  {e.notes && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>{e.notes}</p>}
                  {e.dieteticienFeedback && (
                    <div style={{ marginTop: 8, padding: "8px 12px", background: "#ecfdf5", borderRadius: 8, borderLeft: "3px solid #10b981" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 2 }}>
                        <Icons.MessageSquare /> {t('dashboard.client.dieteticienFeedback')}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#047857" }}>{e.dieteticienFeedback}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(e._id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))}
        </ScrollReveal>
      ))}

      {Object.keys(grouped).length === 0 && activeSub && (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0" }}>
          {t('dashboard.client.noEntries')}
        </p>
      )}
    </motion.div>
  );
};

export default FoodDiary;
