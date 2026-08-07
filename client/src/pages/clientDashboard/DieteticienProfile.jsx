import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getDieteticienById, subscribe, checkSubscriptionStatus } from "../../api/dieteticienSubscriptionApi";

import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
  Stethoscope: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

const DieteticienProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [dieteticien, setDieteticien] = useState(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [subEndDate, setSubEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ccp");
  const [proofImage, setProofImage] = useState(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dRes, subRes] = await Promise.all([
          getDieteticienById(id),
          checkSubscriptionStatus(id)
        ]);
        if (dRes.success) setDieteticien(dRes.data);
        if (subRes.success && subRes.hasActiveSubscription) {
          setHasActiveSub(true);
          setSubEndDate(subRes.subscription?.endDate || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSubscribe = async () => {
    if (!proofImage) {
      toast.error(t('dashboard.client.uploadProof'));
      return;
    }
    setSubscribing(true);
    try {
      const formData = new FormData();
      formData.append("dieteticienId", id);
      formData.append("paymentMethod", paymentMethod);
      formData.append("proofImage", proofImage);

      const res = await subscribe(formData);
      if (res.success) {
        toast.success(t('dashboard.client.subscriptionSent'));
        setShowPaymentForm(false);
        setProofImage(null);
        navigate("/client/my-requests");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('dashboard.client.subscriptionError'));
    } finally {
      setSubscribing(false);
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

  if (!dieteticien) {
    return (
      <div className="aff-dashboard">
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>{t('dashboard.client.dieteticienNotFound')}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <button onClick={() => navigate("/client/dieteticiens")} className="back-btn" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px",
          border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff",
          cursor: "pointer", fontSize: 14, color: "#374151", marginBottom: 24
        }}>
          <Icons.ArrowLeft />
          <span>{t('dashboard.client.backToList')}</span>
        </button>
      </ScrollReveal>

      <ScrollReveal>
        <div className="aff-hero" style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
            background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem"
          }}>
            {dieteticien.photo ? (
              <img src={dieteticien.photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#059669", transform: "scale(2)" }}><Icons.Stethoscope /></span>
            )}
          </div>
          <h1 className="aff-hero-title" style={{ marginBottom: 8 }}>{dieteticien.fullName}</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#6b7280", fontSize: 15, marginBottom: 8 }}>
            <Icons.Stethoscope />
            <span>{dieteticien.specialty}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#6b7280", fontSize: 14 }}>
            <Icons.Mail />
            <span>{dieteticien.email}</span>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          {hasActiveSub ? (
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              border: "1px solid #a7f3d0", borderRadius: 16,
              padding: "1.5rem 2rem", maxWidth: 400, margin: "0 auto"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#059669", marginBottom: 8 }}>
                <Icons.CheckCircle />
                <span style={{ fontWeight: 600, fontSize: 16 }}>{t('dashboard.client.subscriptionActive')}</span>
              </div>
              {subEndDate && (
                <p style={{ color: "#047857", fontSize: 14, margin: 0 }}>
                  {t('dashboard.client.expiresOn')} {new Date(subEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            !showPaymentForm ? (
              <div>
                <p style={{ fontSize: 24, fontWeight: 700, color: "#059669", marginBottom: 16 }}>
                  3,000 DZD <span style={{ fontSize: 14, fontWeight: 400, color: "#6b7280" }}>/ {t('dashboard.client.month')}</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPaymentForm(true)}
                  style={{
                    padding: "14px 48px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  {t('dashboard.client.subscribeNow')}
                </motion.button>
              </div>
            ) : (
              <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
                <div style={{ background: "#f9fafb", borderRadius: 16, padding: "1.5rem", border: "1.5px solid #e5e7eb" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>{t('dashboard.client.paymentDetails')}</h3>
                  <p style={{ fontSize: 14, color: "#374151", marginBottom: 12 }}>
                    {t('dashboard.client.amount')}: <strong>3,000 DZD</strong>
                  </p>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                      {t('dashboard.client.paymentMethod')}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 10,
                        border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                        background: "#fff"
                      }}
                    >
                      <option value="ccp">CCP</option>
                      <option value="baridimob">BaridiMob</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                      {t('dashboard.client.uploadProof')}
                    </label>
                    <div style={{
                      border: "2px dashed #d1d5db", borderRadius: 12,
                      padding: "1rem", textAlign: "center", cursor: "pointer",
                      background: proofImage ? "#ecfdf5" : "#fff",
                      borderColor: proofImage ? "#10b981" : "#d1d5db"
                    }}
                      onClick={() => document.getElementById("proofInput").click()}
                    >
                      {proofImage ? (
                        <p style={{ fontSize: 13, color: "#059669", margin: 0 }}>{proofImage.name}</p>
                      ) : (
                        <div>
                          <Icons.Upload />
                          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>{t('dashboard.client.clickToUpload')}</p>
                        </div>
                      )}
                    </div>
                    <input id="proofInput" type="file" accept="image/*" hidden
                      onChange={e => setProofImage(e.target.files[0])}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setShowPaymentForm(false); setProofImage(null); }}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                        background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151"
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubscribe}
                      disabled={subscribing}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 10, border: "none",
                        background: subscribing ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                        color: "#fff", fontSize: 14, fontWeight: 600, cursor: subscribing ? "not-allowed" : "pointer"
                      }}
                    >
                      {subscribing ? t('common.loading') : t('dashboard.client.confirmSubscribe')}
                    </motion.button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </ScrollReveal>
    </motion.div>
  );
};

export default DieteticienProfile;
