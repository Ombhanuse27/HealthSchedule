import { useState, useEffect, useRef } from "react";
import { getLoggedInHospital } from "../../api/adminApi";
import { submitHospitalInfo } from "../../api/hospitalApi";
import {
  Camera, Building2, Clock, Phone, Mail, MapPin, Info,
  BedDouble, Award, Globe, CreditCard, Stethoscope,
  ShieldCheck, Briefcase, User, CheckCircle2, Upload,
  Loader2, Save, ChevronRight, Sparkles, Activity,
} from "lucide-react";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/da9xvfoye/upload";
const CLOUDINARY_PRESET = "ml_default";

// ── Field metadata ──
const fieldGroups = [
  {
    title: "Basic Information",
    icon: Building2,
    color: "#6366F1",
    bg: "#EEF2FF",
    fields: ["hospitalName", "Specialist", "experience", "numberOfBeds", "accreditations"],
  },
  {
    title: "Schedule & Contact",
    icon: Clock,
    color: "#0EA5E9",
    bg: "#E0F2FE",
    fields: ["hospitalStartTime", "hospitalEndTime", "contactNumber", "emergencyContact", "email", "website"],
  },
  {
    title: "Location",
    icon: MapPin,
    color: "#10B981",
    bg: "#ECFDF5",
    fields: ["address", "city"],
  },
  {
    title: "Services & Payments",
    icon: CreditCard,
    color: "#F59E0B",
    bg: "#FFFBEB",
    fields: ["opdFees", "paymentMode", "facilities", "insuranceAccepted"],
  },
  {
    title: "About",
    icon: Info,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    fields: ["aboutHospital"],
  },
];

const fieldMeta = {
  hospitalName:     { label: "Hospital Name",       icon: Building2,    type: "text",   placeholder: "e.g. City General Hospital" },
  Specialist:       { label: "Specialisation",       icon: Stethoscope,  type: "text",   placeholder: "e.g. Multi-Specialty, Ortho…" },
  experience:       { label: "Years of Experience",  icon: Briefcase,    type: "text",   placeholder: "e.g. 15 Years" },
  numberOfBeds:     { label: "Number of Beds",       icon: BedDouble,    type: "number", placeholder: "e.g. 120" },
  accreditations:   { label: "Accreditations",       icon: Award,        type: "text",   placeholder: "e.g. NABH, JCI" },
  hospitalStartTime:{ label: "Opens At",             icon: Clock,        type: "text",   placeholder: "e.g. 08:00 AM" },
  hospitalEndTime:  { label: "Closes At",            icon: Clock,        type: "text",   placeholder: "e.g. 09:00 PM" },
  contactNumber:    { label: "Contact Number",       icon: Phone,        type: "tel",    placeholder: "+91 XXXXX XXXXX" },
  emergencyContact: { label: "Emergency Contact",    icon: Phone,        type: "tel",    placeholder: "24/7 emergency line" },
  email:            { label: "Email Address",        icon: Mail,         type: "email",  placeholder: "admin@hospital.com" },
  website:          { label: "Website URL",          icon: Globe,        type: "url",    placeholder: "https://hospital.com" },
  address:          { label: "Street Address",       icon: MapPin,       type: "text",   placeholder: "123 Medical Lane" },
  city:             { label: "City",                 icon: MapPin,       type: "text",   placeholder: "Mumbai" },
  opdFees:          { label: "OPD Consultation Fee", icon: CreditCard,   type: "number", placeholder: "₹ 500" },
  paymentMode:      { label: "Payment Modes",        icon: CreditCard,   type: "text",   placeholder: "e.g. Cash, UPI, Card" },
  facilities:       { label: "Facilities",           icon: Sparkles,     type: "textarea",placeholder: "e.g. X-Ray, Pharmacy, ICU, Wheelchair" },
  insuranceAccepted:{ label: "Insurance Accepted",   icon: ShieldCheck,  type: "textarea",placeholder: "e.g. HDFC, Star Health, CGHS" },
  aboutHospital:    { label: "About the Hospital",   icon: Info,         type: "textarea",placeholder: "Share your hospital's story, mission, and values…" },
};

// ── Skeleton loader ──
const SkeletonField = () => (
  <div className="flex flex-col gap-2">
    <div style={{ width: "40%", height: 12, borderRadius: 6, background: "#E2E8F0", animation: "pulse 1.5s infinite" }} />
    <div style={{ width: "100%", height: 46, borderRadius: 12, background: "#F1F5F9", animation: "pulse 1.5s infinite" }} />
  </div>
);

// ── Individual field ──
const Field = ({ fieldKey, value, onChange, error }) => {
  const meta = fieldMeta[fieldKey] || { label: fieldKey, icon: Info, type: "text", placeholder: "" };
  const Icon = meta.icon;
  const isTextarea = meta.type === "textarea";

  const baseStyle = {
    width: "100%",
    padding: isTextarea ? "12px 16px 12px 42px" : "12px 16px 12px 42px",
    borderRadius: 12,
    border: error ? "1.5px solid #FCA5A5" : "1.5px solid #E0E7FF",
    background: error ? "#FFF5F5" : "#F8FAFF",
    fontSize: 14,
    fontWeight: 500,
    color: "#1E293B",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
    resize: isTextarea ? "vertical" : undefined,
    minHeight: isTextarea ? 90 : undefined,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {meta.label}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 13, top: isTextarea ? 13 : "50%", transform: isTextarea ? "none" : "translateY(-50%)", zIndex: 1, pointerEvents: "none" }}>
          <Icon size={15} color={error ? "#EF4444" : "#A5B4FC"} />
        </div>
        {isTextarea ? (
          <textarea
            name={fieldKey}
            value={value || ""}
            onChange={onChange}
            placeholder={meta.placeholder}
            rows={3}
            style={baseStyle}
            onFocus={(e) => { e.target.style.borderColor = "#6366F1"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = error ? "#FCA5A5" : "#E0E7FF"; e.target.style.background = error ? "#FFF5F5" : "#F8FAFF"; e.target.style.boxShadow = "none"; }}
          />
        ) : (
          <input
            type={meta.type}
            name={fieldKey}
            value={value || ""}
            onChange={onChange}
            placeholder={meta.placeholder}
            style={baseStyle}
            onFocus={(e) => { e.target.style.borderColor = "#6366F1"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = error ? "#FCA5A5" : "#E0E7FF"; e.target.style.background = error ? "#FFF5F5" : "#F8FAFF"; e.target.style.boxShadow = "none"; }}
          />
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#EF4444", fontWeight: 600, marginTop: 2 }}>{error}</p>}
    </div>
  );
};

// ── Main Component ──
const HospitalInfo = () => {
  const [formData, setFormData] = useState({
    hospitalImage: "", hospitalId: "", username: "",
    hospitalName: "", hospitalStartTime: "", hospitalEndTime: "",
    Specialist: "", contactNumber: "", emergencyContact: "",
    email: "", address: "", city: "", aboutHospital: "",
    numberOfBeds: "", accreditations: "", website: "",
    opdFees: "", paymentMode: "", facilities: "",
    insuranceAccepted: "", experience: "",
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchHospitalData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { alert("Authentication token not found."); setLoading(false); return; }
      try {
        const response = await getLoggedInHospital(token);
        const d = response.data;
        setFormData((prev) => ({ ...prev, ...d, hospitalId: d._id }));
      } catch {
        alert("Could not fetch hospital information.");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    try {
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const data = await res.json();
      setFormData((prev) => ({ ...prev, hospitalImage: data.secure_url }));
    } catch {
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospitalId) { alert("Hospital information not loaded."); return; }
    setSaving(true);
    try {
      await submitHospitalInfo(formData.hospitalId, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error saving hospital details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        background: "#F0F4FF",
        minHeight: "100%",
        padding: "32px 24px 80px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .section-card { animation: fadeUp 0.4s ease both; }
        .save-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35) !important; }
        .save-btn:active:not(:disabled) { transform: scale(0.98); }
        .img-upload:hover .img-overlay { opacity: 1 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C7D2FE; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#6366F1" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Settings
            </span>
          </div>
          <h1
            style={{
              fontSize: 36, fontWeight: 800, lineHeight: 1, margin: 0,
              background: "linear-gradient(135deg,#4F46E5 0%,#0EA5E9 60%,#10B981 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            Hospital Profile
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, marginTop: 6 }}>
            Keep your hospital information accurate and up-to-date
          </p>
        </div>

        {loading ? (
          /* ── Skeleton ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E0E7FF" }}>
                <div style={{ width: "30%", height: 14, borderRadius: 8, background: "#E2E8F0", marginBottom: 20, animation: "pulse 1.5s infinite" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[...Array(4)].map((_, j) => <SkeletonField key={j} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Profile Photo Card ── */}
            <div
              className="section-card"
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 32px",
                border: "1px solid #E0E7FF",
                boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
                animationDelay: "0ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={17} color="#6366F1" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: "#1E293B", lineHeight: 1.2 }}>Hospital Photo</p>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>Used on your public profile</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                {/* Avatar */}
                <div
                  className="img-upload"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: "relative", width: 100, height: 100, borderRadius: "50%", cursor: "pointer", flexShrink: 0 }}
                >
                  {formData.hospitalImage ? (
                    <img
                      src={formData.hospitalImage}
                      alt="Hospital"
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #C7D2FE" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", borderRadius: "50%",
                      background: "linear-gradient(135deg,#EEF2FF,#E0F2FE)",
                      border: "2px dashed #C7D2FE",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <Building2 size={28} color="#A5B4FC" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div
                    className="img-overlay"
                    style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: "rgba(99,102,241,0.75)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: uploading ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {uploading
                      ? <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                      : <Camera size={20} color="#fff" />
                    }
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </div>

                {/* Upload info */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", marginBottom: 4 }}>
                    {formData.hospitalImage ? "Click photo to change" : "Upload hospital photo"}
                  </p>
                  <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>PNG, JPG up to 5MB</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "8px 16px", borderRadius: 10,
                      background: "#EEF2FF", color: "#6366F1",
                      fontSize: 13, fontWeight: 700,
                      border: "1.5px solid #C7D2FE",
                      cursor: uploading ? "not-allowed" : "pointer",
                      opacity: uploading ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <Upload size={13} />
                    {uploading ? "Uploading…" : "Choose File"}
                  </button>
                </div>

                {/* Read-only username pill */}
                <div style={{ marginLeft: "auto" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 12,
                    background: "#F8FAFF", border: "1.5px solid #E0E7FF",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#818CF8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={14} color="#fff" />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>{formData.username || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Grouped Sections ── */}
            {fieldGroups.map((group, gIdx) => {
              const GroupIcon = group.icon;
              const groupFields = group.fields.filter((f) => Object.keys(formData).includes(f) || fieldMeta[f]);

              return (
                <div
                  key={group.title}
                  className="section-card"
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid #E0E7FF",
                    boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
                    animationDelay: `${(gIdx + 1) * 60}ms`,
                  }}
                >
                  {/* Section header */}
                  <div
                    style={{
                      padding: "18px 28px",
                      borderBottom: "1px solid #F1F5F9",
                      background: `linear-gradient(90deg, ${group.bg} 0%, #fff 100%)`,
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: group.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1.5px solid ${group.color}22`,
                      }}
                    >
                      <GroupIcon size={17} color={group.color} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "#1E293B", lineHeight: 1.2 }}>{group.title}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>{groupFields.length} field{groupFields.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Fields grid */}
                  <div
                    style={{
                      padding: "24px 28px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 18,
                    }}
                  >
                    {groupFields.map((key) => {
                      const meta = fieldMeta[key];
                      if (!meta) return null;
                      // Textareas span full width
                      return (
                        <div
                          key={key}
                          style={meta.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}
                        >
                          <Field
                            fieldKey={key}
                            value={formData[key]}
                            onChange={handleChange}
                            error={errors[key]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* ── Save Button ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
              <button
                type="submit"
                disabled={saving || uploading}
                className="save-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 32px",
                  borderRadius: 14,
                  background: saved
                    ? "linear-gradient(135deg,#10B981,#34D399)"
                    : "linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",
                  color: "#fff",
                  fontWeight: 800, fontSize: 15,
                  border: "none", cursor: saving ? "not-allowed" : "pointer",
                  opacity: (saving || uploading) ? 0.7 : 1,
                  boxShadow: saved
                    ? "0 4px 18px rgba(16,185,129,0.3)"
                    : "0 4px 18px rgba(99,102,241,0.28)",
                }}
              >
                {saving ? (
                  <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} /> Saving…</>
                ) : saved ? (
                  <><CheckCircle2 size={17} /> Saved Successfully!</>
                ) : (
                  <><Save size={17} /> Save Hospital Profile</>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default HospitalInfo;