import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Upload, X, FileText } from "lucide-react";
import { createFormation, updateFormation, getFormationById } from "../../api/formationApi";
import toast from "react-hot-toast";
import "./CreateFormation.css";

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
    endDate: "",
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
              endDate: f.endDate ? new Date(f.endDate).toISOString().slice(0, 16) : "",
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
    if (!form.title || !form.description || !form.price || !form.durationWeeks || !form.startDate || !form.endDate) {
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
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
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
    <div className="mc-container cf-container">
      <button onClick={() => navigate("/dieteticien/formations")} className="cf-back">
        <ArrowLeft size={16} /> Back to Formations
      </button>

      <h2 className="cf-title">
        {isEdit ? "Edit Formation" : "Create New Formation"}
      </h2>

      <form onSubmit={handleSubmit} className="cf-form">
        <div className="cf-grid">
          <div className="cf-field">
            <label className="cf-label">Title *</label>
            <input className="cf-input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="cf-field">
            <label className="cf-label">Price (DZD) *</label>
            <input className="cf-input" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="cf-field">
            <label className="cf-label">Duration (weeks) *</label>
            <input className="cf-input" type="number" value={form.durationWeeks} onChange={(e) => setForm((p) => ({ ...p, durationWeeks: e.target.value }))} />
          </div>
          <div className="cf-field">
            <label className="cf-label">Number of Sessions</label>
            <input className="cf-input" type="number" value={form.sessionsCount} onChange={(e) => setForm((p) => ({ ...p, sessionsCount: e.target.value }))} />
          </div>
        </div>

        <div className="cf-grid">
          <div className="cf-field">
            <label className="cf-label">Start Date *</label>
            <input className="cf-input" type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div className="cf-field">
            <label className="cf-label">End Date *</label>
            <input className="cf-input" type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </div>
        </div>

        <div className="cf-field">
          <label className="cf-label">Description *</label>
          <textarea className="cf-textarea" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>

        <div className="cf-field">
          <label className="cf-label">Image (optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          {imagePreview ? (
            <div className="cf-image-zone">
              <img src={imagePreview} alt="Preview" className="cf-image-preview" />
              <button type="button" onClick={handleRemoveImage} className="cf-image-remove-btn">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleImageClick} className="cf-image-upload-btn">
              <Upload size={24} />
              <span>Click to upload image</span>
            </button>
          )}
        </div>

        <div className="cf-field">
          <div className="cf-file-header">
            <label className="cf-label">Files / Resources (optional)</label>
            <button type="button" onClick={addFile} className="cf-file-add-btn">
              <Plus size={14} /> Add File
            </button>
          </div>
          {form.files.map((file, i) => (
            <div key={i} className="cf-file-row">
              <input
                className="cf-file-name"
                placeholder="File name"
                value={file.name}
                onChange={(e) => updateFile(i, "name", e.target.value)}
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
                    <div className="cf-file-pdf-label">
                      <FileText size={14} />
                      <span>{file.fileObj.name}</span>
                      <button type="button" onClick={() => {
                        const updated = [...form.files];
                        updated[i] = { ...updated[i], fileObj: null, url: "" };
                        setForm((prev) => ({ ...prev, files: updated }));
                      }} className="cf-file-pdf-clear">
                        <X size={14} />
                      </button>
                    </div>
                  ) : file.url ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="cf-file-pdf-link">
                      <FileText size={14} />
                      <span>{file.url.split("/").pop()}</span>
                    </a>
                  ) : (
                    <button type="button" onClick={() => handlePdfPick(i)} className="cf-file-pdf-choose">
                      <Upload size={14} /> Choose PDF
                    </button>
                  )}
                </>
              ) : (
                <input
                  className="cf-file-url"
                  placeholder="URL"
                  value={file.url}
                  onChange={(e) => updateFile(i, "url", e.target.value)}
                />
              )}
              <select className="cf-file-type" value={file.type} onChange={(e) => handleTypeChange(i, e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="drive">Drive</option>
                <option value="link">Link</option>
              </select>
              <button type="button" onClick={() => removeFileEntry(i)} className="cf-file-delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="cf-submit">
          {loading ? <Loader2 className="AP-Spin" size={18} /> : null}
          {isEdit ? "Update Formation" : "Create Formation"}
        </button>
      </form>
    </div>
  );
};

export default CreateFormation;
