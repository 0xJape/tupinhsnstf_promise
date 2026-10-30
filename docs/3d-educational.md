What we are proposing
Add a “Visual Learning” entry inside the existing Health Education area of P.R.O.M.I.S.E. The research
team’s concept is a mobile-friendly interactive 3D model of a stylized teen/young-woman avatar (ages
12–24). Users rotate the model and tap body regions where PCOS-related features are commonly
discussed, such as the face, scalp, neck, armpits, and an internal view of the ovaries, to open short,
cited explanations and a “typical vs. PCOS-associated” comparison.
Recommended user experience
Screen / step Expected behavior
Health Education
Add a card titled “PCOS Visual Learning” with a short
description: “Explore the reproductive system and
learn about common PCOS-related symptoms.”
Choose a topic
Show two large cards: (A) “Explore the reproductive
system” and (B) “Understand PCOS-related
symptoms.”
Interactive anatomy
Display a clean, labeled anatomical illustration or, in
the 3D version, a rotatable avatar with tappable body
regions. Tapping a label such as ovaries, uterus,
fallopian tubes, cervix, or endometrium opens a
compact explanation panel. Include a “Back to
overview” control. Each panel opens with a short
“According to [author, year]” line and a link to a
Sources panel.
Symptoms guide
Show separate illustrated cards for irregular
menstrual cycles, acne, excess/coarse facial or body
hair (hirsutism), scalp hair thinning, and
lifestyle/metabolic health. Explain that symptoms
vary and may have other causes.
What PCOS means
Provide a short plain-language overview that PCOS is
a hormonal condition and that symptom patterns
differ between individuals. Add a “When to seek
professional advice” section.
Learning completion
Offer a “Review key points” panel and a link to
relevant existing P.R.O.M.I.S.E. features such as
menstrual tracking, health education, or Doctor Visit
Report, where those features are already available.
Responsive UI
Must work on mobile first, with a readable desktop
layout; test common phone widths and keyboard
navigation.
Interactive labels
Use accessible buttons/hotspots with visible focus
states. Each label opens a short explanatory panel; do
not rely on color alone.
Content model
Store anatomy and symptom content as structured,
editable data (e.g., title, plain-language explanation,
key point, author and year, full citation, source link,
last-reviewed date).
Accessibility
Use semantic headings, sufficient contrast, alt text,
keyboard support, and plain language. Do not make
important information available only in an image.
Performance
Use a compressed, lightweight 3D model (e.g.,
glTF/GLB) that loads on demand, with optimized
textures, and test on low-end phones.
Privacy
This learning module should not request photos,
collect new health data, or change a user’s PCOS
screening score.
Suggested screen layout (wireframe)
P.R.O.M.I.S.E. | Health Education
PCOS VISUAL LEARNING
Explore the body. Understand possible symptoms. Prepare better questions for a healthcare
professional.
[ Explore the reproductive system ] [ Understand PCOS-related symptoms ]
ANATOMY EXPLORER
[ Tap-to-learn anatomical illustration ]
• Ovaries • Uterus • Fallopian tubes • Cervix • Endometrium
Selected part: OVARIES
Short explanation in plain language, plus “Why this matters” and “Learn more.”
REMEMBER: Visuals support learning only. They do not diagnose PCOS.
Real, existing image references
Open the source pages to inspect the image, check the license/attribution conditions, and download
the preferred resolution.
Reference image A — CDC/Wikimedia Commons anatomical illustration: View labeled
reproductive-system diagram
Reference image B — CDC educational PDF: Open “The Female Reproductive System” diagram
Clinical content reference — 2023 international PCOS guideline: Read the guideline
recommendations (PMC)
The guideline states that ovarian ultrasound morphology is not recommended as a diagnostic
criterion in adolescents because definitive criteria are lacking. Therefore, do not design an
“ovary image = PCOS” comparison or imply that a visual can confirm PCOS.
• Anatomy overview: Ovaries; uterus; fallopian tubes; cervix; endometrium. Give each a brief
function explanation and avoid unnecessary clinical detail.
• PCOS overview: Explain that PCOS is a hormonal condition with a range of possible features; no
single symptom or image proves that someone has PCOS.
• Menstrual health: Explain that cycle patterns vary by age and time since first period. Encourage
users with persistent concerns to consult a qualified health professional.
• Possible symptoms: Use neutral illustrations for acne, hirsutism, and scalp hair thinning. State
that these may have multiple causes and do not independently establish PCOS.
• Support and next steps: Encourage users to track relevant patterns and prepare questions for a
clinician. Link to existing tracking/report features only if present in the current build.
• Evidence and citations: Every explanation should name its source in an “According to [author,
year]” line, for example the normal-ovary and PCOS-related ovary explanations. Do not publish an
explanation that has no cited source.
Clinical safety and wording rules
• Label the module “for education only—not for diagnosis or treatment.”
• Never state that an image of an ovary, follicles, acne, or facial hair confirms PCOS.
• Typical-versus-PCOS comparisons are allowed only as cited, labeled educational cards. Never
present them as a diagnostic visual, quiz, or self-test, especially for adolescent users.
• Do not change the deterministic screening result or screening score based on this module.
• Explain that PCOS can present differently and that a healthcare professional evaluates symptoms
in context.
• Use supportive, non-stigmatizing language; avoid implying that body size, skin appearance, or hair
growth is a personal failure.
• Provide a clear route back to the main app and a “seek professional advice” message when users
have concerns.
Evidence-based explanation: “Normal vs. PCOS” — what the visual
can and cannot show
Critical clinical safeguard: Do not present a side-by-side “normal ovary vs. PCOS ovary” picture as a
test that tells a user whether she may have PCOS. A picture alone cannot establish PCOS, and this is
particularly important for adolescents. Instead, explain what the illustration shows, what PCOS may
involve, why some features prompt further assessment, and why diagnosis requires a clinician’s
assessment.
Why might an ovarian image be associated with PCOS?
In adults, an ultrasound may show polycystic ovarian morphology (PCOM), which can include a higher
number of small follicles and/or increased ovarian volume. These are ultrasound features, not “cysts”
that automatically mean a person has PCOS. PCOM is only one possible diagnostic feature in adults,
and it does not by itself establish the syndrome. The 2023 International Evidence-based Guideline
specifies that ultrasound criteria for PCOM should not be used to diagnose PCOS in adolescents
because definitive adolescent criteria are lacking. The guideline also notes that when an adult has
both irregular menstrual cycles and hyperandrogenism, ultrasound is not necessary to make the
diagnosis (Teede et al., 2023).
What “normal vs. possible PCOS” should mean in this module
Learning topic Accurate educational
explanation
Avoid saying/showing
Ovaries and follicles Follicles are normal
structures involved in egg
development. Some people
have a greater number of
small follicles on ultrasound;
this appearance alone does
not mean they have PCOS.
In adolescents, ovarian
appearance should not be
used to diagnose PCOS.
“These little circles mean
you have PCOS” or a teenfacing diagnostic “normal
ovary / PCOS ovary” test.
Menstrual cycles Cycle patterns can be
irregular during the first
year after the first period as
part of puberty. Persistent
irregularity outside age- and
time-since-menarche
expectations should be
assessed in context.
“Any irregular period means
PCOS.”
Acne and facial/body hair Acne and coarse hair growth “Acne/facial hair proves
can be associated with
androgen excess, but they
also have other causes and
must be interpreted with
age, severity, duration, and
other findings.
PCOS” or image-based
diagnosis from a face photo.
Possible PCOS risk Persistent menstrual
irregularity together with
clinical or biochemical
hyperandrogenism can raise
clinical concern and
warrants professional
assessment. Other causes
may need to be excluded.
“The illustration has
diagnosed you” or an
unvalidated risk conclusion
based only on appearance.
Suggested on-screen explanation for users
“An ultrasound image can show the ovaries and small follicles, but their appearance alone cannot
tell you whether you have PCOS. Small follicles can be seen in people without PCOS, and ovarian
appearance is not recommended for diagnosing PCOS in adolescents (Teede et al., 2023).
Healthcare professionals consider menstrual patterns, signs or blood-test evidence of higher
androgen levels, age and time since the first period, and other possible causes. This visual is for
learning only and is not a diagnosis. If you have concerns about your periods or symptoms, speak
with a qualified healthcare professional.”
• Use an anatomy illustration to identify the ovaries and follicles, not to label an individual’s ovaries
as “normal” or “PCOS.”
• If an adult-focused comparison is included for general education, label it “illustrative ultrasound
appearance sometimes described as polycystic ovarian morphology (PCOM)” and “not diagnostic on
its own.” Do not use it as a self-assessment quiz. For this app’s 12–24 audience, present the ovary
comparison only as the cited, labeled educational card, with the adolescent caution shown first,
and never as a diagnostic or self-assessment visual.
• Use the “What may raise concern?” panel to explain patterns like persistent cycle irregularity and
signs/evidence of androgen excess rather than a single body feature or image.
• Do not use face photos, acne photos, or ovary illustrations to calculate or modify the existing
deterministic PCOS screening result.
Cited educational content for the Anatomy Explorer and Symptoms
Guide
How to show a citation in each panel
• Open each explanation with a short attribution line, for example: “According to Gibson and Mahdy
(2025), …”.
Ovary panel: normal ovary and how ovaries are described in PCOS
Panel A. The ovary: what it is and what it does
“According to Gibson and Mahdy (2025), the ovaries are a pair of organs found in the lower left
and right sides of the abdomen. They produce hormones, including estrogen and progesterone, and
their outer layer, the cortex, holds follicles at different stages of growth.”
Why this matters: follicles are a normal part of how eggs develop, so seeing follicles does not by itself
indicate a health problem (Gibson & Mahdy, 2025).
Panel B. Learn more: how ovaries are described in PCOS (adults)
Open this comparison from the ovary hotspot (internal schematic view). Show it as a labeled
illustration with the text below, never as a quiz or self-test, and always with Panel C shown first or
beside it.
“According to Teede et al. (2023), when an ultrasound with a high-frequency probe (8 MHz or
higher) is used in adults, polycystic ovarian morphology, often shortened to PCOM, is described as
20 or more follicles in an ovary and/or an ovary volume of 10 mL or more, after excluding corpora
lutea, cysts, and dominant follicles. PCOM is an ultrasound description. It is only one possible
feature of PCOS and does not confirm the condition by itself.”
Topic Typical ovary: according to
Gibson & Mahdy (2025)
Polycystic ovarian
morphology (adults):
according to Teede et al.
(2023)
What it describes A paired organ that makes
hormones such as estrogen
and progesterone and holds
follicles at different stages of
growth.
An ultrasound appearance
described in adults. It is a
descriptor, not a diagnosis.
Follicles Follicles of different sizes
and maturity are found in
the cortex.
20 or more follicles in an
ovary and/or an ovary
volume of 10 mL or more,
measured with a probe of 8
MHz or higher.
What it can tell you How the ovary normally
works.
May support a diagnosis
together with the menstrual
pattern and signs of higher
androgen levels. It is not
needed when irregular cycles
and high androgens are both
present.
Caption for the app: “Illustrative text comparison for learning. This is not a diagnostic test.”
Panel C. Important caution for adolescents
“According to Teede et al. (2023), ultrasound should not be used to diagnose PCOS in adolescents,
because definitive adolescent criteria are lacking and ovaries with many small follicles are common
at this stage of life. The American College of Obstetricians and Gynecologists (ACOG, 2019) adds
that signs seen in PCOS can overlap with normal puberty. Peña et al. (2025) recommend that teens
with possible signs be assessed in context and followed over time instead of being labeled early.”
PCOS overview and symptom cards
Card Draft educational statement (shown in the app) Citation
What is
PCOS?
“According to Ghafari et al. (2025) and Stener-Victorin
et al. (2024), PCOS is a common endocrine condition
among females of reproductive age that can affect
reproductive, metabolic, dermatologic, cardiovascular,
and psychological health. The World Health
Organization (2025) reports that it affects an estimated
Ghafari et al.,
2025; StenerVictorin et al.,
2024; World
Health
Organization,
8% to 13% of women of reproductive age, and up to
70% of them remain undiagnosed.”
2025
Menstrual
cycles
“According to Teede et al. (2023) and Peña et al. (2025),
irregular cycles are common in the first year after the
first period as part of puberty. Cycles that stay
irregular beyond what is expected for age and time
since the first period are assessed in context by a
health professional.”
Teede et al., 2023;
Peña et al., 2025
Acne and
excess hair
growth
“According to ACOG (2019), acne and increased hair
growth can overlap with normal puberty, so they are
interpreted together with age, severity, how long they
last, and other findings. Teede et al. (2023) note that,
in adolescents, severe acne and excess hair growth may
point to higher androgen levels and prompt a
professional assessment.”
ACOG, 2019;
Teede et al., 2023
Scalp hair
thinning
“According to the 2023 International Evidence-based
Guideline for PCOS, female-pattern hair loss may be
associated with higher androgen levels. However, scalp
hair thinning can have other causes and does not
independently confirm PCOS. A healthcare professional
should assess hair changes alongside other symptoms
and medical history.”
Teede et al., 2023
Lifestyle and
metabolic
health
“According to Gautam et al. (2025), lifestyle changes
such as healthy eating and regular physical activity
play a role in managing PCOS.” Add in the app’s own
voice: symptoms are never a personal failure.
Gautam et al.,
2025
When to seek
advice
“According to Teede et al. (2023), PCOS is assessed by
a health professional who considers the menstrual
pattern, signs or blood tests for higher androgen levels,
age, and other possible causes. If you are worried
about your periods or symptoms, talk to a qualified
healthcare professional.”
Teede et al., 2023
Uterus “The uterus is a muscular organ where a pregnancy
can develop. Its inner lining changes throughout the
menstrual cycle and is shed during menstruation when
pregnancy does not occur.”
CDC (n.d.); CDC
reproductive
system diagram
Fallopian
tubes
“The fallopian tubes connect the area near the ovaries
to the uterus. They help transport the egg, and
fertilization commonly occurs in one of these tubes.
These structures are part of the reproductive system,
but their appearance alone does not indicate PCOS.”
CDC (n.d.); CDC
reproductive
system diagram
Cervix “The cervix is the lower, narrow part of the uterus that
opens into the vagina. It allows menstrual blood to
pass from the uterus and changes during pregnancy
and childbirth.”
CDC (n.d.); CDC
reproductive
system diagram
Endometrium “The endometrium is the inner lining of the uterus. It
changes throughout the menstrual cycle and is shed
during menstruation. Menstrual changes can have
different causes, so the endometrium alone cannot
determine whether someone has PCOS.”
CDC (n.d.); CDC
reproductive
system diagram
3D body model: clickable regions with cited typical vs. PCOSassociated comparisons
How the interaction works
• Tap a hotspot: face, scalp, neck and armpits, abdomen (opens an internal schematic showing the
ovaries), or menstrual cycle (opens a cycle panel).
• Each region shows two cards: “Typical or common” and “May be seen with PCOS,” followed by a
“Why these matters” line and a Sources link.
• A caution banner stays visible on every comparison.
• Optional age view (12–17 and 18–24): adolescents see the signs the guideline uses for their age
group, and adult-only details such as scalp hair loss and ultrasound description sit behind the
caution card (Teede et al., 2023).
• A skin tone and hair type selector so the illustrations represent different users, since acne, hair
growth, and skin darkening look different across skin tones.
• The same regions are also offered as a list of buttons for keyboard and screen-reader users.
Avatar and image rules
• Because the model represents users who may be minors, keep the avatar stylized, clothed, and
non-sexualized. No realistic nudity, no undressing control, and no hotspots on the breasts,
genitals, or buttocks.
• Show the ovaries only in a schematic internal overlay, not on a realistic body.
• Use illustrations, not real photographs of patients or teens, for the “May be seen with PCOS” cards.
• Do not compare body size or shape as “normal vs. PCOS.” The module compares specific signs
only, in line with the non-stigmatizing language rule.
• No photo upload, no “which looks like you?” quiz, and no effect on the PCOS risk score.
Region-by-region comparison
Hotspot Typical or common May be seen with PCOS Always show
Face “According to the
American College of
Obstetricians and
Gynecologists (ACOG,
2019), acne and some
increase in facial and
body hair can overlap
with normal puberty.”
“According to Teede et al.
(2023), acne and hirsutism,
meaning thick, dark hair
growing in a male-like pattern
such as on the upper lip or
chin, are clinical signs of higher
androgen levels. In adolescents,
the guideline looks for severe
acne and hirsutism.”
These signs have
many causes and
are not a selfdiagnosis. Teede et
al. (2023) also note
that they can
affect emotional
well-being, so offer
supportive wording
and encourage
asking for help.
Scalp “According to Teede et
al. (2023), scalp hair
thinning is not a main
sign used when
assessing PCOS in
adolescents.”
“According to Teede et al.
(2023), female pattern hair loss,
a gradual thinning of scalp hair,
is among the signs of higher
androgen levels assessed in
adults.”
Hair thinning has
many other
causes. Show this
card in full for the
18–24 view only.
Neck and
armpits
Skin that matches the
surrounding area in
texture and color.
“According to Radu et al.
(2022), acanthosis nigricans,
dark, thickened, velvety skin in
body folds such as the neck and
armpits, is linked to insulin
resistance, which can occur in
It is a skin sign of
insulin resistance,
not a hygiene
problem, and it
has other causes.
A health
conditions such as PCOS.” professional
should check it.
Abdomen
(ovary
view)
“According to Gibson
and Mahdy (2025), the
ovaries are a pair of
organs that make
hormones such as
estrogen and
progesterone and hold
follicles at different
stages of growth.”
“According to Teede et al.
(2023), in adults, ultrasound
with a probe of 8 MHz or higher
describes polycystic ovarian
morphology as 20 or more
follicles in an ovary and/or an
ovary volume of 10 mL or
more.”
Show the
adolescent caution
first (Section 12,
Panel C):
ultrasound should
not be used to
diagnose PCOS in
adolescents (Teede
et al., 2023). It is a
description, not a
diagnosis.
Menstrual
cycle
“According to Teede et
al. (2023) and Peña et
al. (2025), irregular
cycles are common in
the first year after the
first period.”
“According to Teede et al. (2023)
and Peña et al. (2025), cycles
that stay irregular beyond what
is expected for age and time
since the first period are
assessed in context by a health
professional.”
Link to menstrual
tracking and the
Doctor Visit Report
only if those
features are
available in the
build.
Caution banner for every comparison
“Many of these features are common during puberty and have other causes. This comparison is for
learning only and cannot tell you whether you have PCOS. If you are worried about your periods,
skin, or hair, talk to a qualified healthcare professional.”
