import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createCourse } from "../../api/courseApi";
import {
  BookOpen,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Link,
  ExternalLink,
} from "lucide-react";
import "./CreateCourse.css";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [materialType, setMaterialType] = useState("pdf");

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
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, pdfFile: file }));
      setPreviewPdf(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!user) {
      setError("You must be logged in");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Course title is required");
      return false;
    }
    if (!formData.level) {
      setError("Please select a level");
      return false;
    }
    if (!formData.semester) {
      setError("Please select a semester");
      return false;
    }
    if (materialType === "url" && !formData.url.trim()) {
      setError("Please enter a Drive link");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
        setSuccess("Course created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/dieteticien/all-courses");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <div className="create-course-header">
        <h1>
          <BookOpen size={24} /> Create New Course
        </h1>
        <p>Add course materials organized by level and semester</p>
        {user && (
          <div className="cc-creator-banner">
            <span>
              Creating as: <strong>{user.fullName}</strong> ({user.role})
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="create-course-form">
        <div className="cc-section">
          <div className="cc-section-title">
            <BookOpen size={18} />
            <h2>Course Information</h2>
          </div>
          <div className="cc-grid">
            <div className="cc-form-group full-width">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to Nutrition Science"
              />
            </div>
            <div className="cc-form-group">
              <label>Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="1">Level 1 - Foundation</option>
                <option value="2">Level 2 - Intermediate</option>
                <option value="3">Level 3 - Advanced</option>
              </select>
            </div>
            <div className="cc-form-group">
              <label>Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="cc-section">
          <div className="cc-section-title">
            <FileText size={18} />
            <h2>Course Material</h2>
          </div>

          <div className="cc-material-toggle">
            <button
              type="button"
              className={`cc-toggle-btn ${materialType === "pdf" ? "active" : ""}`}
              onClick={() => setMaterialType("pdf")}
            >
              <Upload size={16} /> Upload PDF
            </button>
            <button
              type="button"
              className={`cc-toggle-btn ${materialType === "url" ? "active" : ""}`}
              onClick={() => setMaterialType("url")}
            >
              <Link size={16} /> Drive Link
            </button>
          </div>

          {materialType === "pdf" ? (
            <div className="cc-pdf-upload">
              {previewPdf ? (
                <div className="cc-pdf-preview">
                  <div className="cc-pdf-info">
                    <FileText size={32} />
                    <div>
                      <span className="cc-pdf-name">
                        {formData.pdfFile?.name}
                      </span>
                      <span className="cc-pdf-size">
                        {formData.pdfFile
                          ? `${(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cc-remove-btn"
                    onClick={() => {
                      setPreviewPdf(null);
                      setFormData((prev) => ({ ...prev, pdfFile: null }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cc-upload-label">
                  <Upload size={32} />
                  <span>Click to upload PDF file</span>
                  <span className="cc-upload-hint">PDF only (Max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="cc-url-input">
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

        {error && (
          <div className="cc-message error">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="cc-message success">
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <div className="cc-actions">
          <button
            type="button"
            className="cc-cancel-btn"
            onClick={() => navigate("/dieteticien/all-courses")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cc-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="cc-spin" /> Creating...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
