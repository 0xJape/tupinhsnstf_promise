P.R.O.M.I.S.E.
P.R.O.M.I.S.E. (PCOS Risk Observation, Monitoring, Intervention, Screening, and Education): An AI-Assisted Mobile Clinical Decision Support System (MCDSS) for PCOS Risk Screening, Menstrual Health Monitoring, Dermatological Assessment, Lifestyle Management, and Clinical Referral Support Among Adolescent Females
Vision
P.R.O.M.I.S.E. is not a diagnostic application.
It is an AI-Assisted Mobile Clinical Decision Support System (MCDSS) that helps adolescent females:
understand their menstrual health,
assess their potential risk for PCOS,
receive personalized health education,
monitor symptoms over time,
and know when professional medical consultation is recommended.
Think of it as an intelligent health companion rather than an AI doctor.
Core Philosophy
Instead of forcing AI to make every decision:
Computers handle calculations.
Rules handle screening.
AI handles reasoning and communication.
Automation handles reminders.
Each technology does what it's best at.

Overall System Architecture
                 Mobile Application
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
 Questionnaire     Menstrual Tracker   Image Upload
        │                │                 │
        └──────────────┬─┴─────────────────┘
                       ▼
          Rule-Based Decision Engine
        • BMI
        • Symptom scoring
        • Cycle calculations
        • PCOS risk classification
        • Referral logic
                       │
         ┌─────────────┴──────────────┐
         │                            │
         ▼                            ▼
      LLM API                    Make.com
         │                            │
         ▼                            ▼
 Health Analysis             Notifications
 Personalized Advice         Reminders
 Education                   Follow-ups
 Clinical Explanation        Email / SMS / Push

Module Breakdown
1. User Profile
Stores:
Age
Height
Weight
Family history
Medical history
Lifestyle information
Purpose:
Provides baseline information for screening.

2. Menstrual Health Monitoring
Users record:
First day of menstruation
Duration
Flow
Pain level
Cycle regularity
The app automatically computes:
Cycle length
Missed periods
Irregular cycles
Predicted next period
No AI required.
Pure date calculations.

3. PCOS Risk Screening
The user answers evidence-based screening questions.
Examples:
Irregular menstruation
Acne
Facial hair
Hair loss
Weight gain
Family history
BMI
The application assigns weighted scores.
Example:
Irregular periods = +3
Acne = +2
Family history = +2
BMI >25 = +1
Total Score:
Low Risk
Moderate Risk
High Risk
This is rule-based, making it explainable and consistent.

4. Dermatological Assessment
User uploads photos.
Possible assessments include:
Acne severity
Oily skin
Other visible skin concerns associated with PCOS
Instead of building your own computer vision model, you can use a vision-capable AI API to analyze the images and return structured observations.

5. AI Health Assistant
This is where the LLM shines.
It does not calculate the risk score.
Instead, it:
explains the screening results,
interprets symptom patterns,
answers PCOS-related questions,
generates personalized lifestyle recommendations,
summarizes menstrual trends,
provides educational content in simple language.
Example:
"Based on your responses, your irregular menstrual cycles and persistent acne are factors commonly associated with PCOS risk. This does not mean you have PCOS, but it would be advisable to consult a healthcare professional for further evaluation."

6. Lifestyle Management
The AI provides recommendations based on the user's profile, such as:
Diet suggestions
Exercise recommendations
Sleep hygiene
Stress management
Weight management tips
These are educational and supportive, not prescriptions.

7. Clinical Referral Support
If the rule engine determines the user is at elevated risk, the system can:
recommend consultation with a healthcare provider,
explain why the recommendation was made,
provide guidance on preparing for a clinical visit.
The app supports clinical decision-making but does not replace professional diagnosis.

8. Notifications (Make.com)
Rather than building a notification system from scratch, you'll use Make.com to automate workflows.
Examples:
Upcoming menstrual reminders
Missed tracking reminders
Medication reminders (if applicable)
Follow-up reminders for high-risk users
Weekly health summaries
Educational notifications
Appointment reminders
Automation makes the system scalable and easier to maintain.

user inputs we might need
User Profile (Master Health Profile)
1. Personal Information
These identify the user and provide demographic context.
Field
Type
Required
Purpose
Full Name
Text
✔
User identification
Age
Number
✔
PCOS risk context
Date of Birth
Date
✔
Age verification
Sex
Fixed: Female
✔
Target population
Email Address
Email
✔
Authentication & notifications
Mobile Number
Number
Optional
SMS reminders
Profile Picture
Image
Optional
User profile


2. Physical Measurements
These are used throughout the system.
Field
Purpose
Height (cm)
BMI calculation
Weight (kg)
BMI calculation
Waist Circumference (cm) (Optional)
Obesity indicator
Current BMI (Auto-calculated)
Risk assessment


3. Family History
Risk factors.
Checkboxes:
Mother has PCOS
Sister has PCOS
Diabetes in family
Hypertension in family
Obesity in family
Infertility history in family
Thyroid disorders in family
None

4. Existing Medical Conditions
Checkboxes.
Diabetes
Prediabetes
Thyroid disorder
Hypertension
Endometriosis
Ovarian cysts
Depression/Anxiety (optional if within your study scope)
None

5. Current Medications
Examples:
Birth control pills
Metformin
Hormonal medication
Vitamins
Other (textbox)
None

6. Lifestyle Profile
Physical Activity
Sedentary
Lightly Active
Moderately Active
Very Active

Exercise Frequency
Never
1–2x/week
3–5x/week
Daily

Average Sleep
Less than 5 hours
5–6 hours
7–8 hours
More than 8 hours

Stress Level
Scale
1–5

Smoking
Yes / No

Alcohol
Never
Occasionally
Frequently

7. Dietary Habits
Simple screening.
How often do you consume:
Sugary drinks
Fast food
Vegetables
Fruits
Water intake
Caffeine

8. Allergies (Optional)
Free text.

9. Emergency Contact (Optional)
Name
Relationship
Contact Number

10. Consent
Required.
☐ I understand this application is not intended to diagnose PCOS.
☐ I agree to the collection of my health information.
☐ I consent to AI-assisted analysis.

Information We DON'T Need Here
Notice I intentionally didn't include menstrual history or symptoms.
Those belong to their own modules because they change over time.
Examples:
Last menstrual period
Acne today
Pain level
Facial hair progression
Those are dynamic data, not profile data.

Overall Data Structure
User
│
├── Personal Information
├── Physical Measurements
├── Family History
├── Medical History
├── Lifestyle
├── Diet
├── Consent
│
├── Menstrual Records
│     ├── July
│     ├── August
│     ├── September
│
├── Symptom Logs
│     ├── Acne
│     ├── Hair Growth
│     ├── Weight Changes
│     ├── Mood
│
├── Dermatology Images
│
├── AI Conversations
│
├── Risk Assessments
│
└── Notifications
Recommendation
I would not overload the initial registration with all of this information. Instead, split onboarding into a few short steps:
Account & Personal Information – Name, age, email, date of birth.
Physical Profile – Height, weight, waist circumference (optional).
Medical & Family History – Conditions, medications, family history.
Lifestyle Profile – Exercise, sleep, diet, stress, smoking, alcohol.
Consent – Privacy and AI assistance acknowledgments.
This gives you a comprehensive baseline profile while keeping the first-time user experience manageable. After onboarding, the app can collect dynamic data (menstrual logs, symptoms, photos, assessments) over time, which will provide the longitudinal information needed for more meaningful analysis and personalized recommendations.

