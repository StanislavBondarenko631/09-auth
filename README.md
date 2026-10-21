# Homework 08: Application Optimization & Global State Management with Zustand

An optimized Next.js 15 application featuring advanced SEO configuration,
performance enhancements via optimized fonts, and modern global state management
using Zustand to implement automated draft saving features.

## 🚀 Key Features Implemented

### 1. Advanced SEO & Open Graph Meta Tags

- **Global & Dynamic Metadata:** Configured strict `Metadata` object exports for
  static assets (`layout.tsx` and `not-found.tsx`), alongside asynchronous
  `generateMetadata` lifecycles for dynamic routing layers.
- **Open Graph Integration:** Enhanced social media preview metrics by embedding
  complete `openGraph` schemas, ensuring accurate `title`, `description`,
  canonical `url` routing alignment, and structured `images` definitions (width,
  height, alt tags) for maximum shareability.

### 2. Built-in Font Optimization

- **Roboto Font Integration:** Substituted legacy font architectures with the
  native `next/font/google` compiler optimization layer. Configured custom
  weights (`400`, `700`), subset limits (`latin`), and instant rendering modes
  (`display: 'swap'`) applied directly via layout-level semantic hooks.

### 3. Native Form Refactoring

- **Formik & Yup Decoupling:** Replaced heavy Formik structures with sleek,
  responsive native HTML-5 forms utilizing direct state management (`useState`),
  significantly reducing client-side package overhead and paving the way for
  seamless state interpolation.
- **UX Route Isolation:** Separated post-creation tasks from cramped pop-up
  overlays into a dedicated semantic sub-route path (`/notes/action/create`).

### 4. Global State & Draft Recovery System with Zustand

- **Automated Client-Side Syncing:** Constructed a centralized store
  architecture with Zustand to instantly track and back up incremental
  form-field entries (`onChange`) on the fly.
- **Persistent Browser Caching:** Layered the core store using Zustand's
  `persist` middleware, ensuring form draft retention inside `localStorage`
  across abrupt browser tab cycles or page reloads.
- **Automated Reset Lifecycles:** Bound form mutations to execute proactive
  `clearDraft()` triggers inside successful submission threads, while
  dynamically retaining progressive state changes on explicit "Cancel"
  navigation triggers.

## 🛠️ Tech Stack Upgrade

- **Framework:** Next.js 15 (App Router)
- **Global State Management:** Zustand v5
- **State Middleware:** Zustand Persist (Browser localStorage)
- **Query Caching:** TanStack Query v5 (React Query)
