import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Utensils, Plus, Trash, Calendar, Lock, ArrowRight, MessageSquare } from "lucide-react";
import { getMyEntries, createEntry, deleteEntry } from "../../api/foodDiaryApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import "./ClientDashboard.css";

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
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, entriesRes] = await Promise.all([getMySubscriptions(), getMyEntries()]);
        if (subRes.success) { const active = subRes.data.find(s => s.isActive); setActiveSub(active || null); }
        if (entriesRes.success) setEntries(entriesRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!description) { toast.error(t("dashboard.client.description") + " is required"); return; }
    if (!activeSub) { toast.error(t("dashboard.client.needSubscription")); return; }
    setSubmitting(true);
    try {
      const data = {
        dieteticienId: activeSub.dieteticien._id,
        date,
        mealType,
        description,
        notes,
        calories: calories ? Number(calories) : undefined,
        protein: protein ? Number(protein) : undefined,
        carbs: carbs ? Number(carbs) : undefined,
        fat: fat ? Number(fat) : undefined
      };
      const res = await createEntry(data);
      if (res.success) {
        toast.success("Entry added");
        setDescription(""); setNotes(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
        const updated = await getMyEntries();
        if (updated.success) setEntries(updated.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteEntry(id); setEntries(prev => prev.filter(e => e._id !== id)); toast.success("Entry deleted"); }
    catch (err) { toast.error("Error"); }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading"><div className="cd-spinner" /><p>{t("dashboard.client.loading")}</p></div>
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
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cd-header">
        <div className="cd-header-icon blue"><Utensils /></div>
        <div>
          <h1 className="cd-title">{t("dashboard.client.foodDiary")}</h1>
          <p className="cd-subtitle">{t("dashboard.client.foodDiaryDesc")}</p>
        </div>
      </div>

      {/* Lock Screen */}
      {!activeSub ? (
        <motion.div className="cd-lock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cd-lock-icon"><Lock /></div>
          <h3>{t("dashboard.client.needSubscription")}</h3>
          <p>{t("dashboard.client.needSubscriptionDesc")}</p>
          <button className="cd-lock-btn" onClick={() => navigate("/client/my-subscriptions")}>
            {t("dashboard.client.goToSubscriptionsNow")} <ArrowRight />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Add Entry Form */}
          <motion.div className="cd-form-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cd-form-grid cols-2">
              <div className="cd-field">
                <label>{t("dashboard.client.date")}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="cd-field">
                <label>{t("dashboard.client.mealType")}</label>
                <select value={mealType} onChange={e => setMealType(e.target.value)}>
                  {MEAL_TYPES.map(m => (
                    <option key={m} value={m}>{t(`dashboard.client.${m}`)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="cd-field" style={{ marginTop: 14 }}>
              <label>{t("dashboard.client.description")} <span className="required">*</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t("dashboard.client.foodDescPlaceholder")} />
            </div>
            <div className="cd-field" style={{ marginTop: 14 }}>
              <label>{t("dashboard.client.notes")}</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("dashboard.client.notes")} />
            </div>
            <div className="cd-form-grid cols-4" style={{ marginTop: 14, gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <div className="cd-field">
                <label>Calories (kcal)</label>
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="cd-field">
                <label>Protein (g)</label>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="cd-field">
                <label>Carbs (g)</label>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="cd-field">
                <label>Fat (g)</label>
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="0" min="0" />
              </div>
            </div>
            <button className="cd-btn-primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? t("common.loading") : t("dashboard.client.addEntry")}
            </button>
          </motion.div>

          {/* Entries */}
          <AnimatePresence>
            {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([dateKey, dayEntries]) => (
              <motion.div key={dateKey} className="cd-date-group" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="cd-date-header">
                  <Calendar />
                  <h3>{new Date(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
                </div>
                {dayEntries.map(e => (
                  <div key={e._id} className="cd-entry">
                    <div className={`cd-entry-icon ${e.mealType}`}>
                      {t(`dashboard.client.${e.mealType}`).charAt(0)}
                    </div>
                    <div className="cd-entry-body">
                      <span className={`cd-meal-badge ${e.mealType}`}>{t(`dashboard.client.${e.mealType}`)}</span>
                      <p className="cd-entry-desc">{e.description}</p>
                      {e.notes && <p className="cd-entry-notes">{e.notes}</p>}
                      {(e.calories || e.protein || e.carbs || e.fat) && (
                        <div style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 8,
                          flexWrap: "wrap"
                        }}>
                          {e.calories && <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>{e.calories} kcal</span>}
                          {e.protein && <span style={{ fontSize: 12, color: "#0369a1", background: "#e0f2fe", padding: "3px 8px", borderRadius: 6 }}>{e.protein}g protein</span>}
                          {e.carbs && <span style={{ fontSize: 12, color: "#92400e", background: "#fef3c7", padding: "3px 8px", borderRadius: 6 }}>{e.carbs}g carbs</span>}
                          {e.fat && <span style={{ fontSize: 12, color: "#7c3aed", background: "#ede9fe", padding: "3px 8px", borderRadius: 6 }}>{e.fat}g fat</span>}
                        </div>
                      )}
                      {e.dieteticienFeedback && (
                        <div className="cd-entry-feedback">
                          <strong>{t("dashboard.client.dieteticienFeedback")}:</strong>
                          <p>{e.dieteticienFeedback}</p>
                        </div>
                      )}
                    </div>
                    <button className="cd-delete-btn" onClick={() => handleDelete(e._id)}><Trash /></button>
                  </div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>

          {Object.keys(grouped).length === 0 && (
            <div className="cd-empty">
              <div className="cd-empty-icon blue"><Utensils /></div>
              <h3>{t("dashboard.client.noEntries")}</h3>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default FoodDiary;
