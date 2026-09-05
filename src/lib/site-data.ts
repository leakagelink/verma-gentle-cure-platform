export const CLINIC = {
  name: "Verma Gentle Cure",
  tagline: "Natural Healing. Personalized Care.",
  doctor: "Dr. Rajshree Verma",
  domain: "vermagentlecure.com",
  phone: "+91 98765 43210",
  email: "care@vermagentlecure.com",
  address: "Verma Gentle Cure Homeopathic Clinic, Civil Lines, Kanpur, Uttar Pradesh, India",
  hours: "Mon – Sat · 10:00 AM – 7:00 PM · Sunday by appointment",
  disclaimer:
    "Information on this platform is provided for general awareness and is not a substitute for professional medical advice, diagnosis or treatment. Results may vary depending on individual circumstances. Always consult a qualified healthcare professional regarding a medical condition.",
};

export const CONSULT_FEES = {
  new: 700,
  followUp: 400,
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: string;
};

export const SERVICES: Service[] = [
  {
    slug: "online-consultation",
    title: "Online Consultation",
    description:
      "Speak with a qualified homeopathic physician over secure video or audio from anywhere in India.",
    icon: "Video",
  },
  {
    slug: "personalized-homeopathy",
    title: "Personalized Homeopathic Consultation",
    description:
      "A detailed case study of your symptoms, history and lifestyle before any recommendation is made.",
    icon: "Stethoscope",
  },
  {
    slug: "follow-up",
    title: "Follow-up Consultation",
    description:
      "Review progress, adjust the plan and keep a continuous record of how you are responding.",
    icon: "RefreshCw",
  },
  {
    slug: "chronic-care",
    title: "Chronic Condition Management",
    description:
      "Structured long-term support for persistent concerns, with scheduled reviews and notes.",
    icon: "HeartPulse",
  },
  {
    slug: "medicine-delivery",
    title: "Medicine Delivery",
    description:
      "Prescribed and over-the-counter homeopathic medicines dispatched to your address.",
    icon: "Package",
  },
  {
    slug: "patient-follow-up-care",
    title: "Patient Follow-up Care",
    description:
      "Reminders, prescription access and a care team that checks in between consultations.",
    icon: "BellRing",
  },
];

export const TRUST_POINTS = [
  { title: "Professional Consultation", description: "Qualified homeopathic physician", icon: "BadgeCheck" },
  { title: "Personalized Care", description: "Every case studied individually", icon: "UserRoundCheck" },
  { title: "Online Consultation", description: "Video and audio appointments", icon: "Video" },
  { title: "Medicine Delivery", description: "Dispatched across India", icon: "Truck" },
  { title: "Secure Payments", description: "Encrypted checkout", icon: "ShieldCheck" },
  { title: "Patient Support", description: "Help before and after visits", icon: "LifeBuoy" },
];

export const STEPS = [
  {
    title: "Book Consultation",
    description: "Choose a new or follow-up consultation, pick a doctor, date and time slot.",
  },
  {
    title: "Share Your Health Information",
    description: "Add your concern, symptoms, history and upload any reports securely.",
  },
  {
    title: "Consult With Doctor",
    description: "Join a video or audio consultation at your scheduled time.",
  },
  {
    title: "Receive Your Treatment Plan",
    description: "Get a digital prescription with dosage guidance and a follow-up date.",
  },
];

export type Condition = {
  slug: string;
  name: string;
  description: string;
  accent: "teal" | "forest" | "leaf" | "navy";
};

export const CONDITIONS: Condition[] = [
  {
    slug: "chronic-conditions",
    name: "Chronic Conditions",
    description: "Long-standing complaints reviewed in depth, with a structured, monitored plan.",
    accent: "navy",
  },
  {
    slug: "skin-and-hair",
    name: "Skin & Hair",
    description: "Case-based consultation for recurring skin and scalp concerns.",
    accent: "leaf",
  },
  {
    slug: "lifestyle-wellness",
    name: "Lifestyle Wellness",
    description: "Diet, routine and habit guidance alongside homeopathic recommendations.",
    accent: "forest",
  },
  {
    slug: "childrens-care",
    name: "Children's Care",
    description: "Gentle, age-appropriate consultation for common childhood concerns.",
    accent: "teal",
  },
  {
    slug: "womens-wellness",
    name: "Women's Wellness",
    description: "Consultation for hormonal, cyclical and general women's health concerns.",
    accent: "forest",
  },
  {
    slug: "stress-and-sleep",
    name: "Stress & Sleep",
    description: "Support for sleep quality, stress load and everyday mental wellbeing.",
    accent: "teal",
  },
];

export const WHY_US = [
  {
    title: "Personalized Attention",
    description: "Consultations are unhurried. Your case is discussed, not processed.",
  },
  {
    title: "Detailed Case Understanding",
    description: "History, symptoms, lifestyle and temperament are all recorded before any plan.",
  },
  {
    title: "Patient-Centered Care",
    description: "Decisions are explained in plain language so you can take part in them.",
  },
  {
    title: "Convenient Online Consultation",
    description: "Consult from home, with the same records available to you and the doctor.",
  },
  {
    title: "Follow-up Support",
    description: "Structured reviews so treatment adapts as your response is observed.",
  },
  {
    title: "Medicine Delivery",
    description: "Order authentic homeopathic medicines and have them delivered.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ananya S.",
    location: "Lucknow",
    category: "Skin & Hair",
    quote:
      "The consultation was thorough and unhurried. Every question I had was answered clearly, and the follow-up notes helped me stay consistent.",
  },
  {
    name: "R. Mehta",
    location: "Kanpur",
    category: "Chronic Conditions",
    quote:
      "What stood out was how much history was taken before anything was recommended. It felt like an actual medical consultation, not a sale.",
  },
  {
    name: "Priya K.",
    location: "Delhi",
    category: "Women's Wellness",
    quote:
      "Booking online was simple and the video call was clear. Having my prescription in the app is very convenient.",
  },
  {
    name: "S. Nair",
    location: "Pune",
    category: "Stress & Sleep",
    quote:
      "I appreciated the honest expectations that were set at the start. Follow-up reviews kept everything on track.",
  },
  {
    name: "Vikram J.",
    location: "Jaipur",
    category: "Children's Care",
    quote:
      "Very patient with our son and very clear with us about what to watch for. Medicines arrived within a few days.",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  readingTime: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-to-expect-first-homeopathic-consultation",
    title: "What to Expect in Your First Homeopathic Consultation",
    category: "Consultation",
    date: "2026-08-14",
    readingTime: "5 min read",
    excerpt:
      "A first homeopathic consultation is largely a conversation. Here is how the session is structured and how to prepare for it.",
    body: [
      "A first homeopathic consultation is longer than most people expect. Rather than moving straight to a remedy, the physician spends the majority of the session building a picture of your health: when the concern began, how it changes through the day, what makes it better or worse, and what else has changed in your life around the same period.",
      "Bring a short written timeline, any recent investigation reports, and a list of medicines or supplements you currently take. If you have consulted other practitioners, their prescriptions are useful context.",
      "At the end of the session you should expect a clear summary: what has been understood, what is being recommended, how long the first review period is, and what to report back. If anything is unclear, ask before the consultation ends.",
    ],
  },
  {
    slug: "preparing-your-health-history",
    title: "Preparing Your Health History Before an Online Appointment",
    category: "Patient Guide",
    date: "2026-07-29",
    readingTime: "4 min read",
    excerpt:
      "Good preparation makes an online consultation as effective as an in-clinic visit. A simple checklist to work through beforehand.",
    body: [
      "Online consultations work well when the information is ready before the call begins. Upload reports in advance rather than describing them mid-session.",
      "Note the duration of each symptom, previous treatments tried, and any known allergies. Keep the list factual and chronological.",
      "Find a quiet, well-lit space with a stable connection, and keep a notepad handy for the treatment plan.",
    ],
  },
  {
    slug: "sleep-routine-and-everyday-wellbeing",
    title: "Sleep Routine and Everyday Wellbeing",
    category: "Wellness",
    date: "2026-07-11",
    readingTime: "6 min read",
    excerpt:
      "Sleep quality influences almost every other health conversation. Practical, non-prescriptive habits worth reviewing.",
    body: [
      "Sleep is one of the first things reviewed in a consultation because it interacts with nearly every other complaint a patient reports.",
      "Consistent sleep and wake times, reduced screen exposure in the last hour of the day, and a cooler, darker room are widely recommended starting points.",
      "Persistent sleep disturbance deserves a proper consultation rather than self-medication. Discuss it with a qualified healthcare professional.",
    ],
  },
  {
    slug: "storing-homeopathic-medicines",
    title: "How to Store Homeopathic Medicines Correctly",
    category: "Medicines",
    date: "2026-06-22",
    readingTime: "3 min read",
    excerpt:
      "Storage affects the condition of your medicines. Simple handling guidance for dilutions, globules and mother tinctures.",
    body: [
      "Keep medicines in their original containers, away from direct sunlight and strong odours.",
      "Avoid touching globules directly; use the cap to transfer the dose.",
      "Store away from heat sources and keep bottles tightly closed. Check expiry dates before use.",
    ],
  },
  {
    slug: "understanding-follow-up-consultations",
    title: "Why Follow-up Consultations Matter",
    category: "Consultation",
    date: "2026-06-03",
    readingTime: "4 min read",
    excerpt:
      "The first prescription is a starting point, not a conclusion. Follow-ups are where a plan is refined.",
    body: [
      "A follow-up gives the physician the one thing the first consultation cannot: your actual response over time.",
      "Record changes as they happen rather than recalling them at the appointment. Note both improvements and new symptoms.",
      "Follow-ups are usually shorter and are charged at a reduced consultation fee.",
    ],
  },
];

export const FAQS = [
  {
    q: "How does an online homeopathic consultation work?",
    a: "You book a slot, share your health information and any reports, then join a secure video or audio call at the scheduled time. After the consultation, your prescription and notes appear in your patient dashboard.",
  },
  {
    q: "What is the consultation fee?",
    a: `A new consultation is ₹${CONSULT_FEES.new} and a follow-up consultation is ₹${CONSULT_FEES.followUp}. Fees are shown again on the summary screen before payment.`,
  },
  {
    q: "Is my medical information private?",
    a: "Yes. Medical records, uploaded reports and prescriptions are stored in secure, access-controlled storage and are visible only to you and the treating doctor.",
  },
  {
    q: "Can I reschedule or cancel an appointment?",
    a: "You can raise a reschedule or cancellation request from My Appointments in your dashboard. The clinic team will confirm the change.",
  },
  {
    q: "Do you deliver medicines?",
    a: "Yes, medicines ordered through the shop are dispatched across India. Delivery timelines and charges are shown at checkout.",
  },
  {
    q: "Can homeopathy replace my current treatment?",
    a: "Do not stop or change any ongoing treatment without speaking to the prescribing doctor. Please share your current medicines during the consultation so they can be taken into account.",
  },
];

export const AWARDS = [
  { year: "2023", title: "Recognition for Community Health Camps", body: "Kanpur regional homeopathic association" },
  { year: "2020", title: "Excellence in Patient Care", body: "State homeopathic practitioners forum" },
  { year: "2016", title: "Clinical Case Study Presentation", body: "National homeopathy conference" },
];
