import { useState, useEffect } from "react";
import { getPlatformPaymentSettings, updatePlatformPaymentSettings } from "../../api/paymentApi";
import { useSafeTimeout } from "../../hooks/useSafeTimeout";
import { useTranslation } from "react-i18next";
import "./PlatformPaymentSettings.css";

const PlatformPaymentSettings = () => {
  const { setTimeoutSafe } = useSafeTimeout();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    ccpNumber: "",
    ccpKey: "",
    baridiMob: "",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeoutSafe(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPlatformPaymentSettings();
        if (res.success && res.data) {
          setFormData({
            ccpNumber: res.data.ccpNumber || "",
            ccpKey: res.data.ccpKey || "",
            baridiMob: res.data.baridiMob || "",
          });
        }
      } catch (err) {
        showNotification(err.response?.data?.message || t("admin.loadPaymentSettingsFailed"), "error");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baridiMob = formData.baridiMob.trim();
      if (baridiMob && !/^\d{20}$/.test(baridiMob)) {
        showNotification(t("validation.baridiMobInvalid"), "error");
        setLoading(false);
        return;
      }
      const res = await updatePlatformPaymentSettings({
        ccpNumber: formData.ccpNumber.trim() || null,
        ccpKey: formData.ccpKey.trim() || null,
        baridiMob: baridiMob || null,
      });
      if (res.success) {
        showNotification(t("admin.paymentSettingsUpdated"), "success");
        setFormData({
          ccpNumber: res.data.ccpNumber || "",
          ccpKey: res.data.ccpKey || "",
          baridiMob: res.data.baridiMob || "",
        });
      }
    } catch (err) {
      showNotification(err.response?.data?.message || t("admin.updatePaymentSettingsFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="create-user-page">
        <div className="loading-spinner-container">
          <div className="spinner-lg"></div>
          <p>{t("admin.loadingPaymentSettings")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-user-page">
      {notification && (
        <div className={`create-user-toast ${notification.type}`}>
          <div className="toast-content">
            {notification.type === "success" ? (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button className="toast-close" onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}

      <div className="create-user-background">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      <div className="create-user-container">
        <div className="create-user-header">
          <div className="header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
            <span>{t("admin.platformPayments")}</span>
          </div>
          <h1>{t("admin.paymentSettings")}</h1>
          <p>{t("admin.paymentSettingsDescription")}</p>
        </div>

        <div className="create-user-card">
          <form onSubmit={handleSubmit}>
            <div className="card-top-accent"></div>

            <div className="form-body">
              <div className="input-group">
                <label htmlFor="ccpNumber">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13L2 4" />
                  </svg>
                  {t("admin.ccpNumber")}
                </label>
                <input
                  id="ccpNumber"
                  type="text"
                  name="ccpNumber"
                  value={formData.ccpNumber}
                  onChange={handleChange}
                  placeholder={t("admin.ccpNumberPlaceholder")}
                />
              </div>

              <div className="input-group">
                <label htmlFor="ccpKey">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {t("admin.ccpKey")}
                </label>
                <input
                  id="ccpKey"
                  type="text"
                  name="ccpKey"
                  value={formData.ccpKey}
                  onChange={handleChange}
                  placeholder={t("admin.ccpKeyPlaceholder")}
                />
              </div>

              <div className="input-group">
                <label htmlFor="baridiMob">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="4" />
                    <path d="M16 17.5v-5" />
                    <path d="M12 17.5v-5" />
                    <path d="M8 17.5v-5" />
                    <path d="M8 8.5v-1" />
                    <path d="M12 8.5v-1" />
                    <path d="M16 8.5v-1" />
                  </svg>
                  {t("admin.baridiMobNumber")}
                </label>
                <input
                  id="baridiMob"
                  type="text"
                  inputMode="numeric"
                  name="baridiMob"
                  value={formData.baridiMob}
                  onChange={handleChange}
                  placeholder={t("admin.baridiMobPlaceholder")}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="form-footer">
              <div className="admin-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{t("admin.paymentInfoDescription")}</span>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      {t("admin.saving")}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                      {t("common.save")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlatformPaymentSettings;
