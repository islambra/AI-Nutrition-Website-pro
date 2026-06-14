import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createCourse } from "../../api/courseApi";
import {
  BookOpen,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  Link,
  ExternalLink,
  ChevronRight,
  Layers,
  Calendar,
  X,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import "./CreateCourse.css";

const LEVELS = [
  { value: "1", label: "Level 1", sub: "Foundation" },
  { value: "2", label: "Level 2", sub: "Intermediate" },
  { value: "3", label: "Level 3", sub: "Advanced" },
];

const SEMESTERS = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardPrefix = user?.role === "admin" ? "/admin" : "/dieteticien";
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [materialType, setMaterialType] = useState("pdf");
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    level: "",
    semester: "",
    pdfFile: null,
    url: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return;
    setFormData((prev) => ({ ...prev, pdfFile: file }));
    setPreviewPdf(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return;
    setFormData((prev) => ({ ...prev, pdfFile: file }));
    setPreviewPdf(URL.createObjectURL(file));
  };

  const removeFile = () => {
    if (previewPdf) URL.revokeObjectURL(previewPdf);
    setPreviewPdf(null);
    setFormData((prev) => ({ ...prev, pdfFile: null }));
  };

  const canGoNext = () => {
    if (step === 1) return formData.title.trim() && formData.level && formData.semester;
    if (step === 2) {
      if (materialType === "pdf") return formData.pdfFile !== null;
      return formData.url.trim() !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const validateForm = () => {
    if (!user) return false;
    if (!formData.title.trim()) return false;
    if (!formData.level) return false;
    if (!formData.semester) return false;
    if (materialType === "url" && !formData.url.trim()) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirm(false);
    if (!validateForm()) return;

    const payload = {
      ...formData,
      url: materialType === "url" ? formData.url : "",
      pdfFile: materialType === "pdf" ? formData.pdfFile : null,
    };

    setLoading(true);
    try {
      const response = await createCourse(payload);
      if (response.success) {
        navigate(`${dashboardPrefix}/all-courses`);
      }
    } catch {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!validateForm()) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setShowConfirm(true);
  };

  const renderStepIndicator = () => (
    <div className="cc-steps">
      {[
        { num: 1, label: "Info", icon: BookOpen },
        { num: 2, label: "Material", icon: FileText },
        { num: 3, label: "Review", icon: CheckCircle },
      ].map((s, i) => (
        <div
          key={s.num}
          className={`cc-step ${step === s.num ? "active" : ""} ${step > s.num ? "done" : ""}`}
          onClick={() => { if (s.num < step || step > s.num) setStep(s.num); }}
        >
          <div className="cc-step-circle">
            {step > s.num ? <CheckCircle size={16} /> : <s.icon size={16} />}
          </div>
          <span className="cc-step-label">{s.label}</span>
          {i < 2 && <div className={`cc-step-line ${step > s.num ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="cc-section animate-in">
      <div className="cc-section-header">
        <BookOpen size={20} />
        <div>
          <h2>Course Information</h2>
          <p>Tell us about the course you want to create</p>
        </div>
      </div>
      <div className="cc-grid">
        <div className="cc-form-group full-width">
          <label>
            Course Title <span className="cc-required">*</span>
          </label>
          <div className="cc-input-wrap">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Nutrition Science"
              maxLength={120}
            />
            <span className="cc-char-count">{formData.title.length}/120</span>
          </div>
        </div>
        <div className="cc-form-group">
          <label>
            Level <span className="cc-required">*</span>
          </label>
          <div className="cc-select-wrap">
            <Layers size={16} className="cc-field-icon" />
            <select name="level" value={formData.level} onChange={handleChange}>
              <option value="">Select Level</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} — {l.sub}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="cc-form-group">
          <label>
            Semester <span className="cc-required">*</span>
          </label>
          <div className="cc-select-wrap">
            <Calendar size={16} className="cc-field-icon" />
            <select name="semester" value={formData.semester} onChange={handleChange}>
              <option value="">Select Semester</option>
              {SEMESTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cc-section animate-in">
      <div className="cc-section-header">
        <FileText size={20} />
        <div>
          <h2>Course Material</h2>
          <p>Upload a PDF or provide a Drive link</p>
        </div>
      </div>

      <div className="cc-toggle-group">
        <button
          type="button"
          className={`cc-toggle-option ${materialType === "pdf" ? "active" : ""}`}
          onClick={() => setMaterialType("pdf")}
        >
          <Upload size={18} />
          <div>
            <strong>Upload PDF</strong>
            <small>File up to 10MB</small>
          </div>
        </button>
        <button
          type="button"
          className={`cc-toggle-option ${materialType === "url" ? "active" : ""}`}
          onClick={() => setMaterialType("url")}
        >
          <Link size={18} />
          <div>
            <strong>Drive Link</strong>
            <small>Google Drive URL</small>
          </div>
        </button>
      </div>

      <div className={`cc-panel ${materialType === "pdf" ? "visible" : ""}`}>
        {materialType === "pdf" && (
          previewPdf ? (
            <div className="cc-file-card">
              <div className="cc-file-card-info">
                <FileText size={28} />
                <div>
                  <span className="cc-file-name">{formData.pdfFile?.name}</span>
                  <span className="cc-file-size">
                    {formData.pdfFile
                      ? `${(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB`
                      : ""}
                  </span>
                </div>
              </div>
              <button type="button" className="cc-file-remove" onClick={removeFile}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <label
              className={`cc-drop-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="cc-drop-content">
                <Upload size={36} />
                <span className="cc-drop-title">Drop PDF here or click to browse</span>
                <span className="cc-drop-hint">PDF only — Max 10MB</span>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          )
        )}
      </div>

      <div className={`cc-panel ${materialType === "url" ? "visible" : ""}`}>
        {materialType === "url" && (
          <div className="cc-url-section">
            <div className="cc-url-field">
              <Link size={20} className="cc-url-icon" />
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="Paste your Google Drive link here..."
              />
            </div>
            <p className="cc-url-hint">
              <ExternalLink size={12} /> Make sure the link is publicly accessible
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cc-section animate-in">
      <div className="cc-section-header">
        <Sparkles size={20} />
        <div>
          <h2>Review & Create</h2>
          <p>Confirm everything looks correct</p>
        </div>
      </div>

      <div className="cc-review">
        <div className="cc-review-row">
          <span className="cc-review-label">Title</span>
          <span className="cc-review-value">{formData.title}</span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">Level</span>
          <span className="cc-review-value">
            {LEVELS.find((l) => l.value === formData.level)?.label} —{" "}
            {LEVELS.find((l) => l.value === formData.level)?.sub}
          </span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">Semester</span>
          <span className="cc-review-value">
            {SEMESTERS.find((s) => s.value === formData.semester)?.label}
          </span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">Material</span>
          <span className="cc-review-value">
            {materialType === "pdf"
              ? formData.pdfFile?.name || "No file selected"
              : formData.url || "No link provided"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-course-container">
      <button className="cc-back-link" onClick={() => navigate(`${dashboardPrefix}/all-courses`)}>
        <ArrowLeft size={18} /> Back to Courses
      </button>

      <div className="create-course-header">
        <h1>
          <BookOpen size={26} /> Create New Course
        </h1>
        <p>Add course materials organized by level and semester</p>
        {user && (
          <div className="cc-creator-badge">
            <span className="cc-creator-avatar">{user.fullName?.charAt(0)}</span>
            <span>
              Creating as <strong>{user.fullName}</strong> · {user.role}
            </span>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="create-course-form">
        {renderStepIndicator()}

        <div className="cc-step-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="cc-actions">
          {step < 3 ? (
            <>
              {step > 1 && (
                <button type="button" className="cc-ghost-btn" onClick={handleBack}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="cc-next-btn"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Next Step <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cc-ghost-btn" onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                className="cc-submit-btn"
                disabled={loading}
                onClick={handleCreateClick}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="cc-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Create Course
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {showConfirm && (
        <div className="cc-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Create this course?</h3>
            <p>This will publish the course immediately. You cannot undo this action.</p>
            <div className="cc-review cc-modal-review">
              <div className="cc-review-row">
                <span className="cc-review-label">Title</span>
                <span className="cc-review-value">{formData.title}</span>
              </div>
              <div className="cc-review-row">
                <span className="cc-review-label">Level</span>
                <span className="cc-review-value">
                  {LEVELS.find((l) => l.value === formData.level)?.label}
                </span>
              </div>
              <div className="cc-review-row">
                <span className="cc-review-label">Semester</span>
                <span className="cc-review-value">
                  {SEMESTERS.find((s) => s.value === formData.semester)?.label}
                </span>
              </div>
            </div>
            <div className="cc-modal-actions">
              <button
                type="button"
                className="cc-ghost-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cc-submit-btn"
                onClick={handleSubmit}
              >
                <Sparkles size={18} /> Yes, Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
