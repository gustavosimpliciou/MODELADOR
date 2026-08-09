---
name: Imported multi-service setup
description: Replit setup constraints for the imported Nativos Studio Pro multi-service project.
---

The Cortes 3D development server must use Next.js Webpack mode in this environment; the imported Turbopack cache can become inconsistent and crash while restoring task data.

**Why:** The first startup encountered a missing Turbopack SST file, while the same app started and served correctly with Webpack.

**How to apply:** Keep the Cortes workflow on `next dev --webpack` and clear only generated `.next/dev` state when a future startup reports a Turbopack cache corruption error.