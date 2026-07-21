# 04 - Rule Engine (PCOS Risk Screening)

**Status:** Draft v2 - Pena 2025 adolescent-aligned educational screen  
**Last updated:** 2026-07-21  
**Depends on:** `01-mvp-scope.md`, `03-user-journeys.md`, `PCOS_Guideline.md`  
**Rule version ID:** `pcos-screen-v2`

---

## 1. Purpose

Define the **deterministic, explainable** scoring logic for PCOS **risk screening** (not diagnosis).

| Layer | Allowed? |
|-------|----------|
| Rule engine computes score and category | Yes |
| AI explains the already-computed result | Yes |
| AI changes score or invents risk level | **No** |

---

## 2. Design principles

1. **Explainable** - every point maps to a user-visible factor  
2. **Reproducible** - same inputs + same `ruleVersion` -> same score  
3. **Adolescent-aware** - gynecologic age (years since menarche) weights cycle items  
4. **Philippines / Asia-Pacific BMI note** - BMI >= 23 metabolic flag  
5. **Versioned** - store `ruleVersion` on every assessment snapshot  
6. **Guideline majors** - High needs both menstrual + hyperandrogenism domains strong; one major = Moderate (at risk)  
7. **No PCOM/AMH scoring** - ultrasound/AMH collected for education only (0 points)

> Capstone screening instrument, not a validated clinical diagnostic algorithm.

---

## 3. Domain caps (max 100)

| Domain | Max |
|--------|-----|
| Menstrual | 30 |
| Hyperandrogenism | 30 |
| Family | 15 |
| Insulin-resistance signs | 10 |
| BMI and weight | 10 |
| Lifestyle | 5 |

### Risk categories (domain majors)

| Pattern | Category |
|---------|----------|
| Both majors >= 20 | **High** |
| Exactly one major >= 20 and other < 15 (or gray elevated) | **Moderate** |
| total < 30 and both majors < 15 | **Low** |

Meta (0 points): `hormonalMeds`, `ultrasoundPcom`, `amhTested`, `moodConcern`.

Implementation: `src/lib/rules/pcosScreen.ts` · types: `src/types/screening.ts`.

---

## 4. Legacy note

`pcos-screen-v1` used flat Q1-Q12 max ~20 and scored ovarian cysts. Superseded by v2. Old result rows may still show v1 `rule_version`.