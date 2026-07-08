# ArtCoach — Technical Architecture

**ArtCoach is an AI visual design coach**: upload (or draw) artwork, and a team of
specialized AI agents analyzes it, explains what's working and why, and teaches you
how to improve — like having an expert art instructor on call.

This document is the full platform architecture. For the plain-language, phased
plan that maps this onto our actual stack (Vercel + Supabase + Claude), see
[BUILD-PLAN.md](./BUILD-PLAN.md).

---

## Guiding principle

ArtCoach is a **visual intelligence platform, not a chatbot**. Specialized AI
agents collaborate through structured intermediate representations rather than a
single general-purpose LLM. The architecture separates **perception, reasoning,
teaching, personalization, and knowledge retrieval** so new creative domains
(typography, photography, UI/UX, …) can be added without redesigning the core.

Every response transforms visual observations into meaningful instruction:

1. **What** is happening visually
2. **Why** it works
3. **How** it can improve
4. **How** the artist can continue developing

---

## High-level system architecture

```
Client Applications
(Web / Mobile / Tablet / Drawing Studio)
            |
API Gateway + Authentication Layer
            |
Application Services Layer
 ------------------------------------------------
 |              |              |                |
Analysis     Coaching      Learning        Portfolio
Services     Services      Services        Services
            |
AI Orchestration Layer
 ------------------------------------------------
 |        |          |          |          |
Vision  Design    Color      Style     History
Agent   Agent     Agent      Agent     Agent
            |
Knowledge + Data Layer
 ------------------------------------------------
 |              |              |
Vector DB    Relational DB   Object Storage
(RAG)        (Users/Data)    (Images/Assets)
```

---

## Client applications

### Web application

- **Tech:** React / Next.js, TypeScript, WebGL rendering, Canvas API, Web Workers
  for image processing.
- **Responsibilities:** authentication, artwork upload, interactive critique
  display, overlay visualization, learning dashboard, portfolio management.

### Mobile applications (iOS / Android)

- **Capabilities:** camera capture, artwork scanning, mobile drawing,
  notifications, lesson delivery, progress tracking.
- **Frameworks:** React Native or Flutter; native Swift/Kotlin where drawing
  performance demands it.

### Drawing Studio engine

A dedicated graphics subsystem for creating art inside ArtCoach.

- **Responsibilities:** brush rendering, layer management, stroke history,
  undo/redo, opacity, blending modes, color selection, zoom/pan, stylus input.
- **Future integrations:** Apple Pencil pressure, Wacom tablets, Surface Pen.
- **Storage format:**

```
Artwork Project
├── Canvas Metadata
├── Layers
├── Vector Strokes
├── Raster Assets
├── Color History
└── AI Feedback Timeline
```

---

## Backend service architecture

### API Gateway

Request routing, authentication enforcement, rate limiting, API versioning,
service discovery. Options: Kong, AWS API Gateway, NGINX, Envoy.

### User Identity Service

Account creation, authentication, authorization, subscription management, user
preferences. Backed by PostgreSQL:

```
User
- id
- skill_level
- interests
- preferred_feedback_style
- learning_goals
```

### Artwork Management Service

Owns the artwork lifecycle: upload handling, metadata storage, version history,
portfolio organization, sharing permissions.

- **Object storage** (S3 / GCS / Azure Blob): original images, canvas files,
  generated overlays, analysis results.
- **PostgreSQL metadata:**

```
Artwork
- id
- user_id
- title
- medium
- creation_date
- image_location
- analysis_status
```

---

## AI orchestration layer

Coordinates the expert agents: agent routing, prompt management, context
assembly, tool execution, response synthesis, confidence management.

Frameworks: LangGraph, Semantic Kernel, CrewAI, or a custom workflow engine.

### Expert agent architecture

Each expert agent receives **structured visual observations** and contributes
domain-specific reasoning. Agents communicate through **shared schemas**, e.g.:

```json
{
  "composition": {
    "balance": "asymmetric",
    "focal_points": [
      { "location": [0.62, 0.38], "strength": 0.82 }
    ]
  },
  "colors": [
    { "hue": "blue", "saturation": 0.7, "value": 0.5 }
  ]
}
```

### Vision Agent — perception

Converts raw images into structured visual understanding.

- **Analysis:** object detection, segmentation, edge detection, shape
  recognition, texture analysis, perspective estimation, lighting analysis,
  brush-stroke analysis, spatial relationships.
- **Output — Visual Feature Graph:**

```
Visual Feature Graph
├── Objects
├── Shapes
├── Lines
├── Colors
├── Values
├── Composition
├── Lighting
├── Perspective
└── Spatial Relationships
```

- **AI components:** vision-language models, segmentation models (e.g. Segment
  Anything), depth estimation, CLIP embeddings, OpenCV / custom CV pipelines.

### Design Expert Agent — visual communication

Reasons about the artwork using design principles.

- **Inputs:** Vision Agent output, artwork metadata, retrieved design knowledge.
- **Knowledge domains:** Elements of Design, Principles of Design, Gestalt
  theory, composition systems, visual hierarchy.
- **Analyzes:** balance, contrast, emphasis, movement, rhythm, unity, harmony,
  variety, scale, proportion.
- **Output:**

```json
{
  "principle": "contrast",
  "evidence": ["high value difference between subject and background"],
  "impact": "creates strong focal hierarchy"
}
```

### Color Expert Agent — advanced color reasoning

- **Analyzes:** hue, saturation, value, temperature, harmony, contrast,
  lighting, emotional impact.
- **Pipeline:** image → color extraction → color-space conversion → harmony
  detection → context analysis → teaching explanation.
- **Color systems:** RGB, HSV, HSL, CIELAB, CMYK, Munsell, Pantone.
- **AI components:** color clustering, vision models, color-theory retrieval.

### Style Expert Agent — artistic identification

Recognizes fine-art movements, illustration styles, graphic design systems,
photography genres, and digital-art aesthetics — and **explains its reasoning
rather than only classifying**:

```json
{
  "candidates": [
    {
      "style": "Impressionism",
      "confidence": 0.78,
      "evidence": ["visible brushwork", "light-focused palette"]
    }
  ]
}
```

### Art History Expert Agent — context

Connects artwork to historical context using an art-movement database, artist
biographies, museum collections, and academic references. Builds influence
chains:

```
Impressionism → Monet → Light studies → Post-Impressionism → Van Gogh → Expressionism
```

### Teacher Agent — instruction

Transforms analysis into personalized teaching.

- **Responsibilities:** adjust explanation complexity, generate exercises,
  create lessons, provide encouragement, track learning objectives.
- **Inputs:** user skill level, previous artwork history, current analysis,
  learning goals.
- **Output:**

```json
{
  "explanation_level": "beginner",
  "strengths": [],
  "improvements": [],
  "exercises": []
}
```

---

## Critique generation pipeline

```
User Uploads Artwork
        |
Artwork Processing Service
        |
Vision Agent
        |
 -----------------------------
 |       |       |        |
Design  Color   Style   History
Agent   Agent   Agent   Agent
        |
Critique Synthesis Agent
        |
Teacher Agent
        |
User Feedback
```

### Feedback data model

Every critique follows a structured schema:

```
ArtworkAnalysis
{
  summary,
  elements_of_design,
  principles_of_design,
  color_analysis,
  composition_analysis,
  style_analysis,
  historical_context,
  strengths,
  improvements,
  scores
}
```

---

## Visual overlay system

The Overlay Generation Service renders AI annotations on top of the artwork:

- Rule-of-thirds grids, golden-ratio guides, balance maps, heatmaps, eye-movement
  paths, value maps, color-harmony diagrams, perspective guides.

```
AI Analysis → Overlay Generator → SVG/WebGL Renderer → Client Display
```

Generated overlays are stored alongside artwork versions.

---

## Live coaching architecture

Real-time feedback while the user draws:

```
Canvas Events (stroke added)
        |
Realtime Analysis Queue
        |
Vision Processing
        |
Coaching Rules Engine
        |
Teacher Agent
        |
Feedback Notification
```

- **Technologies:** WebSockets, WebRTC, Redis Streams, Kafka.
- **User-controlled feedback frequency:** disabled / occasional / frequent /
  expert mode.

---

## Knowledge architecture (RAG)

ArtCoach maintains a proprietary structured knowledge system.

```
User Question → Embedding Generation → Vector Search
→ Relevant Knowledge Retrieval → Agent Reasoning → Generated Explanation
```

- **Vector DB options:** Pinecone, Weaviate, Milvus, **pgvector**.
- **Knowledge domains:**

```
Knowledge Base
├── Design Principles
├── Elements of Design
├── Color Theory
├── Composition
├── Gestalt Psychology
├── Art History
├── Artists
├── Movements
├── Exercises
├── Teaching Methods
├── Rubrics
└── Tutorials
```

- **Knowledge document schema:**

```
Knowledge Document
{
  domain,
  concept,
  explanation,
  examples,
  references,
  difficulty_level,
  related_topics
}
```

---

## Data architecture

| Store | Purpose | Contents |
|---|---|---|
| **PostgreSQL** | System of record | Users, profiles, artwork metadata, analyses, lessons, progress, scores, preferences |
| **Vector DB** | Retrieval | Art concepts, historical knowledge, teaching examples, critique patterns |
| **Object storage** | Assets | Images, drawings, canvas files, generated overlays, training assets |
| **Analytics DB** (ClickHouse / BigQuery / Snowflake) | Long-term insight | Improvement trends, common weaknesses, learning behavior, feature usage |

---

## Personalization engine

Identifies artistic growth patterns.

- **Inputs:** artwork history, previous critiques, scores, exercises completed.
- **Output example:**

```
User Pattern:
  Strong:  Composition, Balance
  Needs improvement:  Contrast, Value structure
  Recommendation:  Practice monochromatic value studies
```

- **AI components:** recommendation models, user embeddings, progress
  prediction models.

---

## API design

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/artworks/{id}/analyze` | Kick off analysis → `{ analysis_id, status: "processing" }` |
| `GET  /api/v1/analysis/{id}` | Retrieve critique, scores, overlays, recommendations |
| `POST /api/v1/coaching/session` | Interactive coaching — `{ artwork_id, user_question, skill_level }` |
| `GET  /api/v1/lessons/recommended` | Personalized lesson recommendations |

---

## Security architecture

- OAuth authentication; role-based access control
- Encryption at rest and in transit
- Secure image processing
- **User-controlled artwork privacy** — artists own their work
- Compliance: GDPR, CCPA, data-deletion workflows

---

## Deployment architecture

Cloud-native:

```
Cloud Platform
Kubernetes Cluster
├── API Services
├── AI Orchestrator
├── Agent Services
├── Image Processing Workers
└── Realtime Services
Managed Services
├── PostgreSQL
├── Vector Database
├── Object Storage
└── Message Queue
```

Docker containers, GPU inference nodes, managed databases, CDN for assets.

---

## AI model strategy

**Hybrid architecture:**

- **Foundation models** (LLMs / vision-language models) — reasoning,
  explanation, teaching.
- **Specialized models** — segmentation, color extraction, perspective
  detection, style classification, similarity search.
- **Future proprietary training** — fine-tuned critique models, art-understanding
  embeddings, and personalized coaching models built from user-approved artwork,
  expert critiques, and human feedback.

---

## Development roadmap

| Phase | Name | Scope |
|---|---|---|
| **1** | Foundation (MVP) | User service, artwork storage, vision analysis pipeline, Design/Color/Style experts, RAG knowledge system, critique generation, saved analyses |
| **2** | Interactive Studio | Drawing engine, realtime analysis, overlay generation, perspective tools, color visualization |
| **3** | Personalized Learning | Learning engine, progress analytics, recommendation system, adaptive curriculum |
| **4** | Visual Intelligence Platform | New expert domains: typography, photography, UI/UX, architecture, fashion, product design, branding — added via new expert agents, knowledge domains, rubrics, and visualization tools on the same framework |
