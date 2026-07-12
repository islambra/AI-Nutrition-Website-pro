import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FileText, Plus, Trash, Download, Upload, FolderOpen, Users, X, ChevronDown } from "lucide-react";
import { getMyResources, createResource, deleteResource } from "../../api/resourceApi";
import { getSubscribers } from "../../api/dieteticienSubscriptionApi";
import "./ResourceLibrary.css";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  }),
};

const ResourceLibrary = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [subscriberId, setSubscriberId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [resRes, subRes] = await Promise.all([getMyResources(), getSubscribers()]);
        if (resRes.success) setResources(resRes.data);
        if (subRes.success) setSubscribers(subRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCreate = async () => {
    if (!title) { toast.error(t("dashboard.client.title") + " is required"); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (subscriberId) formData.append("subscriberId", subscriberId);
      if (file) formData.append("resourceFile", file);

      const res = await createResource(formData);
      if (res.success) {
        toast.success("Resource created");
        setShowForm(false);
        setTitle(""); setDescription(""); setFile(null); setSubscriberId("");
        const updated = await getMyResources();
        if (updated.success) setResources(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteResource(id);
      if (res.success) {
        toast.success("Resource deleted");
        setResources(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      toast.error("Error deleting resource");
    }
  };

  if (loading) {
    return (
      <div className="rl-page">
        <div className="rl-loading">
          <div className="rl-spinner" />
          <p>{t("dashboard.client.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="rl-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="rl-header">
        <div className="rl-header-left">
          <div className="rl-icon-wrap"><FolderOpen /></div>
          <div>
            <h1 className="rl-title">{t("dashboard.sidebar.resourceLibrary")}</h1>
            <p className="rl-subtitle">{t("dashboard.client.resourcesDesc")}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {resources.length > 0 && (
            <div className="rl-count-badge">
              <FileText size={16} />
              {resources.length}
            </div>
          )}
          <button className={`rl-toggle-btn ${showForm ? "cancel" : "add"}`} onClick={() => setShowForm(!showForm)}>
            <Plus style={{ transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
            {showForm ? t("common.cancel") : t("dashboard.client.addResource")}
          </button>
        </div>
      </div>

      {/* Add Resource Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="rl-form-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="rl-form-grid">
              <div className="rl-field">
                <label>{t("dashboard.client.title")} <span className="required">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t("dashboard.client.title")} />
              </div>
              <div className="rl-field">
                <label>{t("dashboard.client.shareWith")}</label>
                <div style={{ position: "relative" }}>
                  <select value={subscriberId} onChange={e => setSubscriberId(e.target.value)} style={{ appearance: "none", paddingRight: 36 }}>
                    <option value="">{t("dashboard.client.allSubscribers")}</option>
                    {subscribers.map(s => (
                      <option key={s.client?._id} value={s.client?._id}>{s.client?.fullName}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>
            <div className="rl-field rl-field-mt">
              <label>{t("dashboard.client.resourceDescription")}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t("dashboard.client.resourceDescription")} />
            </div>
            <div className="rl-field rl-field-mt">
              <label>{t("dashboard.client.file")}</label>
              <div className={`rl-upload-zone ${file ? "has-file" : ""}`} onClick={() => document.getElementById("rlFileInput").click()}>
                {file ? (
                  <>
                    <div className="rl-upload-icon"><FileText /></div>
                    <p className="rl-file-name">{file.name}</p>
                    <p className="rl-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <div className="rl-upload-icon"><Upload /></div>
                    <p className="rl-upload-text">{t("dashboard.client.clickToUploadResource")}</p>
                    <p className="rl-upload-hint">PDF, DOC, XLS, PPT, TXT, JPG, PNG</p>
                  </>
                )}
              </div>
              <input id="rlFileInput" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" hidden onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="rl-form-actions">
              <button className="rl-btn-cancel" onClick={() => { setShowForm(false); setFile(null); setSubscriberId(""); }}>{t("common.cancel")}</button>
              <button className="rl-btn-submit" onClick={handleCreate} disabled={submitting}>
                {submitting ? t("common.loading") : t("common.save")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {resources.length === 0 && !showForm && (
        <motion.div className="rl-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rl-empty-icon"><FolderOpen /></div>
          <h3>{t("dashboard.sidebar.resourceLibrary")}</h3>
          <p>{t("dashboard.client.resourcesDesc")}</p>
          <button className="rl-empty-btn" onClick={() => setShowForm(true)}>
            <Plus /> {t("dashboard.client.addResource")}
          </button>
        </motion.div>
      )}

      {/* Resource Grid */}
      {resources.length > 0 && (
        <div className="rl-grid">
          <AnimatePresence>
            {resources.map((r, i) => (
              <motion.div key={r._id} className="rl-card" custom={i} variants={cardVariants} initial="hidden" animate="visible" layout>
                <div className="rl-card-bar" />
                <div className="rl-card-body">
                  <div className="rl-card-top">
                    <div className="rl-card-icon"><FileText /></div>
                    <div className="rl-card-info">
                      <h3 className="rl-card-title">{r.title}</h3>
                      {r.description && <p className="rl-card-desc">{r.description}</p>}
                      {r.fileName && <p className="rl-card-filename">{r.fileName}</p>}
                    </div>
                  </div>

                  {/* Shared Badge */}
                  <div className={`rl-shared-badge ${r.subscriber ? "specific" : "all"}`}>
                    <Users />
                    {r.subscriber ? r.subscriber.fullName : t("dashboard.client.allSubscribers")}
                  </div>

                  {/* Actions */}
                  <div className="rl-card-actions">
                    {r.fileUrl && (
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="rl-action-btn download">
                        <Download /> {t("dashboard.client.download")}
                      </a>
                    )}
                    <button className="rl-action-btn delete" onClick={() => handleDelete(r._id)}>
                      <Trash /> {t("common.delete")}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ResourceLibrary;
