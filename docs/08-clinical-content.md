# 08 — Clinical Content, Disclaimers & Education Copy

**Status:** Draft v1 for UI / proposal  
**Last updated:** 2026-07-13  
**Depends on:** `02`, `04`, `07`  

> Not a substitute for clinician-approved final wording. Review with adviser if possible.

---

## 1. Positioning statements

### Short
P.R.O.M.I.S.E. is an AI-assisted screening and education support system for menstrual health and PCOS **risk awareness**. It does not diagnose PCOS.

### Longer (About page)
P.R.O.M.I.S.E. (PCOS Risk Observation, Monitoring, Intervention, Screening, and Education) is a capstone research web application designed for females aged 12–24 in the Philippines. It helps users track menstrual patterns, complete a rule-based risk screening questionnaire, receive educational explanations, and understand when professional medical consultation may be helpful. Computers calculate metrics, rules classify screening risk, and AI helps explain results in plain language. It is not a hospital system, not a doctor, and not a diagnostic device.

---

## 2. Global disclaimer (reuse component)

**Title:** Important  
**Body:**
> This application provides health education and screening support only. It does **not** diagnose PCOS or any other condition, and it does not replace consultation with a licensed healthcare professional. If you have severe symptoms or feel unsafe, seek local emergency or clinical care.

Show on: landing, screening intro, result, AI assistant, referral block.

---

## 3. Consent copy (short form)

1. **Non-diagnosis** — I understand P.R.O.M.I.S.E. does not diagnose PCOS and does not replace professional medical care.  
2. **Health data** — I agree that my profile, menstrual logs, and screening answers will be stored in my account to provide app features for this capstone research system.  
3. **AI** — I consent to AI-assisted explanations using third-party services (such as Groq or Google Gemini), which may process my questions and limited health context.  
4. **Notifications** — I agree to receive email and/or SMS reminders related to tracking and follow-up via automated workflows.  
5. **Research framing** — I understand this system is developed as an academic capstone project in the Philippines.  
6. **Guardian (12–17)** — A parent/guardian has been informed and consents to my participation; I assent to using the app.

---

## 4. Screening intro copy

> This questionnaire looks at common factors associated with PCOS risk in educational screening tools, such as cycle patterns, skin and hair changes, weight concerns, and family history. Your answers produce a **Low, Moderate, or High screening result**. This is not a diagnosis. Only a qualified clinician can evaluate PCOS using medical history, examination, and appropriate tests when needed.

---

## 5. Result category copy

### Low
> Your screening responses suggest fewer factors commonly discussed in PCOS risk education. Keep tracking your cycles and check in with a healthcare professional if symptoms change or you feel concerned.

### Moderate
> Your responses include several factors that are often discussed in PCOS risk screening. This does **not** mean you have PCOS. Consider consulting a healthcare professional for personalized evaluation, especially if symptoms affect your daily life.

### High
> Your responses include multiple or stronger factors associated with PCOS risk in screening contexts. This is still **not a diagnosis**. It is a good idea to schedule a consultation with a healthcare professional for proper assessment and guidance.

---

## 6. Referral support block

### Heading
Recommended next step: talk to a professional

### Why (dynamic)
Prefill from rule engine contributing factors.

### Prepare for your visit (checklist)
- [ ] Note your last few period start dates (or open your P.R.O.M.I.S.E. history)  
- [ ] List symptoms (acne, hair changes, weight changes, pain, mood) and when they started  
- [ ] Bring a list of medicines / contraceptives / supplements  
- [ ] Write questions: “Could my cycles be irregular for reasons other than PCOS?” “What evaluations are appropriate for my age?”  
- [ ] If comfortable, bring a parent/guardian (especially under 18)  

### Questions you can ask
1. Are my cycles within expected variation for my age?  
2. What else can cause irregular periods or acne besides PCOS?  
3. Do I need labs or imaging, and why?  
4. What lifestyle steps are safe for me?  
5. When should I follow up?  

---

## 7. Lifestyle education (general, non-prescriptive)

Use as cards or AI grounding facts:

- **Movement:** Regular physical activity appropriate for age/ability may support metabolic and menstrual health.  
- **Nutrition patterns:** Balanced meals with vegetables, protein, and fewer sugary drinks are generally encouraged in public health education.  
- **Sleep:** Aim for consistent sleep routines; many teens need adequate night sleep for overall health.  
- **Stress:** Stress does not “cause PCOS” by itself in simple terms, but stress management supports wellbeing.  
- **Weight talk:** Use non-shaming language; focus on healthy habits, not body criticism.  

Never present these as guaranteed treatments.

---

## 8. Menstrual education snippets

- Cycle length is often counted from day 1 of bleeding to the day before the next period starts.  
- Teen cycles can be irregular in early years after menarche.  
- Tracking helps you notice patterns to discuss with a clinician.  
- App predictions are estimates only.

---

## 9. Urgent care messaging (non-exhaustive)

Show when relevant (AI safety or static help page):

> Seek urgent medical care or emergency services if you have very heavy bleeding that soaks through protection quickly, severe pelvic pain, fainting, chest pain, difficulty breathing, thoughts of self-harm, or possible pregnancy complications. P.R.O.M.I.S.E. cannot provide emergency care.

Add PH-specific hotlines only if verified for your proposal.

---

## 10. Source framing for capstone paper

You may describe the instrument as **informed by** common PCOS educational themes (ovulatory dysfunction symptoms, hyperandrogenism features, metabolic risk, family history), **not** as an implementation of a licensed diagnostic standard.

Suggested citation categories to gather for your manuscript:
- Adolescent PCOS review articles / endocrine society style guidance summaries  
- Menstrual cycle education references  
- Asia-Pacific BMI discussion references  
- mHealth / CDSS ethics & informed consent references  

Exact bibliography is your research task; keep app claims humble.

---

## 11. Tone guide

| Do | Don’t |
|----|-------|
| Calm, clear, respectful | Alarmist “you definitely have…” |
| “Screening result” | “Diagnosis” |
| “Consider consulting” | “You must start drug X” |
| Inclusive, non-shaming body language | Fat-shaming or beauty pressure |
| Filipino-friendly simple English (MVP) | Heavy medical jargon without explanation |

Filipino / Taglish localization can be a later enhancement.

---

## 12. Notification message drafts (Make.com)

### Period reminder
> Hi {{firstName}}, this is a friendly P.R.O.M.I.S.E. reminder that your period may be approaching. Logging your start date helps your cycle insights stay accurate.

### Missed tracking
> Hi {{firstName}}, we noticed you might not have logged a recent period entry. A quick update in P.R.O.M.I.S.E. keeps your tracking up to date.

### Elevated risk follow-up
> Hi {{firstName}}, this is an educational follow-up from P.R.O.M.I.S.E. Your recent screening suggested factors worth discussing with a healthcare professional. This is not a diagnosis. Open the app for your referral checklist.

All SMS should stay short and non-diagnostic.

---

## Next

`09-ux-ia.md` for screens, nav, and wireframe-level structure.
