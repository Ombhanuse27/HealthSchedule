import axiosInstance from "./axiosInstance";



export const submitOpdForm = (hospitalId, data) =>
  axiosInstance.post(`/opd/${hospitalId}`, data);

export const deleteOpdRecord = (recordId) =>
  axiosInstance.delete(`/opd/${recordId}`);

export const getOpdRecords = () =>
  axiosInstance.get("/dashboard");

export const getDoctorOpdRecords = () =>
  axiosInstance.get("/doctor/opd");

export const checkDuplicate = (fullName, hospitalId) =>
  axiosInstance.post("/checkDuplicate", { fullName, hospitalId });

export const delayAppointments = (delayMinutes) =>
  axiosInstance.put("/opd/delay", { delayMinutes });

// Change this to accept an object or multiple arguments
export const rescheduleOpdAppointment = (recordId, rescheduleData, token) =>
  axiosInstance.put(
    `/opd/${recordId}/reschedule`, 
    rescheduleData, // This will now be { newSlot, newDate }
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

export const savePrescriptionPdf = (
  recordId,
  base64Data,
  contentType,
  diagnosis,
  medication,
  advice
) =>
  axiosInstance.put(`/opd/${recordId}/prescription`, {
    base64Data,
    contentType,
    diagnosis,
    medication,
    advice,
  });

  export const registerCallIntent= (data) => 
    axiosInstance.post(`/ai/register-call-intent`, data);

  
