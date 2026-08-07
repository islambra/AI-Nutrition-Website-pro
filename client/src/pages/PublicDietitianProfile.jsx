import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Stethoscope,
  CheckCircle,
  Calendar,
  Star,
  Shield,
  Clock,
  MessageCircle,
  Upload,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import {
  getPublicDieteticienById,
  subscribe,
  checkSubscriptionStatus,
} from "../api/dieteticienSubscriptionApi";
import ScrollReveal from "../components/ScrollReveal";
import "./PublicDietitianProfile.css";

const PublicDietitianProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dieteticien, setDieteticien] = useState(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ccp");
  const [proofImage, setProofImage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dRes] = await Promise.all([
          getPublicDieteticienById(id),
          user?.role === "client" ? checkSubscriptionStatus(id) : Promise.resolve({ success: false }),
        ]);
        if (dRes.success) setDieteticien(dRes.data);
        if (user?.role === "client") {
          const subRes = await checkSubscriptionStatus(id);
          if (subRes.success && subRes.hasActiveSubscription) {
            setHasActiveSub(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleSubscribe = async () => {
    if (!proofImage) {
      toast.error(t("findDietitiansProfile.uploadProofRequired"));
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
        toast.success(t("findDietitiansProfile.subscriptionSent"));
        setShowPaymentForm(false);
        setProofImage(null);
        navigate("/client/my-requests");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t("findDietitiansProfile.subscriptionError"));
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribeClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "client") {
      toast.error(t("findDietitiansProfile.clientOnly"));
      return;
    }
    setShowPaymentForm(true);
  };

  if (loading) {
    return (
      <div className="pdp-page">
        <div className="pdp-loading">
          <div className="pdp-spinner" />
          <p>{t("findDietitiansProfile.loading")}</p>
        </div>
      </div>
    );
  }

  if (!dieteticien) {
    return (
      <div className="pdp-page">
        <div className="pdp-empty">
          <Stethoscope size={48} />
          <h3>{t("findDietitiansProfile.notFound")}</h3>
          <p>{t("findDietitiansProfile.notFoundDesc")}</p>
          <button className="pdp-back-btn" onClick={() => navigate("/find-dietitians")}>
            {t("findDietitiansProfile.backToBrowse")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-page">
      {/* Hero Banner */}
      <section className="pdp-hero">
        <div className="pdp-hero-bg">
          <div className="pdp-hero-orb pdp-hero-orb-1" />
          <div className="pdp-hero-orb pdp-hero-orb-2" />
        </div>
        <div className="pdp-hero-content">
          <motion.button
            className="pdp-back-link"
            onClick={() => navigate("/find-dietitians")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ArrowLeft size={18} />
            <span>{t("findDietitiansProfile.backToBrowse")}</span>
          </motion.button>

          <motion.div
            className="pdp-profile-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="pdp-avatar-section">
              <div className="pdp-avatar">
                {dieteticien.photo ? (
                  <img src={dieteticien.photo} alt={dieteticien.fullName} loading="lazy" />
                ) : (
                  <span className="pdp-avatar-initials">
                    {dieteticien.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "?"}
                  </span>
                )}
              </div>
              <div className="pdp-verified-badge">
                <Shield size={14} />
              </div>
            </div>

            <div className="pdp-profile-info">
              <h1 className="pdp-name">{dieteticien.fullName}</h1>
              <div className="pdp-specialty">
                <Stethoscope size={15} />
                <span>{dieteticien.specialty || t("findDietitiansProfile.generalNutrition")}</span>
              </div>
              <div className="pdp-email">
                <Mail size={14} />
                <span>{dieteticien.email}</span>
              </div>
              <div className="pdp-rating">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="pdp-star-icon" />
                ))}
                <span>{t("findDietitiansProfile.verifiedProfessional")}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pdp-content">
        <div className="pdp-content-grid">
          {/* Left: About */}
          <ScrollReveal>
            <motion.div
              className="pdp-about-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="pdp-section-title">
                <span className="pdp-section-icon">
                  <Stethoscope size={16} />
                </span>
                {t("findDietitiansProfile.about")}
              </h3>
              <p className="pdp-about-text">
                {t("findDietitiansProfile.aboutText", {
                  name: dieteticien.fullName,
                  specialty: dieteticien.specialty || t("findDietitiansProfile.generalNutrition"),
                })}
              </p>

              <div className="pdp-features">
                <div className="pdp-feature">
                  <div className="pdp-feature-icon">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4>{t("findDietitiansProfile.personalizedPlans")}</h4>
                    <p>{t("findDietitiansProfile.personalizedPlansDesc")}</p>
                  </div>
                </div>
                <div className="pdp-feature">
                  <div className="pdp-feature-icon">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h4>{t("findDietitiansProfile.consultations")}</h4>
                    <p>{t("findDietitiansProfile.consultationsDesc")}</p>
                  </div>
                </div>
                <div className="pdp-feature">
                  <div className="pdp-feature-icon">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4>{t("findDietitiansProfile.followUp")}</h4>
                    <p>{t("findDietitiansProfile.followUpDesc")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Right: Subscription CTA */}
          <ScrollReveal direction="right">
            <motion.div
              className="pdp-subscribe-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {hasActiveSub ? (
                <div className="pdp-active-sub">
                  <div className="pdp-active-sub-icon">
                    <CheckCircle size={28} />
                  </div>
                  <h3>{t("findDietitiansProfile.activeSubscription")}</h3>
                  <p>{t("findDietitiansProfile.activeSubscriptionDesc")}</p>
                  <button
                    className="pdp-go-dashboard"
                    onClick={() => navigate("/client/my-subscriptions")}
                  >
                    {t("findDietitiansProfile.goToSubscriptions")}
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : !showPaymentForm ? (
                <div className="pdp-pricing">
                  <div className="pdp-pricing-badge">
                    <CreditCard size={14} />
                    <span>{t("findDietitiansProfile.subscription")}</span>
                  </div>
                  <div className="pdp-price">
                    <span className="pdp-price-amount">3,000</span>
                    <span className="pdp-price-currency">DZD</span>
                  </div>
                  <span className="pdp-price-period">/ {t("findDietitiansProfile.month")}</span>

                  <ul className="pdp-benefits">
                    <li>
                      <CheckCircle size={16} />
                      {t("findDietitiansProfile.benefit1")}
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      {t("findDietitiansProfile.benefit2")}
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      {t("findDietitiansProfile.benefit3")}
                    </li>
                    <li>
                      <CheckCircle size={16} />
                      {t("findDietitiansProfile.benefit4")}
                    </li>
                  </ul>

                  <motion.button
                    className="pdp-subscribe-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubscribeClick}
                  >
                    {user ? t("findDietitiansProfile.subscribeNow") : t("findDietitiansProfile.signInToSubscribe")}
                    <ChevronRight size={18} />
                  </motion.button>

                  {!user && (
                    <p className="pdp-login-hint">
                      {t("findDietitiansProfile.needAccount")}{" "}
                      <span onClick={() => navigate("/signup")}>
                        {t("findDietitiansProfile.createOne")}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="pdp-payment-form">
                  <h3 className="pdp-form-title">{t("findDietitiansProfile.paymentDetails")}</h3>
                  <div className="pdp-form-amount">
                    {t("findDietitiansProfile.amount")}: <strong>3,000 DZD</strong>
                  </div>

                  <div className="pdp-form-group">
                    <label>{t("findDietitiansProfile.paymentMethod")}</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="pdp-form-select"
                    >
                      <option value="ccp">CCP</option>
                      <option value="baridimob">BaridiMob</option>
                    </select>
                  </div>

                  <div className="pdp-form-group">
                    <label>{t("findDietitiansProfile.uploadProof")}</label>
                    <div
                      className={`pdp-upload-zone ${proofImage ? "pdp-upload-active" : ""}`}
                      onClick={() => document.getElementById("pdp-proof-input").click()}
                    >
                      {proofImage ? (
                        <p className="pdp-upload-filename">{proofImage.name}</p>
                      ) : (
                        <>
                          <Upload size={20} />
                          <p>{t("findDietitiansProfile.clickToUpload")}</p>
                        </>
                      )}
                    </div>
                    <input
                      id="pdp-proof-input"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setProofImage(e.target.files[0])}
                    />
                  </div>

                  <div className="pdp-form-actions">
                    <button
                      className="pdp-cancel-btn"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setProofImage(null);
                      }}
                    >
                      {t("common.cancel")}
                    </button>
                    <motion.button
                      className="pdp-confirm-btn"
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubscribe}
                      disabled={subscribing}
                    >
                      {subscribing ? t("common.loading") : t("findDietitiansProfile.confirmSubscribe")}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default PublicDietitianProfile;
