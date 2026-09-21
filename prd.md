# PRD --- RDN Portfolio & Service Website

**Project:** RDN\
**Type:** Portfolio + service ordering website\
**Primary audience:** Siswa satu sekolah\
**Primary device:** Mobile\
**Visual reference:** The uploaded references --- dark, restrained,
editorial portfolio presentation with large typography, generous
whitespace, numbered/structured sections, subtle depth, and premium
monochrome styling. The website should feel inspired by the references,
not copy their exact layout.

------------------------------------------------------------------------

## 1. Product Vision

RDN is a personal portfolio website for offering:

-   Videographer tugas sekolah
-   Video editor tugas sekolah
-   Shooting + editing

The website has two purposes:

1.  Show real portfolio/results in a visually strong way.
2.  Let visitors choose a service package and quickly continue the order
    through Instagram DM.

The website must feel:

-   Minimal
-   Premium
-   Calm
-   Modern
-   Student-friendly
-   Easy to operate
-   Fast on mobile
-   Easy for the owner to maintain

The visual direction follows the uploaded references: dark
charcoal/black interface, restrained white typography, large type, thin
dividers, subtle shadows, structured spacing, and editorial
presentation.

------------------------------------------------------------------------

# 2. Goals

## Primary goals

-   Build credibility through portfolio.
-   Make services and prices understandable immediately.
-   Reduce friction from seeing the portfolio to contacting RDN.
-   Allow the owner to manage portfolio and pricing without editing
    code.
-   Work well on phones while remaining responsive on tablet and
    desktop.

## Non-goals for V1

-   Online payment.
-   Customer accounts.
-   Complex booking calendar.
-   Automatic order management.
-   Chat system.
-   Customer database.
-   Native video hosting.

------------------------------------------------------------------------

# 3. Core User Flow

### Visitor

``` text
Open Website
    ↓
HOME
    ↓
Browse Result
    ↓
Swipe / drag portfolio carousel
    ↓
Tap thumbnail
    ↓
Open configured external project URL
    ↓
Return to website
    ↓
Tap GET
    ↓
See 3 service packages
    ↓
Choose package
    ↓
Instagram opens
    ↓
Prepared DM text is copied/opened
    ↓
Visitor sends DM
```

### Admin

``` text
Admin Login
    ↓
Dashboard
    ├── Results
    │     ├── Create
    │     ├── Read
    │     ├── Update
    │     └── Delete
    │
    ├── Pricing
    │     ├── Edit
    │     ├── Preview
    │     └── Publish
    │
    └── Instagram
          └── Edit + Save
```

------------------------------------------------------------------------

# 4. Visual Direction

## Reference interpretation

The uploaded references establish the following visual principles:

-   Dark charcoal background.
-   Near-black content surfaces.
-   White/off-white typography.
-   Very limited accent color.
-   Large editorial headings.
-   Small uppercase labels.
-   Thin rules/dividers.
-   Strong spacing.
-   Minimal navigation.
-   Content displayed as designed compositions rather than ordinary
    cards.
-   Subtle shadows and depth.
-   Premium portfolio presentation.
-   Avoid generic SaaS dashboard aesthetics on the public website.

## Suggested base colors

``` text
Background      #1E2023
Surface         #17191C
Secondary       #25282C
Muted           #47484C
Text Primary    #F2F2F0
Text Secondary  #A7A8AA
Border          rgba(255,255,255,0.12)
```

These values can be adjusted during visual implementation.

## Glass treatment

Glass morphism should be subtle.

Use:

-   translucent surfaces
-   backdrop blur
-   thin borders
-   soft shadows
-   low-opacity highlights

Do NOT use:

-   excessive glowing gradients
-   colorful glass
-   giant blur effects
-   excessive rounded cards

The references are more editorial/minimal than typical glassmorphism.

------------------------------------------------------------------------

# 5. Typography

Recommended:

-   Primary: Inter or Geist Sans
-   Optional display treatment: same family with large weight/spacing
    differences

Rules:

-   Large typography for major statements.
-   Small uppercase labels for navigation/meta information.
-   Avoid too many font sizes.
-   Avoid decorative fonts.

Example:

``` text
RDN

VIDEOGRAPHER
& VIDEO EDITOR
```

Supporting copy should remain short.

------------------------------------------------------------------------

# 6. Public Website Structure

## 6.1 HOME

The home section is the first viewport.

### Required content

Large:

``` text
RDN
```

Small supporting description below.

Example direction:

``` text
Videography & video editing
for school projects and personal work.
```

This copy is editable in a later content/settings layer if desired, but
V1 can keep the description in code.

### Navigation

Navigation should contain:

``` text
HOME
RESULT
GET
```

Mobile:

-   Compact horizontal navigation.
-   Sticky/floating behavior may be used.
-   No hamburger unless necessary.
-   Active section can have subtle visual feedback.

### Hero behavior

-   Full-screen or near-full-screen first section.
-   Strong vertical rhythm.
-   Minimal visual noise.
-   iOS-style smooth entrance animation.
-   No huge collection of cards.

------------------------------------------------------------------------

# 7. RESULT Section

Purpose:

Show portfolio work.

## Layout

A horizontally scrollable carousel.

On mobile:

-   Swipe left/right.
-   One primary item with partial neighboring items visible.
-   Native-feeling touch interaction.
-   Momentum scrolling.
-   Snap-to-item.

On desktop:

-   Drag with mouse.
-   Arrow controls may appear.
-   Maintain the same visual language.

## Portfolio item

Each item contains:

``` text
[THUMBNAIL]
```

No title is required.

The thumbnail itself is clickable.

### Click behavior

Clicking/tapping a thumbnail opens the external URL stored by the admin.

The URL can be any valid external URL:

-   Instagram
-   YouTube
-   TikTok
-   Google Drive
-   Google Photos
-   Vimeo
-   Other valid URL

Open in a new tab/window where appropriate.

## Instagram text

Below the carousel:

``` text
@rdn_riifin_cam
```

It must:

-   Look like normal text.
-   Not look like a button.
-   Be clickable.
-   Have a subtle hover/focus effect.
-   Open the configured Instagram profile.

Example interaction:

``` text
@rdn_riifin_cam
       ↓
subtle underline / opacity transition
```

No pill button.

------------------------------------------------------------------------

# 8. GET Section

The GET button/section is the conversion point.

When the visitor opens GET:

Display exactly **3 packages**.

The packages are editable from Admin.

Each package contains:

``` text
Package name
Price
Description
Estimated completion
CTA
```

Example structure:

``` text
01
PACKAGE NAME

Rp30.000

Short description.

Estimated:
1–3 days

[ GET ]
```

Then:

``` text
02
PACKAGE NAME

Rp70.000

Short description.

Estimated:
1–3 days

[ GET ]
```

And:

``` text
03
PACKAGE NAME

Rp100.000

Short description.

Estimated:
1–3 days

[ GET ]
```

Actual package names/descriptions/prices are controlled from Admin.

## CTA behavior

When a visitor clicks a package:

1.  Website generates the configured DM message.
2.  Instagram profile is opened.
3.  The visitor is shown/copies the prepared message.

Suggested generated text:

``` text
Halo, kak. Saya mau pesan [NAMA PAKET] dengan harga Rp[HARGA].
```

The exact UX should account for Instagram's limitations: the website
should **not assume Instagram supports arbitrary prefilled DM URLs in
every environment**.

Therefore V1 should:

-   Open the configured Instagram profile/chat destination where
    supported.
-   Also copy the generated message to clipboard.
-   Show a small confirmation:

``` text
Pesan sudah disalin.
Tinggal paste di DM Instagram.
```

Fallback if clipboard permission fails:

``` text
Salin pesan berikut:
[generated message]
```

------------------------------------------------------------------------

# 9. Footer

Standard professional footer.

Required:

-   RDN
-   Instagram
-   Home
-   Result
-   Get
-   Copyright
-   Short service description

Example:

``` text
RDN

Videography & Video Editing

HOME
RESULT
GET

@rdn_riifin_cam

© 2026 RDN. All rights reserved.
```

Do not overload the footer.

------------------------------------------------------------------------

# 10. Admin System

Admin is not visible from the public navigation.

Suggested route:

``` text
/admin
```

## Authentication

User requested:

-   Username
-   Password
-   Forgot password
-   Security question created during initial setup

### Initial setup

On first installation:

``` text
Create admin username
Create password
Create security question
Create security answer
```

Security answer must never be stored as plain text.

Store a secure hash.

### Forgot password

Flow:

``` text
Forgot password
      ↓
Enter username
      ↓
Randomly select configured security question
      ↓
User answers question
      ↓
If correct:
Create temporary password/reset flow
      ↓
Force new password
```

### Security requirements

-   Rate-limit attempts.
-   Add cooldown after repeated failures.
-   Hash password using a modern password hashing algorithm.
-   Hash security answer.
-   Never expose security answer through API.
-   Never return password/security hashes to client.
-   Use secure, HTTP-only session cookies.
-   CSRF protection where applicable.
-   Admin routes must be server-protected, not merely hidden in UI.

### Important V1 limitation

Security questions are weaker than email-based account recovery.

The PRD keeps the requested security-question flow, but the architecture
should allow adding email-based recovery later.

------------------------------------------------------------------------

# 11. Admin Dashboard

Dashboard should be simple and functional.

Main navigation:

``` text
Overview
Results
Pricing
Instagram
Settings
Logout
```

Do not make the dashboard visually complicated.

------------------------------------------------------------------------

# 12. Result CRUD

Admin can:

### CREATE

Fields:

``` text
Thumbnail
Project URL
Sort order
Published status
```

### READ

List all portfolio items.

Each row/card:

``` text
Thumbnail
URL
Status
Order
Edit
Delete
```

### UPDATE

Admin can change:

-   Thumbnail
-   Project URL
-   Sort order
-   Published status

### DELETE

Delete confirmation is required.

Example:

``` text
Delete this result?

[Cancel] [Delete]
```

### Reordering

Admin can manually control carousel order.

Preferred UX:

-   Drag and drop on desktop.
-   Simple move up/down controls as fallback.

------------------------------------------------------------------------

# 13. Thumbnail Upload

Admin selects an image.

Recommended flow:

``` text
Choose image
    ↓
Client-side preview
    ↓
Validate
    ↓
Upload to storage
    ↓
Save storage URL/reference
    ↓
Publish
```

Validation:

-   JPG
-   JPEG
-   PNG
-   WebP
-   reasonable file-size limit

Images should be optimized before delivery where possible.

Do not store images directly inside database rows as base64.

------------------------------------------------------------------------

# 14. Pricing Management

Exactly 3 packages exist in V1.

Admin can edit:

``` text
Package name
Price
Description
Estimated completion
```

Example database structure:

``` text
Package 1
Package 2
Package 3
```

## Edit workflow

Required:

``` text
Edit
 ↓
Preview
 ↓
Publish
```

Saving draft does not immediately change the public website.

### Draft / published model

``` text
Draft content
      ↓
Preview
      ↓
Publish
      ↓
Public website updated
```

Admin should be able to see exactly what visitors will see before
publishing.

------------------------------------------------------------------------

# 15. Instagram Management

Admin can change:

``` text
Instagram username
Instagram URL
```

Public website displays:

``` text
@rdn_riifin_cam
```

The username should not require manually entering `@` in multiple
places.

Recommended stored value:

``` text
rdn_riifin_cam
```

UI adds:

``` text
@
```

when displaying it.

------------------------------------------------------------------------

# 16. Data Model

Recommended backend: **Supabase Postgres + Supabase Storage**.

Core tables:

## admin

``` text
id
username
password_hash
security_question
security_answer_hash
created_at
updated_at
```

## portfolio_results

``` text
id
thumbnail_path
thumbnail_url
project_url
sort_order
is_published
created_at
updated_at
```

## pricing_packages

``` text
id
package_number
name
price
description
estimated_time
is_published
updated_at
```

Because exactly 3 packages are required, `package_number` is constrained
to:

``` text
1
2
3
```

## site_settings

``` text
id
instagram_username
instagram_url
updated_at
```

## pricing_drafts

Optionally separate draft and published records.

Alternative implementation:

``` text
pricing_packages
status = draft/published
version
published_at
```

The implementation should choose whichever is simpler to maintain.

------------------------------------------------------------------------

# 17. Recommended Tech Stack

## Frontend

**Next.js + TypeScript**

Why:

-   Modern.
-   Excellent routing.
-   Good performance.
-   Easy server-side protection for admin.
-   One application instead of separate frontend/backend projects.
-   Easy deployment.

## Styling

**Plain CSS / CSS Modules**

Do not use a large UI framework.

Reason:

-   User explicitly wants simple CSS.
-   Easier to understand and maintain.
-   Full visual control.
-   Smaller conceptual surface.

Use CSS variables for design tokens.

## Backend / Database

**Supabase**

Use:

-   PostgreSQL
-   Storage
-   server-side database access

## Authentication

Custom server-side username/password authentication using secure
password hashing and HTTP-only sessions.

The security-question recovery system is implemented as requested.

## Deployment

**Vercel**

Recommended because it fits naturally with Next.js.

## Version control

**GitHub**

------------------------------------------------------------------------

# 18. Performance Requirements

Target:

-   Fast first load on mobile.
-   Optimized thumbnails.
-   Lazy-load portfolio images.
-   Avoid huge JavaScript libraries.
-   Avoid unnecessary animation libraries.
-   Use CSS transitions where possible.
-   Respect `prefers-reduced-motion`.

Images:

-   Generate responsive sizes.
-   Use modern formats when possible.
-   Set dimensions to prevent layout shift.

------------------------------------------------------------------------

# 19. Animation Requirements

The visual language should feel like modern iOS.

Use subtle:

-   fade
-   translate
-   scale
-   blur transition
-   opacity
-   hover
-   carousel snapping

Avoid:

-   excessive parallax
-   bouncing elements
-   flashy gradients
-   long loading animations
-   animation on every element

Example:

``` css
transition:
  transform 300ms ease,
  opacity 300ms ease,
  border-color 300ms ease;
```

Animation should support the interface, not become the interface.

------------------------------------------------------------------------

# 20. Accessibility

Required:

-   Keyboard navigation.
-   Visible focus states.
-   Alt text for thumbnails.
-   Sufficient contrast.
-   Buttons must have accessible labels.
-   Carousel must be usable without a mouse.
-   `prefers-reduced-motion` support.
-   External links should be identifiable where appropriate.

------------------------------------------------------------------------

# 21. Responsive Requirements

## Mobile

Primary priority.

Expected:

``` text
320px+
```

The website must remain usable on small screens.

## Tablet

Adapt spacing and typography.

## Desktop

Use more whitespace and larger composition without turning the website
into a generic centered card layout.

------------------------------------------------------------------------

# 22. Sprint Plan

# Sprint 1 --- Project Foundation

### Goal

Create the application foundation.

### Tasks

-   Initialize Next.js + TypeScript.
-   Configure project structure.
-   Configure environment variables.
-   Configure Git.
-   Create global CSS variables.
-   Create typography system.
-   Create base layout.
-   Create responsive container.
-   Create public routing.
-   Create `/admin` routing.
-   Configure Supabase project.
-   Establish database connection.

### Deliverable

A running application with:

``` text
/
 /admin
```

and the basic visual foundation.

### Acceptance criteria

-   App runs locally.
-   Mobile layout works.
-   Desktop layout works.
-   Supabase connection works.
-   No hardcoded secrets in repository.

------------------------------------------------------------------------

# Sprint 2 --- Public Visual System

### Goal

Build the reference-inspired public shell.

### Tasks

-   Build navigation.
-   Build hero.
-   Build large RDN typography.
-   Build section labels.
-   Build dividers.
-   Build dark charcoal theme.
-   Build responsive spacing.
-   Build subtle glass surfaces.
-   Add iOS-style transitions.

### Deliverable

A static visual version of:

``` text
HOME
RESULT placeholder
GET placeholder
FOOTER
```

### Acceptance criteria

-   Visual language matches the uploaded reference direction.
-   No generic SaaS/card-dashboard appearance.
-   Mobile is the primary design.
-   Desktop remains balanced.

------------------------------------------------------------------------

# Sprint 3 --- Result Carousel

### Goal

Create the public portfolio experience.

### Tasks

-   Build horizontal carousel.
-   Touch swipe.
-   Mouse drag.
-   Snap scrolling.
-   Thumbnail rendering.
-   Click-to-external-link.
-   Instagram text link.
-   Hover/focus behavior.
-   Empty-state handling.

### Deliverable

Functional Result section using temporary data.

### Acceptance criteria

-   Visitor can swipe portfolio.
-   Visitor can click thumbnail.
-   External URL opens correctly.
-   Instagram text behaves as plain clickable text.
-   Carousel remains usable on mobile.

------------------------------------------------------------------------

# Sprint 4 --- GET / Pricing UI

### Goal

Build the service conversion section.

### Tasks

-   Build exactly 3 pricing packages.
-   Package layout.
-   Price typography.
-   Description.
-   Estimated completion.
-   CTA.
-   Mobile interaction.
-   Desktop interaction.
-   Instagram DM message generation.
-   Clipboard fallback.

### Deliverable

Working pricing flow with temporary data.

### Acceptance criteria

-   Three packages display.
-   CTA generates the correct package-specific message.
-   Instagram destination opens.
-   Message can be copied.
-   Failure to access clipboard has a usable fallback.

------------------------------------------------------------------------

# Sprint 5 --- Supabase Database

### Goal

Replace temporary data with persistent data.

### Tasks

-   Create database tables.
-   Create indexes.
-   Add constraints.
-   Create storage bucket.
-   Configure server-side database access.
-   Seed initial portfolio data.
-   Seed initial pricing.
-   Seed Instagram configuration.

### Deliverable

Public website reads real data from Supabase.

### Acceptance criteria

-   Portfolio survives page reload.
-   Pricing survives page reload.
-   Instagram setting survives page reload.
-   No sensitive admin data is exposed publicly.

------------------------------------------------------------------------

# Sprint 6 --- Admin Authentication

### Goal

Secure the admin system.

### Tasks

-   Admin initial setup.
-   Username/password.
-   Password hashing.
-   HTTP-only sessions.
-   Login.
-   Logout.
-   Protected routes.
-   Security-question setup.
-   Forgot-password flow.
-   Rate limiting.
-   Failed-attempt handling.

### Deliverable

Secure admin authentication.

### Acceptance criteria

-   Unauthorized users cannot access admin functions.
-   Password is never stored plaintext.
-   Security answer is never stored plaintext.
-   Admin session is HTTP-only.
-   Repeated recovery attempts are rate-limited.

------------------------------------------------------------------------

# Sprint 7 --- Result Admin CRUD

### Goal

Allow complete portfolio management.

### Tasks

-   Admin result list.
-   Upload thumbnail.
-   Preview thumbnail.
-   Enter project URL.
-   Create.
-   Edit.
-   Delete.
-   Publish/unpublish.
-   Reorder.
-   Storage cleanup when deleting replaced images.

### Deliverable

Fully manageable Result section.

### Acceptance criteria

Admin can perform:

``` text
Create
Read
Update
Delete
Reorder
Publish
Unpublish
```

without editing code.

------------------------------------------------------------------------

# Sprint 8 --- Pricing Admin

### Goal

Create the draft-preview-publish pricing workflow.

### Tasks

-   Pricing editor.
-   Edit package 1.
-   Edit package 2.
-   Edit package 3.
-   Price validation.
-   Description editor.
-   Estimated-time editor.
-   Draft state.
-   Preview.
-   Publish.
-   Public cache/data refresh.

### Deliverable

Admin can change the entire pricing section.

### Acceptance criteria

-   Draft changes do not unexpectedly appear publicly.
-   Preview matches public design.
-   Publish updates the public pricing.
-   Exactly 3 packages remain available.

------------------------------------------------------------------------

# Sprint 9 --- Instagram Settings

### Goal

Make Instagram configuration manageable.

### Tasks

-   Admin Instagram editor.
-   Username input.
-   URL validation.
-   Preview.
-   Save.
-   Public synchronization.
-   DM generator uses the current Instagram configuration.

### Deliverable

Instagram can be changed without code.

------------------------------------------------------------------------

# Sprint 10 --- Final UI/UX Polish

### Goal

Make the website feel finished.

### Tasks

-   Refine typography.
-   Refine spacing.
-   Refine carousel.
-   Refine glass surfaces.
-   Refine hover states.
-   Refine touch behavior.
-   Add page transitions.
-   Add loading states.
-   Add skeleton states where useful.
-   Add empty states.
-   Add error states.
-   Add success feedback.
-   Improve mobile navigation.

### Deliverable

Production-ready UI.

------------------------------------------------------------------------

# Sprint 11 --- Security & Performance

### Goal

Prepare for public deployment.

### Tasks

-   Security audit.
-   Input validation.
-   URL validation.
-   XSS protection.
-   Auth route review.
-   Session review.
-   Storage access review.
-   Rate-limit review.
-   Image optimization.
-   Lazy loading.
-   Lighthouse testing.
-   Mobile performance testing.

### Deliverable

Release candidate.

------------------------------------------------------------------------

# Sprint 12 --- QA

### Test matrix

## Public

-   Home loads.
-   Navigation works.
-   Result carousel works.
-   Thumbnail links work.
-   Instagram link works.
-   Pricing loads.
-   Package CTA works.
-   Clipboard works.
-   Clipboard fallback works.
-   Footer links work.

## Admin

-   Login works.
-   Logout works.
-   Invalid password rejected.
-   Forgot password works.
-   Security answer validation works.
-   Result create works.
-   Result edit works.
-   Result delete works.
-   Result reorder works.
-   Thumbnail upload works.
-   Pricing edit works.
-   Pricing preview works.
-   Pricing publish works.
-   Instagram edit works.

## Responsive

Test:

-   iPhone-size mobile.
-   Android-size mobile.
-   Tablet.
-   Laptop.
-   Desktop.

------------------------------------------------------------------------

# Sprint 13 --- Deployment

### Tasks

-   Create production Supabase project.
-   Configure production environment variables.
-   Configure Vercel.
-   Connect GitHub repository.
-   Configure production domain.
-   Configure storage.
-   Configure database policies.
-   Create production admin.
-   Remove development seed credentials.
-   Run production smoke test.

### Deliverable

Public production website.

------------------------------------------------------------------------

# 23. Suggested Project Structure

``` text
src/
├── app/
│   ├── page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── results/
│   │   ├── pricing/
│   │   ├── instagram/
│   │   └── settings/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── results/
│   │   ├── pricing/
│   │   └── settings/
│   │
│   └── layout.tsx
│
├── components/
│   ├── public/
│   │   ├── Navbar
│   │   ├── Hero
│   │   ├── ResultCarousel
│   │   ├── Pricing
│   │   └── Footer
│   │
│   ├── admin/
│   │   ├── AdminNav
│   │   ├── ResultManager
│   │   ├── PricingManager
│   │   └── InstagramManager
│   │
│   └── ui/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   └── utils/
│
└── styles/
    ├── globals.css
    └── tokens.css
```

Exact structure can be simplified during implementation if a smaller
structure is clearer.

------------------------------------------------------------------------

# 24. Environment Variables

Example:

``` env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
```

Rules:

-   Never commit `.env`.
-   Never expose service-role keys to the browser.
-   Public keys may be exposed only when appropriate.
-   Server secrets remain server-side.

------------------------------------------------------------------------

# 25. Error & Empty States

## No portfolio

Display:

``` text
RESULT

More work coming soon.
```

Do not leave a broken carousel.

## Broken thumbnail

Use a neutral fallback.

## Invalid project URL

Admin should see:

``` text
Please enter a valid URL.
```

## Upload failure

Show:

``` text
Upload failed.
Please try again.
```

## Login failure

Do not reveal whether the username exists.

Use:

``` text
Invalid username or password.
```

## Recovery failure

Use a generic response.

------------------------------------------------------------------------

# 26. Content Rules

The website should avoid excessive copy.

The visual hierarchy should communicate most information.

Use:

-   icons
-   numbers
-   short labels
-   price typography
-   estimated-time indicators
-   thumbnails
-   subtle metadata

Instead of long paragraphs.

Example:

``` text
01
VIDEO EDIT

Rp70.000

CUT
COLOR
MOTION

1–3 DAYS
```

This follows the user's preference for understandable information
without filling the interface with text.

------------------------------------------------------------------------

# 27. Acceptance Criteria --- Entire Product

The product is considered complete when:

### Public

-   [ ] Home works.
-   [ ] Navigation works.
-   [ ] Result carousel works.
-   [ ] Portfolio thumbnails are clickable.
-   [ ] External URLs are configurable.
-   [ ] Instagram text is configurable and clickable.
-   [ ] GET opens the 3 packages.
-   [ ] Packages display name, price, description, estimate.
-   [ ] Package CTA prepares the correct DM message.
-   [ ] Instagram destination opens.
-   [ ] DM message can be copied.
-   [ ] Footer is complete.
-   [ ] Mobile UI works.
-   [ ] Desktop UI works.

### Admin

-   [ ] Login works.
-   [ ] Username/password works.
-   [ ] Logout works.
-   [ ] Forgot-password flow works.
-   [ ] Security question works.
-   [ ] Result CRUD works.
-   [ ] Thumbnail upload works.
-   [ ] Result ordering works.
-   [ ] Pricing editing works.
-   [ ] Pricing preview works.
-   [ ] Pricing publish works.
-   [ ] Instagram editing works.

### Design

-   [ ] Reference-inspired visual direction is maintained.
-   [ ] Dark charcoal palette is maintained.
-   [ ] Typography feels editorial.
-   [ ] No excessive cards.
-   [ ] No excessive gradients.
-   [ ] Animations remain subtle.
-   [ ] Mobile is the primary experience.

### Engineering

-   [ ] No secrets in frontend.
-   [ ] Admin routes are protected.
-   [ ] User input is validated.
-   [ ] Images are optimized.
-   [ ] Public pages are performant.
-   [ ] Error states exist.
-   [ ] Production deployment works.

------------------------------------------------------------------------

# 28. Future Version Ideas

Not required for V1, but architecture should not block:

-   WhatsApp ordering.
-   Direct booking form.
-   Customer order dashboard.
-   Automatic invoice.
-   Payment gateway.
-   Project status tracking.
-   Customer reviews.
-   More than 3 packages.
-   Video preview instead of thumbnail.
-   Analytics.
-   Contact form.
-   Email notifications.
-   Admin activity log.

------------------------------------------------------------------------

# 29. Final Product Principle

The website should feel like:

> **A personal creative portfolio that happens to sell a service, not a
> generic service marketplace.**

The portfolio and visual identity come first.

The ordering process should be extremely short:

``` text
SEE
→
LIKE
→
CHOOSE
→
DM
```

The design should prioritize the uploaded visual references: dark,
minimal, editorial, spacious, premium, and typography-driven, while
remaining practical and easy to use for students on mobile.
