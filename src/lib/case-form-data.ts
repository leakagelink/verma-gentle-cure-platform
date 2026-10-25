import type { Database } from "@/integrations/supabase/types";

export type CaseRecordRow = Database["public"]["Tables"]["case_records"]["Row"];
export type CaseClinicalNoteRow = Database["public"]["Tables"]["case_clinical_notes"]["Row"];

export type CaseAttachment = {
  path: string;
  name: string;
  type: string;
  size: number;
};

export type CaseFormValues = {
  patient_name: string;
  age: string;
  gender: string;
  phone: string;
  chief_complaint: string;
  complaint_duration: string;
  current_symptoms: string;
  previous_treatment: string;
  current_medicines: string;
  past_medical_history: string;
  surgical_history: string;
  family_history: string;
  allergies: string;
  sleep: string;
  appetite: string;
  thirst: string;
  digestion: string;
  occupation: string;
  lifestyle: string;
  daily_routine: string;
  emotional_state: string;
  mental_health_notes: string;
  menstrual_history: string;
  reproductive_history: string;
  child_birth_history: string;
  child_vaccination: string;
  child_development: string;
  child_behaviour: string;
};

export const EMPTY_CASE_FORM: CaseFormValues = {
  patient_name: "",
  age: "",
  gender: "",
  phone: "",
  chief_complaint: "",
  complaint_duration: "",
  current_symptoms: "",
  previous_treatment: "",
  current_medicines: "",
  past_medical_history: "",
  surgical_history: "",
  family_history: "",
  allergies: "",
  sleep: "",
  appetite: "",
  thirst: "",
  digestion: "",
  occupation: "",
  lifestyle: "",
  daily_routine: "",
  emotional_state: "",
  mental_health_notes: "",
  menstrual_history: "",
  reproductive_history: "",
  child_birth_history: "",
  child_vaccination: "",
  child_development: "",
  child_behaviour: "",
};

export type CaseField = {
  key: keyof CaseFormValues;
  label: string;
  hint?: string;
  multiline?: boolean;
  placeholder?: string;
};

export type CaseSection = {
  id: string;
  title: string;
  description: string;
  fields: CaseField[];
  /** shown only when relevant to the patient */
  audience?: "female" | "child";
};

export const CASE_SECTIONS: CaseSection[] = [
  {
    id: "about",
    title: "About the patient",
    description: "Basic details so the doctor knows who this case belongs to.",
    fields: [
      { key: "patient_name", label: "Patient name", placeholder: "Full name" },
      { key: "age", label: "Age", placeholder: "e.g. 34 years / 8 months" },
      { key: "gender", label: "Gender", placeholder: "Female / Male / Other" },
      { key: "phone", label: "Mobile number", placeholder: "10-digit mobile number" },
    ],
  },
  {
    id: "complaint",
    title: "Main problem",
    description: "Tell us in your own words what troubles you the most.",
    fields: [
      {
        key: "chief_complaint",
        label: "Main complaint",
        multiline: true,
        placeholder: "What is bothering you the most right now?",
      },
      {
        key: "complaint_duration",
        label: "Since when",
        placeholder: "e.g. 6 months, since childhood",
      },
      {
        key: "current_symptoms",
        label: "Current symptoms",
        multiline: true,
        hint: "Include timing, what makes it better or worse, and how it feels.",
      },
    ],
  },
  {
    id: "treatment",
    title: "Treatment so far",
    description: "Anything you have already tried helps avoid repetition.",
    fields: [
      { key: "previous_treatment", label: "Previous treatment", multiline: true },
      {
        key: "current_medicines",
        label: "Medicines you take now",
        multiline: true,
        hint: "Include allopathic, ayurvedic, homeopathic medicines and supplements.",
      },
    ],
  },
  {
    id: "history",
    title: "Medical history",
    description: "Past illnesses, operations and family patterns.",
    fields: [
      { key: "past_medical_history", label: "Past medical history", multiline: true },
      { key: "surgical_history", label: "Surgical history", multiline: true },
      { key: "family_history", label: "Family medical history", multiline: true },
      {
        key: "allergies",
        label: "Allergies",
        multiline: true,
        hint: "Medicines, food, dust, season or anything else.",
      },
    ],
  },
  {
    id: "generals",
    title: "Daily wellbeing",
    description: "These general observations matter a lot in homeopathy.",
    fields: [
      { key: "sleep", label: "Sleep", placeholder: "Hours, quality, dreams, position" },
      { key: "appetite", label: "Appetite", placeholder: "Cravings, aversions, hunger pattern" },
      { key: "thirst", label: "Thirst", placeholder: "How much and how often you drink" },
      { key: "digestion", label: "Digestion & bowels", placeholder: "Gas, acidity, stool pattern" },
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle & routine",
    description: "Work, habits and daily rhythm.",
    fields: [
      { key: "occupation", label: "Occupation", placeholder: "Your work or studies" },
      {
        key: "lifestyle",
        label: "Lifestyle habits",
        multiline: true,
        hint: "Exercise, food habits, tea/coffee, tobacco, screen time.",
      },
      { key: "daily_routine", label: "Daily routine", multiline: true },
    ],
  },
  {
    id: "mind",
    title: "Emotional wellbeing",
    description: "Shared confidentially with the doctor only.",
    fields: [
      {
        key: "emotional_state",
        label: "How you feel emotionally",
        multiline: true,
        hint: "Stress, anger, fear, grief, worry — whatever feels true for you.",
      },
      {
        key: "mental_health_notes",
        label: "Anything else on your mind",
        multiline: true,
      },
    ],
  },
  {
    id: "women",
    title: "For women",
    description: "Fill this only if it applies to the patient.",
    audience: "female",
    fields: [
      {
        key: "menstrual_history",
        label: "Menstrual history",
        multiline: true,
        hint: "Cycle length, flow, pain, regularity, last period.",
      },
      {
        key: "reproductive_history",
        label: "Reproductive history",
        multiline: true,
        hint: "Pregnancies, deliveries, menopause, related treatment.",
      },
    ],
  },
  {
    id: "children",
    title: "For children",
    description: "Fill this only if the patient is a child.",
    audience: "child",
    fields: [
      { key: "child_birth_history", label: "Birth history", multiline: true },
      { key: "child_vaccination", label: "Vaccination history", multiline: true },
      {
        key: "child_development",
        label: "Development milestones",
        multiline: true,
        hint: "Sitting, walking, speech, school progress.",
      },
      { key: "child_behaviour", label: "Behaviour & temperament", multiline: true },
    ],
  },
];

export function parseAttachments(value: unknown): CaseAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item ?? {}) as Partial<CaseAttachment>;
    return {
      path: String(row.path ?? ""),
      name: String(row.name ?? "File"),
      type: String(row.type ?? ""),
      size: Number(row.size ?? 0),
    };
  });
}

export function toFormValues(row: CaseRecordRow): CaseFormValues {
  const next = { ...EMPTY_CASE_FORM };
  (Object.keys(EMPTY_CASE_FORM) as (keyof CaseFormValues)[]).forEach((key) => {
    next[key] = (row[key] as string | null) ?? "";
  });
  return next;
}

export function formatFileSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const CASE_BUCKET = "patient-reports";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
