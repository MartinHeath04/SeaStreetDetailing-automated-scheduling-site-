# Sea Street Detailing

Professional auto detailing services booking platform with automated scheduling, payment processing, and customer communication.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State Management**: SWR/React Query
- **SEO**: Next-SEO

### Backend & Database
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Development**: SQLite3

### Integrations
- **Payments**: Stripe Payment Processing
- **SMS**: Twilio for notifications and reminders
- **Calendar**: Google Calendar API integration
- **Deployment**: Vercel

## Features

- **🗓️ Automated Booking System**: Real-time availability checking with conflict prevention
- **💳 Payment Processing**: Secure deposit and full payment handling via Stripe
- **📱 SMS Notifications**: Automated confirmation, reminders, and rescheduling via Twilio
- **📅 Calendar Integration**: Syncs bookings with Google Calendar for scheduling management
- **👨‍💼 Admin Dashboard**: Complete booking management, analytics, and blackout scheduling
- **📊 Business Analytics**: Revenue tracking, service utilization, and performance metrics
- **🎨 Responsive Design**: Mobile-first approach optimized for all device sizes
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── services/       # Services & pricing page
│   ├── gallery/        # Photo gallery
│   ├── reviews/        # Customer reviews
│   ├── book/           # Booking flow
│   ├── contact/        # Contact form & FAQ
│   ├── admin/          # Admin dashboard
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── layout/        # Layout components (Header, Footer)
│   ├── booking/       # Booking wizard components
│   └── admin/         # Admin dashboard components
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

See the `/docs` folder for detailed product requirements and implementation guides.