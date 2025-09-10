# Sea Street Detailing

Professional auto detailing services booking website built with Next.js.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **SEO**: Next-SEO

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