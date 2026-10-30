export type HelpResource = {
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  verificationNote: string;
  verificationStatus?: "verified" | "needs_confirmation";
  verifiedAt?: string;
  facilityType?: "hospital" | "clinic" | "laboratory" | "health_center";
  phone?: string;
  hours?: string;
  services?: string[];
};

const REGION12_DIRECTORY_METADATA: Record<string, Pick<HelpResource, "facilityType" | "phone" | "hours" | "services" | "verificationNote" | "verificationStatus">> = {
  "South Cotabato Provincial Hospital": { facilityType: "hospital", phone: "(083) 228-2919 / (083) 228-8787", hours: "", services: ["OB-GYN", "obstetrics/gynecology", "surgical gynecology"], verificationNote: "HealthSpace verified facility; South Cotabato official OB-GYN surgical mission; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Soccsksargen General Hospital": { facilityType: "hospital", phone: "(083) 238-5507", hours: "", services: ["Obstetrics and gynecology", "prenatal/related hospital services"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Norala District Hospital": { facilityType: "hospital", phone: "(083) 234-1010", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Allah Valley Medical Specialists Center, Inc.": { facilityType: "hospital", phone: "(083) 228-3550", hours: "", services: ["Obstetrics and gynecology", "delivery room", "emergency room", "women's health services"], verificationNote: "Official hospital page + HealthSpace verified listing; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Dr. Arturo P. Pingoy Medical Center": { facilityType: "hospital", phone: "(083) 228-2202", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Socomedics Medical Center": { facilityType: "hospital", phone: "(083) 228-8202 / (083) 553-7341", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Bontuyan Medical Hospital, Inc.": { facilityType: "hospital", phone: "(083) 500-9343", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Dantom Doctor's Hospital, Inc.": { facilityType: "hospital", phone: "(083) 228-1500 / 0917 179 3769", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Howard Hubbard Memorial Hospital": { facilityType: "hospital", phone: "(083) 500-2748 / 0998 596 3102", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility + accredited doctor listing; Dr. Mary Adeline R. Edillon; Dr. Wilma Heramil", verificationStatus: "verified" },
  "Surallah Community Hospital": { facilityType: "hospital", phone: "(083) 238-3049", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace facility listing; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "K Sampiano OB-GYN Ultrasound Clinic": { facilityType: "clinic", phone: "(083) 228-8197 / (083) 228-2202", hours: "Mon-Sat, daytime hours", services: ["OB-GYN consultation", "ultrasound"], verificationNote: "Waze/business listing; K. Sampiano / individual OB-GYN listing", verificationStatus: "verified" },
  "Adalin OB GYN and Dental Clinic": { facilityType: "clinic", phone: "(083) 228-4514 / 0917 777 0727", hours: "Mon-Sat, 8:00 AM-4:00 PM", services: ["OB-GYN", "medical and dental services"], verificationNote: "Public clinic listing with OB-GYN category and schedule; OB-GYN doctors; individual schedule may change", verificationStatus: "verified" },
  "Cotabato Provincial Hospital": { facilityType: "hospital", phone: "(064) 572-5010 / 0919 206 6257", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; DOH EPSB document; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "University of Southern Mindanao Hospital": { facilityType: "hospital", phone: "(064) 572-2765 / 0932 159 5703", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Kidapawan Doctors Hospital, Inc.": { facilityType: "hospital", phone: "(064) 521-0188; Emergency 0908 876 994", hours: "Dr. Elsa Khio: Mon-Fri 10 AM-12 NN; Dr. Badilla schedule NA", services: ["Obstetrics and gynecology", "pregnancy care", "reproductive health", "delivery/OR services"], verificationNote: "Official hospital website; Dr. Benilina O. Badilla; Dr. Elsa P. Khio", verificationStatus: "verified" },
  "Madonna Medical Center, Inc.": { facilityType: "hospital", phone: "(064) 572-6018", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Midway Hospital": { facilityType: "hospital", phone: "(064) 577-3686", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Midsayap Diagnostic Center and Hospital, Inc.": { facilityType: "hospital", phone: "(064) 229-7368 / (064) 521-1470", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Midsayap Doctors Specialist Hospital, Inc.": { facilityType: "hospital", phone: "(064) 521-6602 / 0917 723 9725", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sara Family Clinic and Hospital, Inc.": { facilityType: "hospital", phone: "0916 425 2622 / 0921 320 6243", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Anecito T. Pesante Sr. Memorial Hospital Co.": { facilityType: "hospital", phone: "(064) 229-9177", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Community Health Service Cooperative Hospital": { facilityType: "hospital", phone: "(064) 229-7880 / 0928 395 4918", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Antipas Medical Specialists Hospital, Inc.": { facilityType: "hospital", phone: "0912 443 9642", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Makilala Midway Hospital, Inc.": { facilityType: "hospital", phone: "(064) 577-9288", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sorilla Medical and Maternity Clinic & Hospital": { facilityType: "hospital", phone: "0920 913 8703 / 0918 922 5787", hours: "", services: ["Obstetrics and gynecology", "maternity/medical hospital services"], verificationNote: "HealthSpace verified facility + accredited provider directory; Dr. Grace Marie G. Sorilla / OB-Gynecology on-call listing", verificationStatus: "verified" },
  "Sultan Kudarat Provincial Hospital": { facilityType: "hospital", phone: "(064) 201-4259 / (064) 471-2187", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "DOH EPSB terms of reference + PhilHealth directory; Medical Specialist II – Obstetrics and Gynecology position identified by DOH; individual name NA", verificationStatus: "verified" },
  "Sultan Kudarat Doctors Hospital, Inc.": { facilityType: "hospital", phone: "(064) 200-3012 / (064) 477-0050", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sultan Kudarat Medical Specialists Center, Inc.": { facilityType: "hospital", phone: "0929 507 3303", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "St. Louis Hospital": { facilityType: "hospital", phone: "(064) 477-0171 / 0932 443 7029", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sandig Medical Clinic and Hospital": { facilityType: "hospital", phone: "(064) 562-3365 / 0917 310 7907", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility + DOH facility record; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Tomboc-Salayog Hospital": { facilityType: "hospital", phone: "0919 859 4325", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Lu Clinic and Hospital": { facilityType: "hospital", phone: "(064) 477-0427 / 0933 813 1697", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Dr. Domingo B. Tamondong Memorial Hospital & College Foundation, Inc.": { facilityType: "hospital", phone: "0915 778 4566", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Bautista Clinic - Surgery and OB-GYN": { facilityType: "clinic", phone: "0995 305 0052", hours: "Mon-Fri, 9:00 AM-2:00 PM", services: ["OB-GYN consultation", "surgery"], verificationNote: "Waze listing explicitly identifies Surgery and OB-GYN; OB-GYN practice; individual doctor name NA", verificationStatus: "verified" },
  "Manangan Ob-Gyne and Ultrasound Clinic": { facilityType: "clinic", phone: "0906 878 3564", hours: "Mon & Wed 2-5 PM; Tue & Thu 9 AM-4 PM", services: ["OB-GYN consultation", "ultrasound"], verificationNote: "Philippine Society of Maternal-Fetal Medicine directory + Waze; Alona P. Manangan, MD", verificationStatus: "verified" },
  "Sarangani Provincial Hospital": { facilityType: "hospital", phone: "(083) 508-0262", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sarangani Provincial Hospital - Glan": { facilityType: "hospital", phone: "(083) 262-1065 / 0917 502 7062", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Sarangani Provincial Hospital - Malungon": { facilityType: "hospital", phone: "(083) 508-2171 / 0951 814 8697", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "Dr. Jorge P. Royeca City Hospital": { facilityType: "hospital", phone: "(083) 552-4808", hours: "", services: ["Obstetrics and gynecology", "hospital services"], verificationNote: "PIA report + public provider directories; OB-GYN training center; individual roster NA", verificationStatus: "verified" },
  "Socsargen County Hospital": { facilityType: "hospital", phone: "(083) 553-8906 loc. 132 / 0966 172 5930", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "PhilHealth/YAKAP provider listing; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "General Santos Doctors' Hospital, Inc.": { facilityType: "hospital", phone: "(083) 250-2777 / 2888; 0939 726 5806", hours: "24/7 hospital; OB-GYN department active", services: ["Gynecologic oncology", "OB-GYN ultrasonography", "OB-GYN surgery", "normal deliveries"], verificationNote: "Official hospital OB-GYN page; GSDH Obstetrics-Gynecology department; individual roster NA", verificationStatus: "verified" },
  "Dadiangas Medical Center": { facilityType: "hospital", phone: "083-520-7881 / 0917 190 2568", hours: "", services: ["Obstetrics and gynecology", "general hospital services"], verificationNote: "HealthSpace verified facility + doctor affiliation; Verified OB-GYN service; Dr. Germaine Ursabia is affiliated", verificationStatus: "verified" },
  "Gensan Medical Center": { facilityType: "hospital", phone: "(083) 838-79898 / 0998 847 9137", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "Official physician directory + HealthSpace verified facility; specialist roster listed in source workbook", verificationStatus: "verified" },
  "Sarangani Bay Specialists Medical Center, Inc.": { facilityType: "hospital", phone: "0919 067 8408", hours: "", services: ["Obstetrics and gynecology"], verificationNote: "HealthSpace verified facility; Verified OB-GYN service; individual roster NA", verificationStatus: "verified" },
  "St. Elizabeth Hospital, Inc.": { facilityType: "hospital", phone: "(083) 552-3162", hours: "24/7 hospital", services: ["OB-GYN access through affiliated specialist", "hospital services"], verificationNote: "Official specialist affiliation + PhilHealth provider directory; Dr. Germaine Angela C. Ursabia affiliation; additional roster NA", verificationStatus: "verified" },
  "Mindanao Medical Center, Inc.": { facilityType: "hospital", phone: "(083) 301-1153 / (083) 553-8206", hours: "", services: ["OB-GYN access through affiliated specialist", "hospital services"], verificationNote: "Specialist affiliation + provider directory; Dr. Germaine Angela C. Ursabia affiliation; additional roster NA", verificationStatus: "verified" },
  "Clinica Ursabia": { facilityType: "clinic", phone: "0918 679 8168", hours: "Mon-Tue, Fri-Sat, 9 AM-2 PM", services: ["OB-GYN", "high-risk pregnancy", "maternal-fetal medicine", "OB ultrasound", "prenatal check-up", "well-woman care"], verificationNote: "Official clinic website; Dr. Germaine Angela C. Ursabia, MD, FPOGS", verificationStatus: "verified" },
  "Facelo OB-GYN Clinic": { facilityType: "clinic", phone: "0933 354 5400 / (083) 553-0029", hours: "Mon-Fri 2-5:30 PM; Sat 10:30 AM-12 NN", services: ["OB-GYN consultation", "ultrasound", "women's health care"], verificationNote: "Official doctor website; Dr. Bethea L. Facelo-Gonzales, MD", verificationStatus: "verified" },
  "Dr. Cleofe Fernandez-Silva OB-GYN and Ultrasound Clinic": { facilityType: "clinic", phone: "0909 076 2967", hours: "Mon-Sat 10 AM-5 PM", services: ["OB-GYN", "ultrasound"], verificationNote: "Specific verified business listing; Dr. Cleofe Fernandez-Silva", verificationStatus: "verified" },
  "Dr. Lim OB-GYNE Ultrasound Clinic": { facilityType: "clinic", phone: "0915 816 7945", hours: "Mon-Sat 8 AM-4 PM", services: ["OB-GYN", "ultrasound"], verificationNote: "Business listing; Dr. Lim; individual full name NA", verificationStatus: "verified" },
  "Mother and Child OB-GYN and Ultrasound Clinic": { facilityType: "clinic", phone: "0985 513 3746", hours: "Mon-Sat 8 AM-4 PM", services: ["OB-GYN", "ultrasound"], verificationNote: "Business listing; Individual roster NA", verificationStatus: "verified" },
  "GUIOMALA OB-GYN Clinic and Ultrasound": { facilityType: "clinic", phone: "0923 153 8853", hours: "Mon-Sat 9 AM-5 PM", services: ["OB-GYN", "ultrasound"], verificationNote: "Business listing + official physician directory; Dr. Darwiza N. Guiomala", verificationStatus: "verified" },
  "Dr. Mary Lou Amboy-Castillo Ob-Gyne Clinic": { facilityType: "clinic", phone: "", hours: "Mon-Fri 11 AM-5 PM", services: ["OB-GYN consultation"], verificationNote: "Official Gensan Medical Center physician directory + business listing; Dr. Mary Lou Java Amboy-Castillo", verificationStatus: "verified" },
  "Maureen Dimamay-Dazo OB-Gyne Clinic": { facilityType: "clinic", phone: "0932 185 9770", hours: "Mon-Fri 9 AM-3 PM", services: ["OB-GYN consultation"], verificationNote: "Business listing + accredited doctor record; Dr. Maureen D. Dazo", verificationStatus: "verified" },
  "Anna Clarizza Lautengco OB GYNE Clinic": { facilityType: "clinic", phone: "0969 211 2397", hours: "Mon-Fri 9 AM-5 PM; Sat 9 AM-12 NN", services: ["OB-GYN consultation"], verificationNote: "Specific verified business listing; Dr. Anna Clarizza Lautengco", verificationStatus: "verified" },
};

const HELP_RESOURCES_BASE: HelpResource[] = [
  {
    "name": "South Cotabato Provincial Hospital",
    "address": "Aguinaldo St., Koronadal, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5004,
    "longitude": 124.8459,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Soccsksargen General Hospital",
    "address": "Crossing Curva, Surallah, South Cotabato, 9512",
    "city": "Surallah",
    "province": "South Cotabato",
    "latitude": 6.3728,
    "longitude": 124.7457,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Norala District Hospital",
    "address": "M. Roxas St. corner Boston St., Norala, South Cotabato, 9508",
    "city": "Norala",
    "province": "South Cotabato",
    "latitude": 6.5227,
    "longitude": 124.6596,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Allah Valley Medical Specialists Center, Inc.",
    "address": "Gensan Drive, Purok Villegas, Brgy. Zone III, Koronadal City, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5033,
    "longitude": 124.8451,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Dr. Arturo P. Pingoy Medical Center",
    "address": "General Santos Drive, Zone IV, Koronadal City, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5009,
    "longitude": 124.8472,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Socomedics Medical Center",
    "address": "Judge Alba St., Brgy. Zone III, Koronadal City, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5019,
    "longitude": 124.846,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Bontuyan Medical Hospital, Inc.",
    "address": "700 B. Bayan Sr. St., Poblacion, Polomolok, South Cotabato, 9504",
    "city": "Polomolok",
    "province": "South Cotabato",
    "latitude": 6.2237,
    "longitude": 125.0608,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Dantom Doctor's Hospital, Inc.",
    "address": "Lot 443-C Rizal St., Banga, South Cotabato, 9511",
    "city": "Banga",
    "province": "South Cotabato",
    "latitude": 6.3014,
    "longitude": 124.7842,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Howard Hubbard Memorial Hospital",
    "address": "Cannery Site, Polomolok, South Cotabato, 9504",
    "city": "Polomolok",
    "province": "South Cotabato",
    "latitude": 6.2198,
    "longitude": 125.0603,
    "verificationNote": "Dr. Mary Adeline R. Edillon; Dr. Wilma Heramil"
  },
  {
    "name": "Surallah Community Hospital",
    "address": "674 Rosal St., Surallah, South Cotabato, 9512",
    "city": "Surallah",
    "province": "South Cotabato",
    "latitude": 6.3721,
    "longitude": 124.7445,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "K Sampiano OB-GYN Ultrasound Clinic",
    "address": "General Santos Drive corner Lacson St., Zone IV, Koronadal City, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5009,
    "longitude": 124.847,
    "verificationNote": "K. Sampiano / individual OB-GYN listing"
  },
  {
    "name": "Adalin OB GYN and Dental Clinic",
    "address": "Door 1 NDSSM Building, Alunan Ave., Brgy. Zone III, Koronadal City, South Cotabato, 9506",
    "city": "Koronadal",
    "province": "South Cotabato",
    "latitude": 6.5005,
    "longitude": 124.8452,
    "verificationNote": "OB-GYN doctors; individual schedule may change"
  },
  {
    "name": "Cotabato Provincial Hospital",
    "address": "Kidapawan City, Cotabato",
    "city": "Kidapawan",
    "province": "Cotabato",
    "latitude": 7.0084,
    "longitude": 125.0895,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "University of Southern Mindanao Hospital",
    "address": "USM Compound, Kabacan, Cotabato, 9407",
    "city": "Kabacan",
    "province": "Cotabato",
    "latitude": 7.1066,
    "longitude": 124.8296,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Kidapawan Doctors Hospital, Inc.",
    "address": "Ninoy Aquino Road, Brgy. Lanao, Kidapawan City, Cotabato",
    "city": "Kidapawan",
    "province": "Cotabato",
    "latitude": 7.011,
    "longitude": 125.0904,
    "verificationNote": "Dr. Benilina O. Badilla; Dr. Elsa P. Khio"
  },
  {
    "name": "Madonna Medical Center, Inc.",
    "address": "Quezon Blvd., Kidapawan City, Cotabato",
    "city": "Kidapawan",
    "province": "Cotabato",
    "latitude": 7.0076,
    "longitude": 125.089,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Midway Hospital",
    "address": "Osmeña Drive, Kidapawan City, Cotabato",
    "city": "Kidapawan",
    "province": "Cotabato",
    "latitude": 7.0098,
    "longitude": 125.0877,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Midsayap Diagnostic Center and Hospital, Inc.",
    "address": "National Highway, Midsayap, Cotabato, 9410",
    "city": "Midsayap",
    "province": "Cotabato",
    "latitude": 7.0212,
    "longitude": 124.3831,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Midsayap Doctors Specialist Hospital, Inc.",
    "address": "145 Quezon Ave., Midsayap, Cotabato, 9410",
    "city": "Midsayap",
    "province": "Cotabato",
    "latitude": 7.023,
    "longitude": 124.3839,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sara Family Clinic and Hospital, Inc.",
    "address": "Jaycee Ave., Poblacion 2, Midsayap, Cotabato, 9410",
    "city": "Midsayap",
    "province": "Cotabato",
    "latitude": 7.0222,
    "longitude": 124.3824,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Anecito T. Pesante Sr. Memorial Hospital Co.",
    "address": "Corner Pioneer & Tiza Streets, Midsayap, Cotabato",
    "city": "Midsayap",
    "province": "Cotabato",
    "latitude": 7.0208,
    "longitude": 124.3817,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Community Health Service Cooperative Hospital",
    "address": "Poblacion 8, Midsayap, Cotabato",
    "city": "Midsayap",
    "province": "Cotabato",
    "latitude": 7.0188,
    "longitude": 124.385,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Antipas Medical Specialists Hospital, Inc.",
    "address": "National Highway, Antipas, Cotabato",
    "city": "Antipas",
    "province": "Cotabato",
    "latitude": 7.7824,
    "longitude": 125.0125,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Makilala Midway Hospital, Inc.",
    "address": "National Highway, Makilala, Cotabato",
    "city": "Makilala",
    "province": "Cotabato",
    "latitude": 6.969,
    "longitude": 125.085,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sorilla Medical and Maternity Clinic & Hospital",
    "address": "National Highway, Sibsib, Tulunan, Cotabato",
    "city": "Tulunan",
    "province": "Cotabato",
    "latitude": 6.8362,
    "longitude": 124.884,
    "verificationNote": "Dr. Grace Marie G. Sorilla / OB-Gynecology on-call listing"
  },
  {
    "name": "Sultan Kudarat Provincial Hospital",
    "address": "National Highway, Kalawag II, Isulan, Sultan Kudarat, 9805",
    "city": "Isulan",
    "province": "Sultan Kudarat",
    "latitude": 6.635,
    "longitude": 124.6007,
    "verificationNote": "Medical Specialist II – Obstetrics and Gynecology position identified by DOH; individual name NA"
  },
  {
    "name": "Sultan Kudarat Doctors Hospital, Inc.",
    "address": "25 National Highway, Tacurong, Sultan Kudarat, 9800",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.694,
    "longitude": 124.6766,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sultan Kudarat Medical Specialists Center, Inc.",
    "address": "Alunan Highway, Tacurong, Sultan Kudarat, 9800",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.695,
    "longitude": 124.675,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "St. Louis Hospital",
    "address": "Purok Yellowbell, Tacurong, Sultan Kudarat, 9800",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.6917,
    "longitude": 124.6758,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sandig Medical Clinic and Hospital",
    "address": "5 Ledesma St., Tacurong, Sultan Kudarat, 9800",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.6926,
    "longitude": 124.6775,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Tomboc-Salayog Hospital",
    "address": "Purok Waya-Waya, Tacurong, Sultan Kudarat",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.6932,
    "longitude": 124.681,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Lu Clinic and Hospital",
    "address": "National Highway, Tacurong, Sultan Kudarat",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.6947,
    "longitude": 124.6738,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Dr. Domingo B. Tamondong Memorial Hospital & College Foundation, Inc.",
    "address": "Purok Liwayway, Esperanza, Sultan Kudarat",
    "city": "Esperanza",
    "province": "Sultan Kudarat",
    "latitude": 6.5254,
    "longitude": 124.5212,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Bautista Clinic - Surgery and OB-GYN",
    "address": "Mabini St., Poblacion, Tacurong City, Sultan Kudarat, 9800",
    "city": "Tacurong",
    "province": "Sultan Kudarat",
    "latitude": 6.6923,
    "longitude": 124.6761,
    "verificationNote": "OB-GYN practice; individual doctor name NA"
  },
  {
    "name": "Manangan Ob-Gyne and Ultrasound Clinic",
    "address": "Isulan, Sultan Kudarat (Plus Code JHJX+2CC)",
    "city": "Isulan",
    "province": "Sultan Kudarat",
    "latitude": 6.6298,
    "longitude": 124.6004,
    "verificationNote": "Alona P. Manangan, MD"
  },
  {
    "name": "Sarangani Provincial Hospital",
    "address": "Capitol Complex, Alabel, Sarangani, 9501",
    "city": "Alabel",
    "province": "Sarangani",
    "latitude": 5.8895,
    "longitude": 125.2031,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sarangani Provincial Hospital - Glan",
    "address": "D. Cania St., Glan, Sarangani, 9517",
    "city": "Glan",
    "province": "Sarangani",
    "latitude": 5.8248,
    "longitude": 125.2037,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Sarangani Provincial Hospital - Malungon",
    "address": "Purok Maliwanag, Malungon, Sarangani, 9503",
    "city": "Malungon",
    "province": "Sarangani",
    "latitude": 6.283,
    "longitude": 125.282,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "Dr. Jorge P. Royeca City Hospital",
    "address": "E. Fernandez St., Lagao, General Santos City, South Cotabato, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.119,
    "longitude": 125.171,
    "verificationNote": "OB-GYN training center; individual roster NA"
  },
  {
    "name": "Socsargen County Hospital",
    "address": "Bula-Lagao Road corner Arradaza St., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1117,
    "longitude": 125.1772,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "General Santos Doctors' Hospital, Inc.",
    "address": "National Highway, General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1128,
    "longitude": 125.1717,
    "verificationNote": "GSDH Obstetrics-Gynecology department; individual roster NA"
  },
  {
    "name": "Dadiangas Medical Center",
    "address": "Allado Compound, Leon Llido St., General Santos City, South Cotabato, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.114,
    "longitude": 125.173,
    "verificationNote": "Verified OB-GYN service; Dr. Germaine Ursabia is affiliated"
  },
  {
    "name": "Gensan Medical Center",
    "address": "Purok Veterans, National Highway, General Santos City, South Cotabato, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1037,
    "longitude": 125.1659,
    "verificationNote": "Maria Sonrisa Dela Cruz Gabor; Jeannet Arriola Garcia; Rodman Jay Miguel Garcia; Darwiza N. Guiomala; Rhodora G. Gagwis; Mary Lou Java Amboy-Castillo; Rose Zennery Coll Peñamante-Go; Melba Sueno Lay; May Flor Batalla Juruena-Cambongga"
  },
  {
    "name": "Sarangani Bay Specialists Medical Center, Inc.",
    "address": "National Highway, Makar Junction, Brgy. Apopong, General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.0895,
    "longitude": 125.1595,
    "verificationNote": "Verified OB-GYN service; individual roster NA"
  },
  {
    "name": "St. Elizabeth Hospital, Inc.",
    "address": "National Highway, General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1158,
    "longitude": 125.1743,
    "verificationNote": "Dr. Germaine Angela C. Ursabia affiliation; additional roster NA"
  },
  {
    "name": "Mindanao Medical Center, Inc.",
    "address": "Mabuhay Road, General Santos City, South Cotabato, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.115,
    "longitude": 125.1648,
    "verificationNote": "Dr. Germaine Angela C. Ursabia affiliation; additional roster NA"
  },
  {
    "name": "Clinica Ursabia",
    "address": "Ground Floor, HQ Lab Ni Dok Clinics & Diagnostics, Benda Bldg., Santiago Blvd., General Santos City",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1126,
    "longitude": 125.17,
    "verificationNote": "Dr. Germaine Angela C. Ursabia, MD, FPOGS"
  },
  {
    "name": "Facelo OB-GYN Clinic",
    "address": "Unit 210 Santanna Building, Santiago Boulevard, General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1126,
    "longitude": 125.1703,
    "verificationNote": "Dr. Bethea L. Facelo-Gonzales, MD"
  },
  {
    "name": "Dr. Cleofe Fernandez-Silva OB-GYN and Ultrasound Clinic",
    "address": "2/F Specialist Medical Center, Specialist Building, Santiago Blvd., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1125,
    "longitude": 125.1704,
    "verificationNote": "Dr. Cleofe Fernandez-Silva"
  },
  {
    "name": "Dr. Lim OB-GYNE Ultrasound Clinic",
    "address": "Jose Catolico Sr. Ave., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.118,
    "longitude": 125.168,
    "verificationNote": "Dr. Lim; individual full name NA"
  },
  {
    "name": "Mother and Child OB-GYN and Ultrasound Clinic",
    "address": "San Miguel St., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.116,
    "longitude": 125.1705,
    "verificationNote": "Individual roster NA"
  },
  {
    "name": "GUIOMALA OB-GYN Clinic and Ultrasound",
    "address": "Juan Crisologo St., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1172,
    "longitude": 125.1715,
    "verificationNote": "Dr. Darwiza N. Guiomala"
  },
  {
    "name": "Dr. Mary Lou Amboy-Castillo Ob-Gyne Clinic",
    "address": "Santiago Blvd., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1128,
    "longitude": 125.1705,
    "verificationNote": "Dr. Mary Lou Java Amboy-Castillo"
  },
  {
    "name": "Maureen Dimamay-Dazo OB-Gyne Clinic",
    "address": "Camias St., General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.114,
    "longitude": 125.168,
    "verificationNote": "Dr. Maureen D. Dazo"
  },
  {
    "name": "Anna Clarizza Lautengco OB GYNE Clinic",
    "address": "031 South Osmeña Street, General Santos City, 9500",
    "city": "General Santos City",
    "province": "General Santos City/Sarangani area",
    "latitude": 6.1178,
    "longitude": 125.1695,
    "verificationNote": "Dr. Anna Clarizza Lautengco"
  }
];

export const HELP_RESOURCES: HelpResource[] = HELP_RESOURCES_BASE.map((resource) => ({
  ...resource,
  ...(REGION12_DIRECTORY_METADATA[resource.name] ?? {
    facilityType: resource.facilityType ?? (resource.name.toLowerCase().includes("clinic") ? "clinic" : "hospital"),
    phone: resource.phone ?? "",
    hours: resource.hours ?? "",
    services: resource.services ?? ["Obstetrics and gynecology"],
    verificationNote: resource.verificationNote,
    verificationStatus: resource.verificationStatus ?? "needs_confirmation",
  }),
}));
