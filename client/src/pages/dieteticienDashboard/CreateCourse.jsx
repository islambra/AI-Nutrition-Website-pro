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
  Plus,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardPrefix = user?.role === "admin" ? "/admin" : "/dieteticien";
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    level: "",
    semester: "",
    pdfFiles: [],
    url: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addFiles = (files) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf" && f.size <= 10 * 1024 * 1024
    );
    if (validFiles.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      pdfFiles: [...prev.pdfFiles, ...validFiles],
    }));
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
    }));
  };

  const canGoNext = () => {
    if (step === 1) return formData.title.trim() && formData.level && formData.semester;
    if (step === 2) {
      return formData.pdfFiles.length > 0 || formData.url.trim() !== "";
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
    if (formData.pdfFiles.length === 0 && !formData.url.trim()) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirm(false);
    if (!validateForm()) return;

    const payload = {
      ...formData,
      url: formData.url,
      pdfFiles: formData.pdfFiles,
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
        { num: 1, label: t('dashboard.dieteticien.createCourse.step1'), icon: BookOpen },
        { num: 2, label: t('dashboard.dieteticien.createCourse.step2'), icon: FileText },
        { num: 3, label: t('dashboard.dieteticien.createCourse.step3'), icon: CheckCircle },
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
          <h2>{t('dashboard.dieteticien.createCourse.step1Title')}</h2>
          <p>{t('dashboard.dieteticien.createCourse.step1Desc')}</p>
        </div>
      </div>
      <div className="cc-grid">
        <div className="cc-form-group full-width">
          <label>
            {t('dashboard.dieteticien.createCourse.courseTitle')} <span className="cc-required">*</span>
          </label>
          <div className="cc-input-wrap">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('dashboard.dieteticien.createCourse.courseTitlePlaceholder')}
              maxLength={120}
            />
            <span className="cc-char-count">{formData.title.length}/120</span>
          </div>
        </div>
        <div className="cc-form-group">
          <label>
            {t('dashboard.dieteticien.createCourse.level')} <span className="cc-required">*</span>
          </label>
          <div className="cc-select-wrap">
            <Layers size={16} className="cc-field-icon" />
            <select name="level" value={formData.level} onChange={handleChange}>
              <option value="">{t('dashboard.dieteticien.createCourse.selectLevel')}</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t('dashboard.dieteticien.createCourse.level' + l.value)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="cc-form-group">
          <label>
            {t('dashboard.dieteticien.createCourse.semester')} <span className="cc-required">*</span>
          </label>
          <div className="cc-select-wrap">
            <Calendar size={16} className="cc-field-icon" />
            <select name="semester" value={formData.semester} onChange={handleChange}>
              <option value="">{t('dashboard.dieteticien.createCourse.selectSemester')}</option>
              {SEMESTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {t('dashboard.dieteticien.createCourse.semester' + s.value)}
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
          <h2>{t('dashboard.dieteticien.createCourse.step2Title')}</h2>
          <p>{t('dashboard.dieteticien.createCourse.step2Desc')}</p>
        </div>
      </div>

      <div className="cc-panel visible">
        <div className="cc-panel-label">
          <Upload size={16} />
          <span>{t('dashboard.dieteticien.createCourse.uploadPdf')}</span>
        </div>

        {formData.pdfFiles.length > 0 && (
          <div className="cc-file-list">
            {formData.pdfFiles.map((file, index) => (
              <div key={index} className="cc-file-card">
                <div className="cc-file-card-info">
                  <FileText size={24} />
                  <div>
                    <span className="cc-file-name">{file.name}</span>
                    <span className="cc-file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button type="button" className="cc-file-remove" onClick={() => removeFile(index)}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className={`cc-drop-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="cc-drop-content">
            <Upload size={36} />
            <span className="cc-drop-title">
              {formData.pdfFiles.length > 0
                ? t('dashboard.dieteticien.createCourse.addMorePdf')
                : t('dashboard.dieteticien.createCourse.dropPdf')}
            </span>
            <span className="cc-drop-hint">{t('dashboard.dieteticien.createCourse.pdfOnly')}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div className="cc-panel visible">
        <div className="cc-panel-label">
          <Link size={16} />
          <span>{t('dashboard.dieteticien.createCourse.driveLink')}</span>
        </div>
        <div className="cc-url-section">
          <div className="cc-url-field">
            <Link size={20} className="cc-url-icon" />
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder={t('dashboard.dieteticien.createCourse.drivePlaceholder')}
            />
          </div>
          <p className="cc-url-hint">
            <ExternalLink size={12} /> {t('dashboard.dieteticien.createCourse.driveHint')}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cc-section animate-in">
      <div className="cc-section-header">
        <Sparkles size={20} />
        <div>
          <h2>{t('dashboard.dieteticien.createCourse.step3Title')}</h2>
          <p>{t('dashboard.dieteticien.createCourse.step3Desc')}</p>
        </div>
      </div>

      <div className="cc-review">
        <div className="cc-review-row">
          <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewTitle')}</span>
          <span className="cc-review-value">{formData.title}</span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewLevel')}</span>
          <span className="cc-review-value">
            {LEVELS.find((l) => l.value === formData.level)?.label} —{" "}
            {LEVELS.find((l) => l.value === formData.level)?.sub}
          </span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewSemester')}</span>
          <span className="cc-review-value">
            {SEMESTERS.find((s) => s.value === formData.semester)?.label}
          </span>
        </div>
        <div className="cc-review-row">
          <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewPdfs')}</span>
          <span className="cc-review-value">
            {formData.pdfFiles.length > 0
              ? `${formData.pdfFiles.length} PDF(s)`
              : t('dashboard.dieteticien.createCourse.noFile')}
          </span>
        </div>
        {formData.url && (
          <div className="cc-review-row">
            <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewLink')}</span>
            <span className="cc-review-value cc-review-url">{formData.url}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="create-course-container">
      <button className="cc-back-link" onClick={() => navigate(`${dashboardPrefix}/all-courses`)}>
        <ArrowLeft size={18} /> {t('dashboard.dieteticien.createCourse.back')}
      </button>

      <div className="create-course-header">
        <h1>
          <BookOpen size={26} /> {t('dashboard.dieteticien.createCourse.title')}
        </h1>
        <p>{t('dashboard.dieteticien.createCourse.subtitle')}</p>
        {user && (
          <div className="cc-creator-badge">
            <span className="cc-creator-avatar">{user.fullName?.charAt(0)}</span>
            <span>
              {t('dashboard.dieteticien.createCourse.creatingAs', { name: user.fullName, role: user.role })}
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
                  {t('common.back')}
                </button>
              )}
              <button
                type="button"
                className="cc-next-btn"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                {t('dashboard.dieteticien.createCourse.nextStep')} <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cc-ghost-btn" onClick={handleBack}>
                {t('common.back')}
              </button>
              <button
                type="button"
                className="cc-submit-btn"
                disabled={loading}
                onClick={handleCreateClick}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="cc-spin" /> {t('dashboard.dieteticien.createCourse.creating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> {t('dashboard.dieteticien.createCourse.createCourse')}
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
            <h3>{t('dashboard.dieteticien.createCourse.confirmTitle')}</h3>
            <p>{t('dashboard.dieteticien.createCourse.confirmDesc')}</p>
            <div className="cc-review cc-modal-review">
              <div className="cc-review-row">
                <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewTitle')}</span>
                <span className="cc-review-value">{formData.title}</span>
              </div>
              <div className="cc-review-row">
                <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewLevel')}</span>
                <span className="cc-review-value">
                  {LEVELS.find((l) => l.value === formData.level)?.label}
                </span>
              </div>
              <div className="cc-review-row">
                <span className="cc-review-label">{t('dashboard.dieteticien.createCourse.reviewSemester')}</span>
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
                {t('dashboard.dieteticien.createCourse.confirmCancel')}
              </button>
              <button
                type="submit"
                className="cc-submit-btn"
                onClick={handleSubmit}
              >
                <Sparkles size={18} /> {t('dashboard.dieteticien.createCourse.confirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
