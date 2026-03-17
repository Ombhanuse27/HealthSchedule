import React, { useState, useEffect } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { getDoctorsData, getPrescriptions } from "../../api/doctorApi.js";
import { savePrescriptionPdf, getDoctorOpdRecords } from "../../api/opdApi.js";
import { sendPrescriptionEmail, generateTeleconsultLink, sendTeleconsultEmail } from "../../api/communicationApi.js";
import html2pdf from "html2pdf.js";
import PrescriptionTemplate from "./PrescriptionTemplate.js";
import {
  User, Calendar, Clock, FileText, Edit3, Mail, Video, Copy,
  Plus, Search, Filter, Mic, MicOff, X, CheckCircle2, Upload,
  Activity, Stethoscope, RefreshCw, ChevronDown, Eye,
} from "lucide-react";

// ── Avatar palette ──
const avatarPalette = [
  ["#8B5CF6", "#F5F3FF"], ["#10B981", "#ECFDF5"],
  ["#0EA5E9", "#F0F9FF"], ["#F59E0B", "#FFFBEB"],
  ["#EF4444", "#FEF2F2"], ["#6366F1", "#EEF2FF"],
];

const ActionBtn = ({ onClick, color, bg, border, icon: Icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
      background: bg, color, border: `1.5px solid ${border}`,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "all 0.18s", whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <Icon size={13} />
    {label}
  </button>
);

const DoctorDashboard = () => {
  const [opdRecords, setOpdRecords] = useState([]);
  const [loggedInDoctor, setLoggedInDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [prescription, setPrescription] = useState({ diagnosis: "", medication: "", advice: "" });
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [targetField, setTargetField] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (targetField) setPrescription((prev) => ({ ...prev, [targetField]: transcript }));
  }, [transcript, targetField]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) { setLoading(false); return; }
      setLoading(true);
      try {
        const [opdRes, doctors, presRes] = await Promise.all([getDoctorOpdRecords(token), getDoctorsData(token), getPrescriptions(token)]);
        const username = localStorage.getItem("username");
        const currentDoctor = doctors.find((d) => d.username === username);
        if (!currentDoctor) { alert("Could not identify logged-in doctor."); setLoading(false); return; }
        setLoggedInDoctor(currentDoctor);
        const assigned = opdRes.data.filter((r) => {
          const aid = r.assignedDoctor?.$oid || r.assignedDoctor;
          const did = currentDoctor._id?.$oid || currentDoctor._id;
          return aid === did;
        });
        const presMap = new Map(presRes.data.map((p) => [p.appointmentId, p]));
        setOpdRecords(assigned.map((r) => {
          const ep = presMap.get(r._id);
          return ep ? { ...r, diagnosis: ep.diagnosis, medication: ep.medication, advice: ep.advice, prescriptionPdf: { data: ep.pdfBase64, contentType: ep.contentType } } : r;
        }));
      } catch (err) {
        console.error(err);
        alert("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const clearPhoto = () => { if (photoPreview) URL.revokeObjectURL(photoPreview); setUploadedPhoto(null); setUploadedPhotoBase64(null); setPhotoPreview(null); };
  const stopListening = () => { SpeechRecognition.stopListening(); setTargetField(null); };
  const startListening = (field) => { if (uploadedPhoto) clearPhoto(); setTargetField(field); resetTranscript(); SpeechRecognition.startListening({ continuous: true }); };

  const openModal = (record, edit = false) => {
    setSelectedRecord(record);
    setPrescription(edit ? { diagnosis: record.diagnosis || "", medication: record.medication || "", advice: record.advice || "" } : { diagnosis: "", medication: "", advice: "" });
    clearPhoto(); stopListening(); resetTranscript();
    setShowPrescriptionModal(true);
  };
  const closeModal = () => { setShowPrescriptionModal(false); stopListening(); resetTranscript(); clearPhoto(); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) { alert("Please upload a valid image."); clearPhoto(); return; }
    setUploadedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPrescription({ diagnosis: "", medication: "", advice: "" });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setUploadedPhotoBase64(reader.result.split(",")[1]);
  };

  const handleTextChange = (field, value) => { if (uploadedPhoto) clearPhoto(); setPrescription({ ...prescription, [field]: value }); };

  const generatePdfBase64 = async () => {
    const el = document.getElementById("pdf-template-to-export");
    if (!el) return null;
    const dataUri = await html2pdf().from(el).set({ margin: 0, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).output("datauristring");
    return dataUri.split(",")[1];
  };

  const handleSave = async () => {
    if (!selectedRecord) return;
    if (listening) stopListening();
    setSaving(true);
    let base64Data, contentType, diagnosis, medication, advice;
    if (uploadedPhoto && uploadedPhotoBase64) {
      base64Data = uploadedPhotoBase64; contentType = uploadedPhoto.type;
      diagnosis = ""; medication = ""; advice = "";
    } else {
      base64Data = await generatePdfBase64();
      if (!base64Data) { setSaving(false); return; }
      contentType = "application/pdf";
      diagnosis = prescription.diagnosis; medication = prescription.medication; advice = prescription.advice;
    }
    try {
      await savePrescriptionPdf(token, selectedRecord._id, base64Data, contentType, diagnosis, medication, advice);
      setOpdRecords((prev) => prev.map((r) => r._id === selectedRecord._id ? { ...r, diagnosis, medication, advice, prescriptionPdf: { data: base64Data, contentType } } : r));
      closeModal();
    } catch { alert("Failed to save prescription."); }
    finally { setSaving(false); }
  };

  const sendEmail = async (recordId) => {
    const r = opdRecords.find((rec) => rec._id === recordId);
    if (!r?.email) { alert("Patient email not found."); return; }
    if (!r.prescriptionPdf?.data) { alert("No prescription to send."); return; }
    if (!window.confirm(`Email prescription to ${r.fullName}?`)) return;
    const contentType = r.prescriptionPdf.contentType || "application/pdf";
    try {
      await sendPrescriptionEmail({ email: r.email, patientName: r.fullName, base64Data: r.prescriptionPdf.data, contentType, filename: contentType.includes("pdf") ? "prescription.pdf" : `prescription.${contentType.split("/")[1] || "jpg"}` });
      alert("Email sent!");
    } catch { alert("Failed to send email."); }
  };

  const viewPrescription = (record) => {
    const { data, contentType = "application/pdf" } = record.prescriptionPdf;
    const win = window.open();
    win.document.write(contentType.includes("pdf")
      ? `<iframe src="data:application/pdf;base64,${data}" style="border:0;width:100%;height:100vh;"></iframe>`
      : `<img src="data:${contentType};base64,${data}" style="max-width:100%;" />`);
  };

  const uniqueDates = React.useMemo(() => [...new Set(opdRecords.map((r) => r.appointmentDate))], [opdRecords]);

  const filteredRecords = React.useMemo(() => {
    let records = selectedDate ? opdRecords.filter((r) => r.appointmentDate === selectedDate) : opdRecords;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r) => r.fullName?.toLowerCase().includes(q) || r.symptoms?.toLowerCase().includes(q));
    }
    return records.sort((a, b) => new Date(`1970-01-01T${a.appointmentTime}`) - new Date(`1970-01-01T${b.appointmentTime}`));
  }, [opdRecords, selectedDate, searchQuery]);

  const todayCount = opdRecords.filter((r) => r.appointmentDate === new Date().toLocaleDateString("en-CA")).length;
  const withPrescription = opdRecords.filter((r) => r.prescriptionPdf?.data).length;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: "#FAF5FF", minHeight: "100%", padding: "28px 24px 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s 0.07s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.14s ease both; }
        .row-hover { transition: background 0.15s; }
        .row-hover:hover { background: linear-gradient(90deg,#F5F3FF 0%,#FAF5FF 100%) !important; }
        .custom-select { appearance:none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B5CF6' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; }
        .input-focus:focus { border-color:#8B5CF6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); outline:none; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation: spin 0.7s linear infinite; }
        .modal-enter { animation: fadeUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700; }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { transform:translateY(-2px); }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#8B5CF6" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.1em" }}>Doctor Portal</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, margin: 0, background: "linear-gradient(135deg,#7C3AED 0%,#6366F1 50%,#0EA5E9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                My Patients
              </h1>
              <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, marginTop: 6 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={() => window.location.reload()} style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", border: "1.5px solid #EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8B5CF6" }}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Assigned", value: opdRecords.length, color: "#8B5CF6", bg: "#FAF5FF", border: "#EDE9FE", icon: User },
            { label: "Today", value: todayCount, color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", icon: Calendar },
            { label: "With Prescription", value: withPrescription, color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", icon: FileText },
            { label: "Pending Rx", value: opdRecords.length - withPrescription, color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: Clock },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", lineHeight: 1.1 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="fade-up-3" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 18, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 4px 20px rgba(139,92,246,0.07)" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#C4B5FD" }} />
            <input
              className="input-focus"
              placeholder="Search patient or symptoms…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: "#FAF5FF", border: "1.5px solid #EDE9FE", fontSize: 13, fontWeight: 500, color: "#1E293B" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Calendar size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#C4B5FD", pointerEvents: "none" }} />
            <select
              className="custom-select input-focus"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ paddingLeft: 34, paddingRight: 36, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: "#FAF5FF", border: "1.5px solid #EDE9FE", fontSize: 13, fontWeight: 600, color: "#1E293B", minWidth: 180 }}
            >
              <option value="">All Dates</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 16 }}>
            <div className="spin" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #EDE9FE", borderTopColor: "#8B5CF6" }} />
            <p style={{ color: "#8B5CF6", fontWeight: 700 }}>Loading appointments…</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", borderRadius: 20, border: "1.5px dashed #DDD6FE" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Stethoscope size={26} color="#C4B5FD" />
            </div>
            <p style={{ fontWeight: 700, color: "#64748B", fontSize: 15 }}>No appointments found</p>
            <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 4 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #EDE9FE", boxShadow: "0 2px 12px rgba(139,92,246,0.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #F5F3FF" }}>
                  {["Patient", "Symptoms", "Appointment", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const [fg, bg] = avatarPalette[record.fullName?.charCodeAt(0) % avatarPalette.length] || avatarPalette[0];
                  const hasPrescription = !!record.prescriptionPdf?.data;
                  return (
                    <tr key={record._id} className="row-hover" style={{ borderBottom: "1px solid #FAF5FF" }}>
                      {/* Patient */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                            {record.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: "#1E293B" }}>{record.fullName}</p>
                            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>Age {record.age}</p>
                          </div>
                        </div>
                      </td>
                      {/* Symptoms */}
                      <td style={{ padding: "14px 20px", maxWidth: 200 }}>
                        <p style={{ fontSize: 13, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.symptoms}>
                          {record.symptoms || "—"}
                        </p>
                        {hasPrescription && (
                          <span className="badge" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0", marginTop: 4 }}>
                            <CheckCircle2 size={10} /> Rx Done
                          </span>
                        )}
                      </td>
                      {/* Appointment */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <Calendar size={12} color="#8B5CF6" />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{record.appointmentDate}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} color="#C4B5FD" />
                          <span style={{ fontSize: 12, color: "#94A3B8" }}>{record.appointmentTime}</span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {hasPrescription ? (
                            <>
                              <ActionBtn onClick={() => viewPrescription(record)} color="#4F46E5" bg="#EEF2FF" border="#C7D2FE" icon={Eye} label="View" />
                              <ActionBtn onClick={() => openModal(record, true)} color="#0369A1" bg="#E0F2FE" border="#BAE6FD" icon={Edit3} label="Edit" />
                              <ActionBtn onClick={() => sendEmail(record._id)} color="#B45309" bg="#FFFBEB" border="#FDE68A" icon={Mail} label="Email" />
                            </>
                          ) : (
                            <ActionBtn onClick={() => openModal(record)} color="#059669" bg="#ECFDF5" border="#A7F3D0" icon={Plus} label="Add Rx" />
                          )}
                          <ActionBtn
                            onClick={async () => {
                              if (!window.confirm(`Start teleconsultation with ${record.fullName}?`)) return;
                              try {
                                const { data } = await generateTeleconsultLink(record._id);
                                await sendTeleconsultEmail({ email: record.email, patientName: record.fullName, meetLink: data.meetLink });
                                window.open(data.meetLink, "_blank");
                                setOpdRecords((prev) => prev.map((r) => r._id === record._id ? { ...r, meetLink: data.meetLink } : r));
                              } catch { alert("Failed to start teleconsultation."); }
                            }}
                            color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" icon={Video} label="Teleconsult"
                          />
                          {record.meetLink && (
                            <ActionBtn onClick={() => { navigator.clipboard.writeText(record.meetLink); alert("Link copied!"); }} color="#475569" bg="#F8FAFC" border="#E2E8F0" icon={Copy} label="Copy Link" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          {/* Hidden PDF template */}
          <div style={{ position: "absolute", left: "-9999px" }}>
            <PrescriptionTemplate id="pdf-template-to-export" doctor={loggedInDoctor} record={selectedRecord} prescription={prescription} />
          </div>

          <div className="modal-enter" style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(139,92,246,0.2)" }}>
            {/* Modal Header */}
            <div style={{ padding: "22px 28px 18px", background: "linear-gradient(135deg,#F5F3FF 0%,#EFF6FF 100%)", borderBottom: "1px solid #EDE9FE", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={18} color="#8B5CF6" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>Prescription</p>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>For: {selectedRecord?.fullName}</p>
                </div>
              </div>
              <button onClick={closeModal} style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1.5px solid #EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} color="#94A3B8" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
              {!browserSupportsSpeechRecognition && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#B45309" }}>
                  Speech recognition is not supported in this browser.
                </div>
              )}

              {/* Photo Upload */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                  Upload Photo (Optional)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "1.5px dashed #DDD6FE", background: "#FAF5FF", cursor: "pointer" }}>
                  <Upload size={15} color="#8B5CF6" />
                  <span style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 600 }}>Choose image file</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
                {photoPreview && (
                  <div style={{ marginTop: 10, position: "relative" }}>
                    <img src={photoPreview} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10, border: "1.5px solid #EDE9FE" }} />
                    <button onClick={clearPhoto} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "#EF4444", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>×</button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "#EDE9FE" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>or type</span>
                <div style={{ flex: 1, height: 1, background: "#EDE9FE" }} />
              </div>

              {/* Fields */}
              {[
                { key: "diagnosis", label: "Diagnosis", type: "input", placeholder: "e.g. Viral Fever" },
                { key: "medication", label: "Medication (Rx)", type: "textarea", placeholder: "e.g. Paracetamol 500mg - twice daily" },
                { key: "advice", label: "Advice", type: "textarea", placeholder: "e.g. Rest, drink fluids" },
              ].map(({ key, label, type, placeholder }) => {
                const isListening = listening && targetField === key;
                return (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
                      <button
                        disabled={!!uploadedPhoto || !browserSupportsSpeechRecognition || (listening && targetField !== key)}
                        onClick={() => isListening ? stopListening() : startListening(key)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${isListening ? "#FCA5A5" : "#DDD6FE"}`, background: isListening ? "#FEF2F2" : "#F5F3FF", color: isListening ? "#EF4444" : "#8B5CF6", fontSize: 11, fontWeight: 700, cursor: "pointer", opacity: (!!uploadedPhoto || (!browserSupportsSpeechRecognition)) ? 0.4 : 1 }}
                      >
                        {isListening ? <><MicOff size={11} /> Stop</> : <><Mic size={11} /> Speak</>}
                      </button>
                    </div>
                    {type === "input" ? (
                      <input
                        className="input-focus"
                        placeholder={placeholder}
                        value={prescription[key]}
                        disabled={!!uploadedPhoto}
                        onChange={(e) => handleTextChange(key, e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #EDE9FE", background: uploadedPhoto ? "#F8FAFC" : "#FAF5FF", fontSize: 13, fontWeight: 500, color: "#1E293B", boxSizing: "border-box" }}
                      />
                    ) : (
                      <textarea
                        className="input-focus"
                        placeholder={placeholder}
                        rows={3}
                        value={prescription[key]}
                        disabled={!!uploadedPhoto}
                        onChange={(e) => handleTextChange(key, e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #EDE9FE", background: uploadedPhoto ? "#F8FAFC" : "#FAF5FF", fontSize: 13, fontWeight: 500, color: "#1E293B", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", borderTop: "1px solid #F5F3FF", display: "flex", gap: 12, flexShrink: 0 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 700, fontSize: 13, color: "#64748B", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: "12px", borderRadius: 14, background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }}
              >
                {saving ? <><div className="spin" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Saving…</> : <><CheckCircle2 size={15} /> Save Prescription</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;