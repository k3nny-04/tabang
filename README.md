<div align="center">

# TABANG

**Disaster Response Coordination & Hazard Incident Reporting Platform**

*Rapid disaster response for Naga City*

[![SUS Score](https://img.shields.io/badge/SUS%20Score-84.88%20%E2%80%93%20Excellent-brightgreen)]()
[![Status](https://img.shields.io/badge/status-MVP-blue)]()
[![Stack](https://img.shields.io/badge/stack-React%20%7C%20Firebase%20%7C%20Mapbox-orange)]()
[![License](https://img.shields.io/badge/license-Academic-lightgrey)]()

</div>

---

## About

The Philippines consistently ranks among the most disaster-prone countries in the world, yet local government units continue to face significant gaps in coordinating disaster response. **Tabang** ("help" in Bikol/Filipino) is a web-based, municipal-level disaster response coordination and incident reporting platform built to close that gap — piloted and validated in **Naga City, Camarines Sur**.

It connects three groups of users — **citizens**, **responders**, and **administrators** — around a shared, real-time map of reports, evacuation shelters, response teams, and hazard overlays, and keeps working through an **offline SMS reporting** channel when the internet doesn't.

> A Special Problem (CMSC 190) submitted to the Institute of Computer Science, University of the Philippines Los Baños.
> **Authors:** Ken Alwyn S. Valenciano · Jaime Samaniego

---

## ✨ Key Features

| Category | Feature | Description |
|---|---|---|
| 🧭 | **Incident Reporting** | Citizens file rescue, supply, or incident reports by pinning a location on the map, with reverse-geocoded addresses and live status tracking. |
| 🗺️ | **Hazard-Aware Routing** | Turn-by-turn navigation to shelters or incidents, with Project NOAH flood & storm surge overlays for safer routing. |
| 📡 | **Offline SOS Reporting** | A guided 4-step form generates a formatted SMS report over a dedicated SMS gateway when connectivity is lost. |
| 🏠 | **Shelter Management** | Live evacuation center capacity, contact info, and geolocation — editable by admins. |
| 📦 | **Inventory Management** | Tracks rescue equipment quantity, status, and supplier details. |
| 🚑 | **Dispatch & Teams** | Drag-and-drop assignment of verified reports to response teams, with deployment status tracking. |
| 📊 | **Admin Dashboard** | Real-time stats, live map, and a time-series view of incoming reports. |

---

## 🏗️ Architecture

Tabang runs on a **serverless, web-based architecture**, deployed as an installable **Progressive Web App (PWA)**.

```
┌─────────────────────────────┐
│   Frontend                  │
│   React + TailwindCSS       │
│   Vite PWA · Mapbox GL JS   │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│   Firebase                   │
│   Firestore · Auth           │
│   Cloud Functions · Hosting  │
└──────────────┬───────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼─────┐      ┌──────▼───────┐
│Cloudinary│      │  HttpSms      │
│ (images) │      │  (SMS gateway,│
│          │      │  Android relay)│
└──────────┘      └───────────────┘
```

- **Frontend:** ReactJS, TailwindCSS, Vite PWA plugin, Mapbox GL JS
- **Backend:** Google Firebase — Cloud Firestore (database), Firebase Authentication, Cloud Functions (SMS webhook), Firebase Hosting (CI/CD via GitHub Actions)
- **Media storage:** Cloudinary
- **Offline SMS channel:** HttpSms running on a dedicated Android device, relayed to a Firebase Cloud Function webhook

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Citizen** | Register/login, submit reports, track report status, view shelters & routes, use offline SOS |
| **Responder** | View assigned reports, navigate to incidents, resolve reports, broadcast team location |
| **Administrator** | Verify & manage reports, dispatch teams, manage shelters/inventory/accounts, view dashboard analytics |

---

## 🗃️ Data Sources

| Dataset | Source |
|---|---|
| Evacuation shelter metadata (58 shelters, 20,073 capacity) | Naga City LGU, manually geocoded |
| Flood & storm surge hazard layers | [BetterGov PH](https://huggingface.co/datasets/bettergovph/project-noah-hazard-maps) via UP NOAH |
| Administrative boundaries | [Philippines JSON Maps](https://github.com/faeldon/philippines-json-maps) |
| Barangay emergency contacts | Naga City CDRRMO Facebook page |

---

## 📈 Evaluation

Tabang was evaluated with **20 residents of Naga City** using the **System Usability Scale (SUS)** plus open-ended qualitative questions.

<div align="center">

### 🏆 Mean SUS Score: **84.88** — "Excellent" (Grade B+)

*(Industry average is 68)*

</div>

Participants most valued the **evacuation shelter routing** and the **offline SOS feature**, and generally found the app easy to navigate without prior technical training.

---

## 💸 Estimated Production Cost

Rough monthly cost to run Tabang as a full cloud production system (approximate, May 2026 pricing, $1 = ₱60):

| Scenario | Monthly Cost (PHP) |
|---|---|
| Normal Operations | ~₱284 |
| Active Disaster (peak load) | ~₱7,030 |

Costs are driven mainly by Mapbox map loads and Firebase Hosting transfer during high-traffic disaster events.

---

## 🚀 Future Work

- 🌐 Multi-municipality / provincial-level scaling
- 🔁 Smart rerouting around full shelters and hazardous roads
- 💬 Live chat with administrators per report
- 🗣️ Localization & multilingual support
- 🧩 Duplicate report detection
- 📊 Predictive analytics for seasonal disaster patterns

---

## 📚 Citation

If referencing this work:

```
K. A. Valenciano and J. Samaniego, "TABANG: A Disaster Response Coordination
and Hazard Incident Reporting Platform," CMSC 190 Special Problem, Institute
of Computer Science, University of the Philippines Los Baños, 2026.
```

---

<div align="center">

Built for **Naga City** · Institute of Computer Science, UPLB · 2026

</div>
