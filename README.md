# Personal Command Center Dashboard Prototype

A technical dark-mode personal dashboard UI prototype built with standard Web Technologies (HTML5, Vanilla CSS3, ES6 JavaScript) tailored for continuous deployment on **Vercel**.

## Architecture & Layout System

- **3-Column Asymmetric Grid**:
  - **Column 1 (20%)**: Vital Status & Navigation (User Profile, Focus Score Ring, Health Sparkline, Finances & Learning metrics, Macro Navigation).
  - **Column 2 (55%)**: Active Projects Hub (Header with counter, Context Switcher, HUD Project Cards with status tags, Impact Thesis, visual metrics, Next Milestone box, and Pipeline Stage Distribution Footer).
  - **Column 3 (25%)**: Action Center & Delivery Stream (Quick Ingestion Terminal with `Cmd/Ctrl + K` global shortcut & tag parsing, grouped chronological timeline).
- **Interactive Sliding Side Drawer**: Clicking any project card slides out a UI modal displaying detailed metrics, impact thesis, and live milestone checkboxes.
- **Responsiveness**: Automatically collapses to a single column layout on viewports `< 1024px`, prioritizing Column 2 (Projects Hub).

## Quick Deployment to Vercel via GitHub

1. Clone or push this repository to GitHub.
2. Connect your GitHub repository to [Vercel](https://vercel.com).
3. Vercel automatically detects the static setup and deploys instant edge preview URLs.
