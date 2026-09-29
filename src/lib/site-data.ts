export const CLINIC = {
  name: "Verma Gentle Cure",
  tagline: "Natural Healing. Personalized Care.",
  doctor: "Dr. Rajshree Verma",
  domain: "vermagentlecure.com",
  qualification: "BHMS",
  phone: "0657-4506627",
  phoneHref: "tel:06574506627",
  whatsapp: "+91 84091 70482",
  whatsappHref: "https://wa.me/918409170482",
  corporate: "Vermaverse OPC Private Limited",
  corporateLine: "A Healthcare Initiative of Vermaverse OPC Private Limited",
  inaugurated: "23 March 2026",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Sarala+Complex+Kadma+Market+Jamshedpur",
  email: "care@vermagentlecure.com",
  address: "G3, 1st Floor, Sarala Complex, Kadma Market, Jamshedpur, Jharkhand – 831005",
  hours: "Mon – Sat · 10:00 AM – 7:00 PM · Sunday by appointment",
  disclaimer:
    "The information provided on the Verma Gentle Cure website is intended for general educational and informational purposes and should not be considered a substitute for individualized medical advice, diagnosis or treatment. Treatment recommendations can vary depending on a patient's individual circumstances and should be made after an appropriate professional consultation. For a medical emergency or potentially life-threatening condition, please seek immediate emergency medical assistance from an appropriate healthcare facility.",
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
  { title: "6 Years of Professional Experience", description: "Dr. Rajshree Verma, Homeopathic Physician", icon: "BadgeCheck" },
  { title: "Founded by Dr. Rajshree Verma (BHMS)", description: "Homeopathic Physician and founder", icon: "UserRoundCheck" },
  { title: "Established in Jamshedpur", description: "Inaugurated 23 March 2026, Kadma", icon: "Stethoscope" },
  { title: "Patient-Centred Approach", description: "Individualized consultation and care", icon: "LifeBuoy" },
  { title: "Media Featured", description: "Covered by local and regional media", icon: "Video" },
  { title: "Professional & Literary Recognitions", description: "Awards, honours and academic association", icon: "ShieldCheck" },
  { title: "Accessible Clinic Location", description: "Sarala Complex, Kadma Market", icon: "Truck" },
];

export const STEPS = [
  {
    title: "Detailed Case Study",
    description: "Your concern, symptoms, history, lifestyle and reports are recorded in detail.",
  },
  {
    title: "Individualized Analysis",
    description: "The doctor studies your complete case to understand you as an individual.",
  },
  {
    title: "Personalized Treatment Plan",
    description: "A digital prescription with dosage guidance, diet and general-care advice.",
  },
  {
    title: "Follow-Up Care",
    description: "Scheduled reviews so the plan can be adjusted as your response is observed.",
  },
];

export type Condition = {
  slug: string;
  name: string;
  description: string;
  accent: "teal" | "forest" | "leaf" | "navy";
};

export const CONDITIONS: Condition[] = [
  { slug: "acute-conditions", name: "Acute Conditions", description: "Consultation available for recent, short-term health concerns, with individualized assessment.", accent: "teal" },
  { slug: "chronic-conditions", name: "Chronic Conditions", description: "Homeopathic care for long-standing complaints, reviewed in depth with structured follow-up.", accent: "navy" },
  { slug: "womens-health", name: "Women's Health", description: "Consultation for hormonal, cyclical and general women's health concerns.", accent: "forest" },
  { slug: "child-health", name: "Child Health", description: "Gentle, age-appropriate consultation for common childhood health concerns.", accent: "teal" },
  { slug: "lifestyle-related", name: "Lifestyle-related Conditions", description: "Individualized assessment alongside diet, routine and habit guidance.", accent: "leaf" },
  { slug: "mental-health-concerns", name: "Mental-health-related Concerns", description: "Supportive consultation for stress, sleep and emotional wellbeing. Not a substitute for emergency or psychiatric care.", accent: "forest" },
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
    location: "Jamshedpur",
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

export type AwardItem = {
  title: string;
  org: string;
  year: string;
  category: string;
  date?: string;
  group: "honours" | "literary";
  body: string;
};

const award = (a: Omit<AwardItem, "body">): AwardItem => ({ ...a, body: a.org });

export const AWARDS: AwardItem[] = [
  award({ title: "Bharat Kamal Puraskar 2026", org: "Bharat Seva Society, in association with Veyil Foundation", year: "2026", date: "27 March 2026", category: "Outstanding contribution in healthcare in homeopathic medicines", group: "honours" }),
  award({ title: "Legends of Bharat Award 2026", org: "Helping Humans", year: "2026", date: "29 March 2026", category: "Contribution and dedicated service in Homeopathic Healthcare and Holistic Healing", group: "honours" }),
  award({ title: "Rashtriya Pratibha Samman 2026", org: "Worthy Wellness Foundation", year: "2026", date: "31 March 2026", category: "Excellence / contribution in holistic healthcare", group: "honours" }),
  award({ title: "Param Vibhushan Sewa Ratna Samman — National Award 2026", org: "Jivran Foundation", year: "2026", date: "29 April 2026", category: "Healthcare, Education and Literature", group: "honours" }),
  award({ title: "Indian Icon Awards 2026", org: "Indian Icon Awards", year: "2026", category: "Woman Leadership Award in Healthcare", group: "honours" }),
  award({ title: "Indian Literature Award 2026", org: "Indian Literature & Arts Society", year: "2026", date: "29 April 2026", category: "Hindi Literature – Novel (Bandini)", group: "literary" }),
  award({ title: "Rabindra Ratna Puraskar 2026", org: "Veyil Foundation / Rabindra Ratna Puraskar National Committee", year: "2026", date: "29 April 2026", category: "Literature and Education", group: "literary" }),
  award({ title: "BooksBrew Bookfest Honorary Recognition 2026", org: "BooksBrew", year: "2026", category: "Exemplary literary contribution and book outreach impact", group: "literary" }),
  award({ title: "Bandini — Certificate of Recognition", org: "Book: Bandini: Iraadon Kee Ek Kalajayee Yatra", year: "2026", date: "10 April 2026", category: "Book recognition (title and ISBN recorded)", group: "literary" }),
  award({ title: "World Academic Press — Academic Associate", org: "World Academic Press (WAP)", year: "2026", date: "Issued 23 August 2026 · Valid until 23 August 2027", category: "Academic Associate · Designation: Author", group: "literary" }),
];

export const AWARD_NOTE =
  "Awards are listed with the awarding organization as stated on each certificate. Any government registration of an awarding organization does not mean the award was conferred by the Government of India.";

export type MediaItem = { outlet: string; date: string; headline?: string; summary: string };

export const INAUGURATION_COVERAGE: MediaItem[] = [
  { outlet: "Bharat News", date: "23 March 2026", headline: "जमशेदपुर: Verma Gentle Cure होम्योपैथिक क्लिनिक का हुआ उद्घाटन, शहरवासियों को मिलेगी अब बेहतर स्वास्थ्य सुविधाएं", summary: "Covered the inauguration, location, association with Vermaverse OPC Private Limited, Dr. Rajshree Verma's role and the presence of local dignitaries and citizens." },
  { outlet: "Chhotanagpur Live", date: "23 March 2026", headline: "कदमा में ‘वर्मा जेंटल केयर क्लिनिक’ का शुभारंभ, सस्ती और बेहतर इलाज का संकल्प", summary: "Reported the formal opening in the presence of local people and the objective of making healthcare more affordable and accessible." },
  { outlet: "Jharkhand Insight 24", date: "23 March 2026", headline: "कदमा में ‘वर्मा जेंटल केयर क्लिनिक’ का शुभारंभ, सस्ती और बेहतर इलाज का संकल्प", summary: "Covered the inauguration and highlighted affordable healthcare for middle-income and needy patients." },
  { outlet: "Loktantra Savera", date: "23 March 2026", headline: "जमशेदपुर में ‘Verma Gentle Cure’ होम्योपैथिक क्लिनिक का शुभारंभ, मरीजों को मिलेगा सुरक्षित व व्यक्तिगत उपचार", summary: "Identified the clinic as an initiative of Vermaverse OPC Private Limited founded by Dr. Rajshree Verma and discussed its individualized-care approach." },
  { outlet: "Saubhagya Rashtra", date: "23 March 2026", summary: "Reported the opening at Sarala Complex, Kadma Market and discussed patient-centred homeopathic care and the areas the clinic intends to serve." },
  { outlet: "The News Blast", date: "23 March 2026", headline: "जमशेदपुर में ‘Verma Gentle Cure’ होम्योपैथिक क्लिनिक का शुभारंभ, मरीजों को मिलेगा व्यक्तिगत उपचार", summary: "Identified the clinic as a Vermaverse OPC Private Limited initiative founded by Dr. Rajshree Verma." },
  { outlet: "BGPS Headline", date: "25 March 2026", headline: "कदमा में वर्मा जेंटल केयर क्लिनिक का शुभारंभ", summary: "Highlighted affordable healthcare and priority for lower-middle-income and needy patients." },
  { outlet: "Nayi Soch Express", date: "Print media", headline: "कदमा में वर्मा जेंटल केयर क्लिनिक का शुभारंभ", summary: "Newspaper clipping featuring Dr. Rajshree Verma and the clinic launch, including the stated focus on lower-middle-income and needy patients." },
];

export const INTERVIEW = {
  title: "Homeopathy Will Play a Crucial Role in Future Healthcare",
  expert: "Dr. Rajshree Verma, Homeopathic Physician, Verma Gentle Cure",
  summary: "A healthcare interview on the future role of homeopathy, its basic principles, individualized treatment and holistic healthcare. One featured interview, carried by multiple publications.",
  publications: [
    { outlet: "Ahmedabad Mirror", date: "March 2026", note: "Includes Verma Gentle Cure and Jamshedpur contact information" },
    { outlet: "Kanpur Live", date: "18 March 2026", note: "Press Release / Healthcare Feature" },
    { outlet: "KBK Times", date: "18 March 2026", note: "Press Release / Healthcare Feature" },
    { outlet: "Loktej", date: "18 March 2026", note: "Category: Business" },
    { outlet: "UP18 News", date: "18 March 2026", note: "Category: Health" },
    { outlet: "The Blunt Times", date: "19 March 2026", note: "Health / Press Release · TBT Online Desk" },
  ],
};

export const PRINT_FEATURE = {
  outlet: "Bihar Din Raat",
  edition: "Patna",
  date: "14 June 2026",
  page: "Page 08",
  section: "Rashtriya / Aarthik",
};

export const TIMELINE = [
  { date: "18–19 March 2026", text: "Featured healthcare interview published across multiple media outlets" },
  { date: "23 March 2026", text: "Verma Gentle Cure formally inaugurated in Kadma, Jamshedpur", milestone: true },
  { date: "23–25 March 2026", text: "Clinic inauguration receives regional and local media coverage" },
  { date: "27 March 2026", text: "Bharat Kamal Puraskar 2026" },
  { date: "29 March 2026", text: "Legends of Bharat Award 2026" },
  { date: "31 March 2026", text: "Rashtriya Pratibha Samman 2026" },
  { date: "April 2026 onward", text: "Literary and professional recognitions" },
  { date: "14 June 2026", text: "Bihar Din Raat print-media feature" },
  { date: "23 August 2026", text: "Academic Associate — World Academic Press" },
];
