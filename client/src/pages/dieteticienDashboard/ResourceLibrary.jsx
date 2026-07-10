import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMyResources, createResource, deleteResource } from "../../api/resourceApi";
import "./ClientsPage.css";

const Icons = {
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
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
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="cp-add-btn"
        >
          <Icons.Plus /> {t('dashboard.client.addResource')}
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#f9fafb", borderRadius: 16, padding: "1.5rem", marginBottom: 24, border: "1.5px solid #e5e7eb" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.title')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.file')}</label>
            <div style={{
              border: "2px dashed #d1d5db", borderRadius: 12, padding: "1rem",
              textAlign: "center", cursor: "pointer", background: file ? "#ecfdf5" : "#fff",
              borderColor: file ? "#10b981" : "#d1d5db"
            }}
              onClick={() => document.getElementById("resourceFile").click()}>
              {file ? (
                <p style={{ fontSize: 13, color: "#059669", margin: 0 }}>{file.name}</p>
              ) : (
                <div>
                  <Icons.Upload />
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>{t('dashboard.client.clickToUpload')}</p>
                </div>
              )}
            </div>
            <input id="resourceFile" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              hidden onChange={e => setFile(e.target.files[0])} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14 }}>
              {t('common.cancel')}
            </button>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={submitting}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14
              }}>
              {submitting ? t('common.loading') : t('common.save')}
            </motion.button>
          </div>
        </motion.div>
      )}

      {resources.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noResources')}
        </p>
      ) : (
        <div className="cp-grid">
          {resources.map(r => (
            <motion.div key={r._id} className="cp-card" whileHover={{ translateY: -4 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", flexShrink: 0
                }}>
                  <Icons.FileText />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{r.title}</h3>
                  {r.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{r.description}</p>}
                  {r.fileName && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>{r.fileName}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
                      borderRadius: 8, border: "1.5px solid #10b981", color: "#059669",
                      fontSize: 12, fontWeight: 500, textDecoration: "none", background: "#ecfdf5"
                    }}>
                    <Icons.Download /> {t('dashboard.client.download')}
                  </a>
                )}
                <button onClick={() => handleDelete(r._id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
                    borderRadius: 8, border: "1.5px solid #ef4444", color: "#dc2626",
                    fontSize: 12, fontWeight: 500, cursor: "pointer", background: "#fef2f2"
                  }}>
                  <Icons.Trash /> {t('common.delete')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ResourceLibrary;
