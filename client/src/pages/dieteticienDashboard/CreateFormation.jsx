import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Upload, X, FileText } from "lucide-react";
import { createFormation, updateFormation, getFormationById } from "../../api/formationApi";
import toast from "react-hot-toast";

const CreateFormation = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pdfInputRefs = useRef({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    sessionsCount: "",
    durationWeeks: "",
    startDate: "",
    files: [],
  });

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await getFormationById(id);
          if (res.success) {
            const f = res.data;
            setForm({
              title: f.title || "",
              description: f.description || "",
              price: f.price?.toString() || "",
              image: null,
              sessionsCount: f.sessionsCount?.toString() || "",
              durationWeeks: f.durationWeeks?.toString() || "",
              startDate: f.startDate ? new Date(f.startDate).toISOString().slice(0, 16) : "",
              files: f.files || [],
            });
            if (f.image) setImagePreview(f.image);
          }
        } catch {
          toast.error("Failed to load formation");
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [id, isEdit]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFile = () => {
    setForm((prev) => ({
      ...prev,
      files: [...prev.files, { name: "", url: "", type: "pdf", fileObj: null }],
    }));
  };

  const updateFile = (index, field, value) => {
    const updated = [...form.files];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, files: updated }));
  };

  const handleTypeChange = (index, value) => {
    const updated = [...form.files];
    if (value !== "pdf" && updated[index].fileObj) {
      updated[index] = { ...updated[index], type: value, fileObj: null, url: "" };
    } else {
      updated[index] = { ...updated[index], type: value };
    }
    setForm((prev) => ({ ...prev, files: updated }));
  };

  const handlePdfPick = (index) => {
    pdfInputRefs.current[index]?.click();
  };

  const handlePdfChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const updated = [...form.files];
      updated[index] = { ...updated[index], name: file.name, fileObj: file, url: "" };
      setForm((prev) => ({ ...prev, files: updated }));
    }
  };

  const removeFileEntry = (index) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.durationWeeks || !form.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        sessionsCount: Number(form.sessionsCount) || 0,
        durationWeeks: Number(form.durationWeeks),
        startDate: new Date(form.startDate).toISOString(),
        files: form.files,
        image: form.image,
      };

      const res = isEdit ? await updateFormation(id, payload) : await createFormation(payload);
      if (res.success) {
        toast.success(isEdit ? "Formation updated!" : "Formation created!");
        navigate("/dieteticien/formations");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save formation");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="AP-Spin" size={48} />
      </div>
    );
  }

  return (
    <div className="mc-container" style={{ maxWidth: 700 }}>
      <button onClick={() => navigate("/dieteticien/formations")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 14, padding: 0, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Formations
      </button>

      <h2 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 800 }}>
        {isEdit ? "Edit Formation" : "Create New Formation"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Title *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Price (DZD) *</label>
            <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Duration (weeks) *</label>
            <input type="number" value={form.durationWeeks} onChange={(e) => setForm((p) => ({ ...p, durationWeeks: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Number of Sessions</label>
            <input type="number" value={form.sessionsCount} onChange={(e) => setForm((p) => ({ ...p, sessionsCount: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Start Date *</label>
          <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Description *</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Image (optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          {imagePreview ? (
            <div style={{ position: "relative", width: "100%", maxWidth: 320, borderRadius: 8, overflow: "hidden" }}>
              <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <button type="button" onClick={handleRemoveImage} style={{ position: "absolute", top: 6, right: 6, background: "#ef4444", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleImageClick} style={{ width: "100%", maxWidth: 320, height: 140, border: "2px dashed #d1d5db", borderRadius: 8, background: "#f9fafb", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#6b7280", fontSize: 13 }}>
              <Upload size={24} />
              <span>Click to upload image</span>
            </button>
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Files / Resources (optional)</label>
            <button type="button" onClick={addFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={14} /> Add File
            </button>
          </div>
          {form.files.map((file, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                placeholder="File name"
                value={file.name}
                onChange={(e) => updateFile(i, "name", e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, minWidth: 0 }}
              />
              {file.type === "pdf" ? (
                <>
                  <input
                    ref={(el) => { pdfInputRefs.current[i] = el; }}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handlePdfChange(i, e)}
                    style={{ display: "none" }}
                  />
                  {file.fileObj ? (
                    <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, background: "#f0fdf4", color: "#16a34a", minWidth: 0 }}>
                      <FileText size={14} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileObj.name}</span>
                      <button type="button" onClick={() => {
                        const updated = [...form.files];
                        updated[i] = { ...updated[i], fileObj: null, url: "" };
                        setForm((prev) => ({ ...prev, files: updated }));
                      }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, marginLeft: "auto" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : file.url ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ flex: 2, display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, color: "#2563eb", textDecoration: "none", minWidth: 0 }}>
                      <FileText size={14} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.url.split("/").pop()}</span>
                    </a>
                  ) : (
                    <button type="button" onClick={() => handlePdfPick(i)} style={{ flex: 2, padding: "8px 10px", borderRadius: 6, border: "1px dashed #d1d5db", fontSize: 13, background: "#f9fafb", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 0 }}>
                      <Upload size={14} /> Choose PDF
                    </button>
                  )}
                </>
              ) : (
                <input
                  placeholder="URL"
                  value={file.url}
                  onChange={(e) => updateFile(i, "url", e.target.value)}
                  style={{ flex: 2, padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, minWidth: 0 }}
                />
              )}
              <select value={file.type} onChange={(e) => handleTypeChange(i, e.target.value)} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}>
                <option value="pdf">PDF</option>
                <option value="drive">Drive</option>
                <option value="link">Link</option>
              </select>
              <button type="button" onClick={() => removeFileEntry(i)} style={{ background: "#fef2f2", border: "none", borderRadius: 6, cursor: "pointer", color: "#ef4444", padding: "8px 10px" }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} style={{
          padding: "14px 24px", fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer",
          justifyContent: "center", marginTop: 8, width: "100%",
          background: "linear-gradient(135deg, #059669, #10b981)",
          color: "#fff", borderRadius: 10, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "inherit",
          boxShadow: loading ? "none" : "0 4px 12px rgba(16, 185, 129, 0.25)",
          transition: "box-shadow 0.2s, transform 0.2s",
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 12px rgba(16, 185, 129, 0.25)"; e.currentTarget.style.transform = "none"; }}
        >
          {loading ? <Loader2 className="AP-Spin" size={18} /> : null}
          {isEdit ? "Update Formation" : "Create Formation"}
        </button>
      </form>
    </div>
  );
};

export default CreateFormation;
