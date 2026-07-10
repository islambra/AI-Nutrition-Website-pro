import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyEntries, createEntry, deleteEntry } from "../../api/foodDiaryApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  MessageSquare: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Lock: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const FoodDiary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    if (!description) { toast.error(t('dashboard.client.description') + " is required"); return; }
    if (!activeSub) { toast.error(t('dashboard.client.needSubscription')); return; }
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center", padding: "3rem 2rem",
            background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            borderRadius: 20, border: "1.5px solid #fde68a",
            maxWidth: 480, margin: "0 auto"
          }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: "#fef3c7", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px", color: "#d97706"
          }}>
            <Icons.Lock />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#92400e", margin: "0 0 8px" }}>
            {t('dashboard.client.needSubscription')}
          </h3>
          <p style={{ fontSize: 14, color: "#b45309", margin: "0 0 20px", lineHeight: 1.5 }}>
            {t('dashboard.client.needSubscriptionDesc')}
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/client/my-subscriptions")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 40, border: "none",
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(217,119,6,0.3)"
            }}>
            {t('dashboard.client.goToSubscriptionsNow')} <Icons.ArrowRight />
          </motion.button>
        </motion.div>
      ) : (
        <>
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#fff", borderRadius: 20, padding: "1.5rem",
                marginBottom: 24, border: "1.5px solid #e5e7eb",
                boxShadow: "0 8px 25px rgba(0,0,0,0.06)"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.date')}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.mealType')}</label>
                  <select value={mealType} onChange={e => setMealType(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                      background: "#fff"
                    }}>
                    {MEAL_TYPES.map(m => (
                      <option key={m} value={m}>{t(`dashboard.client.${m}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                  {t('dashboard.client.description')} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder={t('dashboard.client.foodDescPlaceholder')}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical", outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.notes')}</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder={t('dashboard.client.notes')}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", fontWeight: 600, fontSize: 14,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 2px 8px rgba(16,185,129,0.25)"
                }}>
                {submitting ? t('common.loading') : t('dashboard.client.addEntry')}
              </motion.button>
            </motion.div>
          </ScrollReveal>

          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([dateKey, dayEntries]) => (
            <div key={dateKey} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "#374151" }}>
                {new Date(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              {dayEntries.map(e => (
                <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="aff-card aff-card-primary"
                  style={{ padding: "1rem", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: e.mealType === "breakfast" ? "#fef3c7" : e.mealType === "lunch" ? "#dbeafe" : e.mealType === "dinner" ? "#fce7f3" : "#e0e7ff",
                    color: e.mealType === "breakfast" ? "#d97706" : e.mealType === "lunch" ? "#2563eb" : e.mealType === "dinner" ? "#db2777" : "#4338ca",
                    fontSize: 11, fontWeight: 700
                  }}>
                    {t(`dashboard.client.${e.mealType}`).charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: e.mealType === "breakfast" ? "#fef3c7" : e.mealType === "lunch" ? "#dbeafe" : e.mealType === "dinner" ? "#fce7f3" : "#e0e7ff",
                        color: e.mealType === "breakfast" ? "#d97706" : e.mealType === "lunch" ? "#2563eb" : e.mealType === "dinner" ? "#db2777" : "#4338ca",
                      }}>
                        {t(`dashboard.client.${e.mealType}`)}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0", fontSize: 14, color: "#374151" }}>{e.description}</p>
                    {e.notes && <p style={{ margin: "2px 0", fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>{e.notes}</p>}
                    {e.dieteticienFeedback && (
                      <div style={{
                        marginTop: 8, padding: "8px 12px", background: "#ecfdf5",
                        borderRadius: 8, borderLeft: "3px solid #10b981", fontSize: 13
                      }}>
                        <span style={{ fontWeight: 600, color: "#059669" }}>{t('dashboard.client.dieteticienFeedback')}: </span>
                        <span style={{ color: "#047857" }}>{e.dieteticienFeedback}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(e._id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#9ca3af", padding: 4, flexShrink: 0
                    }}>
                    <Icons.Trash />
                  </button>
                </motion.div>
              ))}
            </div>
          ))}

          {Object.keys(grouped).length === 0 && activeSub && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0", fontSize: 14 }}>
              {t('dashboard.client.noEntries')}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default FoodDiary;
