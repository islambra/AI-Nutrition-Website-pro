import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMyResources, createResource, deleteResource } from "../../api/resourceApi";
import "./ClientsPage.css";

const Icons = {
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Upload: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  FolderOpen: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
};

const ResourceLibrary = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await getMyResources();
      if (res.success) setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title) {
      toast.error(t('dashboard.client.title') + " is required");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("resourceFile", file);

      const res = await createResource(formData);
      if (res.success) {
        toast.success("Resource created");
        setShowForm(false);
        setTitle("");
        setDescription("");
        setFile(null);
        fetchResources();
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
        fetchResources();
      }
    } catch (err) {
      toast.error("Error deleting resource");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <div>
          <h1 className="cp-title">{t('dashboard.sidebar.resourceLibrary')}</h1>
          <p className="cp-subtitle">{t('dashboard.client.resourcesDesc')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px", borderRadius: 40, border: "none",
            background: showForm
              ? "#fef2f2"
              : "linear-gradient(135deg, #059669, #10b981)",
            color: showForm ? "#dc2626" : "#fff",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            boxShadow: showForm ? "none" : "0 2px 8px rgba(16,185,129,0.25)",
          }}
        >
          <span style={{ display: "flex", transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
            <Icons.Plus />
          </span>
          {showForm ? t('common.cancel') : t('dashboard.client.addResource')}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              background: "#fff", borderRadius: 20, padding: "1.5rem",
              marginBottom: 24, border: "1.5px solid #e5e7eb",
              boxShadow: "0 8px 25px rgba(0,0,0,0.06)"
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.title')} <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder={t('dashboard.client.title')}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.description')}</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder={t('dashboard.client.description')}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical",
                  outline: "none", transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.file')}</label>
              <motion.div
                whileHover={{ borderColor: "#10b981", background: "#f0fdf4" }}
                onClick={() => document.getElementById("resourceFile").click()}
                style={{
                  border: "2px dashed", borderRadius: 16, padding: "1.5rem 1rem",
                  textAlign: "center", cursor: "pointer",
                  borderColor: file ? "#10b981" : "#d1d5db",
                  background: file ? "#ecfdf5" : "#f9fafb",
                  transition: "all 0.2s"
                }}
              >
                {file ? (
                  <div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: "#059669" }}>
                      <Icons.FileText />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#059669", margin: 0 }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "#10b981" }}>
                      <Icons.Upload />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0 }}>{t('dashboard.client.clickToUpload')}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>PDF, DOC, XLS, PPT, TXT, JPG, PNG</p>
                  </div>
                )}
              </motion.div>
              <input id="resourceFile" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                hidden onChange={e => setFile(e.target.files[0])} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setShowForm(false); setFile(null); }}
                style={{
                  padding: "10px 28px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                  background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#6b7280"
                }}>
                {t('common.cancel')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={submitting}
                style={{
                  padding: "10px 28px", borderRadius: 12, border: "none",
                  background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14,
                  boxShadow: submitting ? "none" : "0 2px 8px rgba(16,185,129,0.25)"
                }}>
                {submitting ? t('common.loading') : t('common.save')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {resources.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center", padding: "4rem 2rem",
            background: "#f9fafb", borderRadius: 20,
            border: "1.5px dashed #e5e7eb"
          }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#10b981" }}>
            <Icons.FolderOpen />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>{t('dashboard.sidebar.resourceLibrary')}</h3>
            <p style={{ fontSize: 14, color: "#9ca3af", maxWidth: 400, margin: "0 auto 20px" }}>
              {t('dashboard.client.resourcesDesc')}
            </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 40, border: "none",
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
            }}>
            <Icons.Plus /> {t('dashboard.client.addResource')}
          </motion.button>
        </motion.div>
      ) : (
        <div className="cp-grid">
          {resources.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="cp-card"
              whileHover={{ translateY: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
              style={{ padding: "1.25rem" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#d97706", flexShrink: 0
                }}>
                  <Icons.FileText />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{r.title}</h3>
                  {r.description && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{r.description}</p>
                  )}
                  {r.fileName && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.fileName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
                      borderRadius: 10, border: "1.5px solid #10b981", color: "#059669",
                      fontSize: 13, fontWeight: 500, textDecoration: "none",
                      background: "#ecfdf5", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.target.style.background = "#d1fae5"; e.target.style.borderColor = "#059669"; }}
                    onMouseLeave={e => { e.target.style.background = "#ecfdf5"; e.target.style.borderColor = "#10b981"; }}
                  >
                    <Icons.Download /> {t('dashboard.client.download')}
                  </a>
                )}
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(r._id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
                    borderRadius: 10, border: "1.5px solid #fca5a5", color: "#dc2626",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#fef2f2",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.target.style.background = "#fee2e2"; e.target.style.borderColor = "#ef4444"; }}
                  onMouseLeave={e => { e.target.style.background = "#fef2f2"; e.target.style.borderColor = "#fca5a5"; }}
                >
                  <Icons.Trash /> {t('common.delete')}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ResourceLibrary;
