export const anatomyTopics = {
  ovaries: {
    title: "Ovaries",
    summary: "Paired organs that produce hormones and hold follicles at different stages of growth.",
    why: "Follicles are a normal part of egg development. Seeing follicles does not by itself indicate a health problem.",
    pcos: "In adults, ultrasound may show polycystic ovarian morphology (PCOM), but this is a description—not a diagnosis. Ultrasound should not be used to diagnose PCOS in adolescents because definitive criteria are lacking.",
    source: "Teede et al., 2023; Gibson and Mahdy, 2025",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/",
    position: "anatomy-topic-ovaries",
  },
  uterus: {
    title: "Uterus",
    summary: "A muscular organ where a pregnancy can develop.",
    why: "Its inner lining changes during the menstrual cycle and is shed during menstruation when pregnancy does not occur.",
    pcos: "PCOS can affect menstrual patterns, but the appearance of the uterus alone cannot determine whether someone has PCOS.",
    source: "CDC reproductive system education; Teede et al., 2023",
    href: "https://www.cdc.gov/healthyyouth/healthservices/pdf/female_reproductive_system.pdf",
    position: "anatomy-topic-uterus",
  },
  tubes: {
    title: "Fallopian tubes",
    summary: "Tubes connecting the area near each ovary to the uterus.",
    why: "They help transport an egg, and fertilization commonly occurs in one of these tubes.",
    pcos: "Fallopian tubes are part of reproductive anatomy, but their appearance does not indicate PCOS.",
    source: "CDC reproductive system education",
    href: "https://www.cdc.gov/healthyyouth/healthservices/pdf/female_reproductive_system.pdf",
    position: "anatomy-topic-tubes",
  },
  cervix: {
    title: "Cervix",
    summary: "The lower, narrow part of the uterus that opens into the vagina.",
    why: "It allows menstrual blood to pass from the uterus and changes during pregnancy and childbirth.",
    pcos: "The cervix is not used to diagnose PCOS. Clinicians assess menstrual patterns, androgen-related signs or tests, age, and other possible causes.",
    source: "CDC reproductive system education; Teede et al., 2023",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/",
    position: "anatomy-topic-cervix",
  },
  endometrium: {
    title: "Endometrium",
    summary: "The inner lining of the uterus.",
    why: "It changes throughout the menstrual cycle and is shed during menstruation.",
    pcos: "Irregular or infrequent cycles may affect how often this lining sheds, but endometrial appearance alone cannot diagnose PCOS.",
    source: "CDC reproductive system education; Teede et al., 2023",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/",
    position: "anatomy-topic-endometrium",
  },
} as const;

export type AnatomyTopicId = keyof typeof anatomyTopics;
