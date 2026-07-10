import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMyProgress, createProgressEntry, deleteProgressEntry } from "../../api/progressApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Weight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
};

const ProgressTracking = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await getMyProgress({ startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() });
      if (res.success) setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!weight) { toast.error("Weight is required"); return; }
    setSubmitting(true);
    try {
      const res = await createProgressEntry({
        weight: parseFloat(weight),
        waist: waist ? parseFloat(waist) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        date
      });
      if (res.success) {
        toast.success("Progress logged");
        setWeight("");
        setWaist("");
        setBodyFat("");
        fetchEntries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProgressEntry(id);
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

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <div className="aff-hero">
          <h1 className="aff-hero-title">{t('dashboard.client.progressTracking')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.progressDesc')}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div style={{ background: "#f9fafb", borderRadius: 16, padding: "1.5rem", marginBottom: 24, border: "1.5px solid #e5e7eb" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.date')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>
                {t('dashboard.client.weight')} (kg) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>
                {t('dashboard.client.waist')} (cm)
              </label>
              <input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>
                {t('dashboard.client.bodyFat')} (%)
              </label>
              <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={submitting}
            style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14,
              display: "flex", alignItems: "center", gap: 8
            }}>
            <Icons.Plus /> {submitting ? t('common.loading') : t('dashboard.client.logProgress')}
          </motion.button>
        </div>
      </ScrollReveal>

      {sorted.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0" }}>
          {t('dashboard.client.noProgress')}
        </p>
      ) : (
        <ScrollReveal>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.date')}</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.weight')} (kg)</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.waist')} (cm)</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{t('dashboard.client.bodyFat')} (%)</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb" }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(e => (
                  <tr key={e._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{e.weight}</td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{e.waist || "-"}</td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{e.bodyFat || "-"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => handleDelete(e._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      )}
    </motion.div>
  );
};

export default ProgressTracking;
