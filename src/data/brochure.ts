export interface StaffMember {
  id: number;
  name: string;
  title: string;
  schedule?: string;
}

export interface BrochureData {
  section1: {
    inpatientOutpatientCare: string;
    advancedDiagnosticLaboratory: string[];
    diagnosticRadiology: string[];
  };
  whyDifferent: {
    highlights: string[];
    specialtyServices: string[];
    radiologyServices: string[];
    additionalServices: string[];
    address: {
      location: string;
      telephone: string;
      email: string;
    };
  };
  staff: StaffMember[];
  introduction: {
    text: string;
  };
  mission: {
    text: string;
  };
  vision: {
    text: string;
  };
}

export const brochureData: BrochureData = {
  section1: {
    inpatientOutpatientCare: "Inpatient & Outpatient Care with Advanced Diagnostic Laboratory",
    advancedDiagnosticLaboratory: [
      "Bacteriology And Parasitology",
      "Chemistry And Electrolytes",
      "Cancer markers and hormonal assay",
      "Pathology Cytology And Histology",
    ],
    diagnosticRadiology: [
      "Colour Doppler Ultrasound And Ecocardiography",
      "Digital X-Ray",
      "HSG CUG And IVP",
      "Video Endoscopy And Colonoscopy",
      "Diagnoses And Treatment Of Neurological Problems (EEG, Spirometry Test)",
    ],
  },
  whyDifferent: {
    highlights: [
      "Open 24 hours and 7 days a week",
      "Equipped with state of the art and latest medical devices and technological aids",
      "Experienced general, specialist & subspecialist doctors work in the clinic at all times",
    ],
    specialtyServices: [
      "Cardiology",
      "Neurology",
      "Nephrology",
      "Pulmonology",
      "Endocrinology",
    ],
    radiologyServices: [
      "Color Doppler Ultrasound",
      "ECG",
      "EEG",
      "EMG",
      "NCS",
      "Spirometry",
      "Endoscopy & Colonoscopy",
    ],
    additionalServices: [
      "Specialized internal medicine clinic by specialist and sub specialist",
      "Sub-Specialty services cardiology, Gastroenterology and neurologist",
      "Diagnoses and treatment of neurological problems",
      "Minor surgery",
      "Advanced Diagnostic Laboratory",
      "Diagnostic Radiology",
      "Medical certificate for Expats",
    ],
    address: {
      location: "22 Mazoria infront of water irrigation ministry, Next to Zerihun Building",
      telephone: "011-635-42-80 / 0975-704070",
      email: "medstarelinic2020@gmail.com",
    },
  },
  staff: [
    { id: 1, name: "Dr. Dawit Amare", title: "Internist", schedule: "Office Hour" },
    { id: 2, name: "Dr. nathnael tegenu", title: "Internist", schedule: "Part-time" },
    { id: 3, name: "Dr. Eyerusalem Yalew", title: "Internist", schedule: "Part-time" },
    { id: 4, name: "Dr. Feyza Abdulkadr", title: "Internist", schedule: "Part-time" },
    { id: 5, name: "Dr. Tsega Felege", title: "Internist", schedule: "Part-time" },
    { id: 6, name: "Dr. Melaku Taye", title: "Endocrinologist", schedule: "Sat Morning 12:00-06:00" },
    { id: 7, name: "Dr. Rezene Berhe", title: "Gastroenterologist, Hematologist", schedule: "Mon to Friday" },
    { id: 8, name: "Dr. Abel Mulugeta", title: "Neurologist", schedule: "Mon to Friday 2AM-5AM" },
    { id: 9, name: "Dr. hiwot eingedawork", title: "Dermatologist", schedule: "Tues & Friday 8AM-5AM" },
    { id: 10, name: "Dr. Dawit Mesin", title: "Gynecologist", schedule: "Wed's day After 02 AM" },
    { id: 11, name: "Dr. Habtamu Aderaw", title: "Urologist", schedule: "Mon & Friday After 2PM" },
    { id: 12, name: "Dr. Meron Tadese", title: "Psychologist", schedule: "Thursday 2PM" },
    { id: 13, name: "Dr. Tsion Betemaryam", title: "Pathologist", schedule: "Wed's day Morning 8:00 PM" },
    { id: 14, name: "Dr. Nahom Gebrekiros", title: "GP", schedule: "Office Hour" },
    { id: 15, name: "Dr. Zekariyas A/maryam", title: "Internist", schedule: "Part-time" },
    { id: 16, name: "Dr. Reftola Aslaw", title: "GP", schedule: "Office Hour" },
    { id: 17, name: "Dr. Tesfaye Berhe", title: "Neurologist", schedule: "Friday 2AM-5AM Sat 2AM-12" },
    { id: 18, name: "Dr. maru seged", title: "Cardiologist", schedule: "Part-time" },
    { id: 19, name: "Dr. Shimels Nguse", title: "Hepato-Biliary Surgeon", schedule: "Part-time" },
    { id: 20, name: "kalkidan bekele", title: "Psychologist", schedule: "Thursday After 05:00PM" },
    { id: 21, name: "Dr.Melaku ferede", title: "Radiologist", schedule: "Part-time" },
    { id: 22, name: "Dr. kaleab eshetu", title: "Physiotherapist", schedule: "Part-time" },
  ],
  introduction: {
    text: "As the name indicates it's an Internal Medicine Specialized clinic. It is located in front of Water & irrigation Ministry (Wuha Lemat). The Clinic is owned and led by a highly reputed physician who has been practicing medicine for more than 15years and supported by highly qualified and well-trained doctors of different disciplines, nurses, Laboratory Technologists and Radiologist and Radiology Technicians. The medical set up is equipped with advanced technology, state of the art medical equipment and furniture imported from aboard and compliant with international standards, to address the growing demands of standard based medical practice.",
  },
  mission: {
    text: "To be a provider of high quality patient-focused health care that is readily accessible, cost effective and meets the needs of the community we serve.",
  },
  vision: {
    text: "To be distinguished as our community's health care leader for its commitment to excellence, exceeding patient expectations through the advancement of quality medical services and its response to changing customer needs.",
  },
};

// AI Assistant knowledge base built from brochure content
export function buildKnowledgeBase(): string {
  const data = brochureData;
  return `
MED-STAR Internal Medicine Speciality Clinic Brochure Information:

INTRODUCTION:
${data.introduction.text}

MISSION:
${data.mission.text}

VISION:
${data.vision.text}

GENERAL SERVICES:
- Inpatient & Outpatient Care
- Advanced Diagnostic Laboratory: ${data.section1.advancedDiagnosticLaboratory.join(", ")}
- Diagnostic Radiology: ${data.section1.diagnosticRadiology.join(", ")}

WHY MED-STAR IS DIFFERENT:
${data.whyDifferent.highlights.join("\n")}

SPECIALTY SERVICES:
${data.whyDifferent.specialtyServices.join(", ")}

RADIOLOGY DIAGNOSTIC SERVICES:
${data.whyDifferent.radiologyServices.join(", ")}

ADDITIONAL SERVICES:
${data.whyDifferent.additionalServices.map((s, i) => `${i + 1}. ${s}`).join("\n")}

ADDRESS & CONTACT:
- Location: ${data.whyDifferent.address.location}
- Telephone: ${data.whyDifferent.address.telephone}
- Email: ${data.whyDifferent.address.email}

STAFF DIRECTORY / WORKING HOURS:
${data.staff.map((s) => `${s.name} | ${s.title} | ${s.schedule || "N/A"}`).join("\n")}
`;
}

