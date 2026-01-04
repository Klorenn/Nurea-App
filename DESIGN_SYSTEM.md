# NUREA Design System & Implementation Guide

## Brand Identity

**Brand Name:** NUREA  
**Domain:** nurea.app

### Brand Values
- Trust
- Calm
- Human care
- Professionalism
- Accessibility

### Visual Style
- **Style:** Minimalist, Premium HealthTech
- **Feeling:** Warm and human
- **Color Palette:** Autumn-inspired
  - **Terracotta** (Primary): `oklch(0.55 0.12 35)` - Warm earthy orange
  - **Olive Green** (Secondary): `oklch(0.48 0.08 140)` - Natural and calming
  - **Beige** (Muted/Accent): Soft warm beige tones
  - **Soft Brown** (Foreground): Warm dark brown for text
- **Modes:** Light mode + Dark mode support
- **Typography:** Clean, accessible (Geist font family)
- **Approach:** Mobile-first, high accessibility contrast

## Design System Components

### Color System
All colors are defined in `app/globals.css` using OKLCH color space for better perceptual uniformity.

**Light Mode:**
- Background: Warm off-white with beige undertone
- Primary: Terracotta
- Secondary: Olive green
- Muted: Soft beige
- Borders: Soft beige borders

**Dark Mode:**
- Background: Dark warm brown
- Primary: Brighter terracotta
- Secondary: Brighter olive green
- All colors adjusted for dark mode visibility

### Typography
- **Font Family:** Geist (sans-serif), Lora (serif for headings)
- **Scale:** Responsive typography with proper line heights
- **Accessibility:** High contrast ratios for readability

### Component Library
Located in `components/ui/`:
- Button (multiple variants)
- Card
- Dialog/Modal
- Input
- Select
- Calendar
- Badge
- Avatar
- Tabs
- Scroll Area
- And more...

All components follow the autumn color palette and design guidelines.

## Multi-Language Support

### Languages
- **Spanish (es)** - Default
- **English (en)**

### Implementation
- Language context: `contexts/language-context.tsx`
- Translations: `lib/i18n.ts`
- Language selector in navbar and footer
- All user-facing text is translatable

## User Roles & Experiences

### 1. Patient Experience

#### Landing Page (`app/page.tsx`)
- Hero section with search
- How it works section
- Features/benefits
- Testimonials
- Pricing plans
- Referral system
- CTA sections
- Footer with language selector

#### Patient Dashboard (`app/dashboard/page.tsx`)
- Welcome card with appointment summary
- Health summary card
- Upcoming appointments
- Favorite professionals
- Quick actions

#### Appointments (`app/dashboard/appointments/page.tsx`)
- Tabbed view (Upcoming, Completed, Cancelled)
- Appointment cards with details
- Review submission for completed appointments
- Document history

#### Chat (`app/dashboard/chat/page.tsx`)
- Contact list sidebar
- Message interface
- Online/offline status
- Message bubbles
- Timestamps
- File attachment support

#### Search (`app/search/page.tsx`)
- Advanced filters (specialty, location, consultation type, price, language)
- Professional cards with ratings
- Sort options
- Map view option

#### Professional Profile (`app/professionals/[id]/page.tsx`)
- Hero section with professional info
- Tabs (About, Reviews, Location)
- Booking card
- Availability calendar
- Map embed for clinic location

### 2. Professional Experience

#### Professional Dashboard (`app/professional/dashboard/page.tsx`)
- Stats overview (consultations, patients, rating, earnings)
- Calendar view
- Today's appointments
- Recent reviews
- Profile completion status

#### Profile Customization (`app/professional/profile/edit/page.tsx`)
- Basic info (photo, name, bio)
- Specialties & languages
- Services & pricing
- Availability calendar
- Payment settings (bank transfer info)

#### Messages (`app/professional/messages/page.tsx`)
- Chat interface for patient communication

#### Reviews (`app/professional/reviews/page.tsx`)
- Review management interface

### 3. Admin Experience

#### Admin Dashboard (`app/admin/page.tsx`)
- User management
- Professional approval workflow
- Review moderation
- Platform settings
- Country & language configuration
- Subscription overview

## Authentication Screens

### Login (`app/login/page.tsx`)
- Clean, calm UI
- Email/password form
- Social login options
- Forgot password link
- Sign up link

### Signup (`app/signup/page.tsx`)
- Role selection (Patient/Professional)
- Registration form
- Terms acceptance
- Email verification flow

### Forgot Password (`app/forgot-password/page.tsx`)
- Email input
- Reset link sent confirmation
- Back to login

### Email Verification (`app/verify-email/page.tsx`)
- Verification instructions
- Resend option
- Continue to login

## Booking Flow

### Booking Modal (`components/booking-modal.tsx`)
Multi-step booking process:
1. Select consultation type (Online/In-person)
2. Select date & time
3. Payment method selection
4. Confirmation screen

Features:
- Progress indicator
- Calendar integration
- Time slot selection
- Payment options (Card, Bank Transfer)

## Payment System

### Payment Page (`app/payment/page.tsx`)
- Card payment form
- Bank transfer option
- Order summary
- Payment confirmation
- Error handling states

## Reviews System

### Review Modal (`components/review-modal.tsx`)
- Star rating (1-5)
- Optional comment field
- Success confirmation
- Error handling
- Only available after completed appointment

## Chat System

### Features
- 1-on-1 messaging
- Enabled only after appointment exists
- Message bubbles (sent/received)
- Timestamps
- Online/offline status
- Notification badges
- Dark mode support
- File attachment support

## Appointments Management

### Features
- Calendar view
- Appointment status (Scheduled, Completed, Cancelled)
- Appointment details view
- Date & time display
- Type (Online/Presential)
- Address or meeting link
- Chat access
- Reschedule option
- Cancel option

## Map & Location

### Map Embed (`components/map-embed.tsx`)
- Embedded map in professional profile
- Shows clinic location
- Clean, minimal map style

## Subscription Plans

### Pricing (`components/pricing.tsx`)
- **Standard:** $25 USD/month
- **Recent Graduate:** $15 USD/month (special pricing)
- Feature comparison
- Referral program explanation

### Referral System
- Refer a professional → 1 month free
- Referral link generation
- Unlimited referrals

## Design Patterns

### Cards
- Rounded corners (rounded-xl, rounded-2xl, rounded-[2.5rem])
- Soft shadows
- Border colors: `border-border/40`
- Hover effects: `hover:shadow-md`

### Buttons
- Primary: Terracotta background
- Secondary: Olive green
- Outline: Transparent with border
- Rounded: `rounded-xl` or `rounded-full`
- Font weight: Bold for primary actions

### Forms
- Inputs: `bg-accent/20` background
- Rounded: `rounded-xl`
- No borders (border-none)
- Focus rings: Primary color

### Modals/Dialogs
- Large rounded corners: `rounded-[2.5rem]`
- Shadow: `shadow-2xl`
- Header with primary color background
- Content padding: `p-8`

### Spacing
- Consistent spacing scale
- Section padding: `py-24 px-4` or `py-24 px-6`
- Card padding: `p-6` or `p-8`
- Gap spacing: `gap-4`, `gap-6`, `gap-8`

## Accessibility

### Contrast
- High contrast ratios for text
- Color combinations tested for accessibility
- Focus indicators visible

### Keyboard Navigation
- All interactive elements keyboard accessible
- Focus management in modals
- Skip links where appropriate

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images

## Mobile-First Design

### Breakpoints
- Mobile: Default
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

### Responsive Patterns
- Grid layouts adapt to screen size
- Navigation collapses on mobile
- Cards stack on mobile
- Touch-friendly button sizes (min 44x44px)

## Implementation Status

### ✅ Completed
- Design system with autumn palette
- Multi-language support (ES/EN)
- Landing page with all sections
- Authentication screens
- Patient dashboard
- Professional dashboard
- Booking flow
- Payment system
- Reviews system
- Chat system
- Appointments management
- Search & filters
- Professional profiles
- Admin dashboard
- Profile customization

### 🔄 In Progress
- Enhanced i18n for all screens
- Additional component refinements

### 📝 Notes
- All components follow the design system
- Consistent spacing and typography
- Dark mode fully supported
- Mobile-responsive throughout

## File Structure

```
app/
  ├── page.tsx (Landing)
  ├── login/
  ├── signup/
  ├── forgot-password/
  ├── verify-email/
  ├── dashboard/ (Patient)
  │   ├── page.tsx
  │   ├── appointments/
  │   └── chat/
  ├── professional/ (Professional)
  │   ├── dashboard/
  │   ├── messages/
  │   ├── profile/edit/
  │   └── reviews/
  ├── professionals/[id]/ (Public profile)
  ├── search/
  ├── payment/
  └── admin/

components/
  ├── ui/ (Design system components)
  ├── navbar.tsx
  ├── footer.tsx
  ├── hero-section.tsx
  ├── booking-modal.tsx
  ├── review-modal.tsx
  └── dashboard-layout.tsx

lib/
  └── i18n.ts (Translations)

contexts/
  └── language-context.tsx
```

## Next Steps

1. Connect to backend API
2. Implement real authentication
3. Add payment gateway integration
4. Implement real-time chat
5. Add calendar integration
6. Implement file uploads
7. Add analytics
8. Performance optimization
9. SEO optimization
10. Testing (unit, integration, e2e)

