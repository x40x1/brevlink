# Brevlink

A modern, secure URL shortener built with Next.js, Prisma, and TypeScript.

## Features

- URL shortening with custom slugs
- Click tracking and analytics
- User authentication with JWT
- TOTP 2FA support
- Modern UI with shadcn/ui components
- Dark mode support
- Fully responsive design

## Tech Stack

- Next.js 15
- TypeScript
- Prisma (SQLite/PostgreSQL)
- Tailwind CSS
- shadcn/ui components
- JWT authentication
- TOTP 2FA

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/x40x1/brevlink.git
cd brevlink
```

2. Install dependencies
```bash
pnpm install
```

3. Set up your environment variables
```bash
cp .env.example .env
```
Update the `.env` file with your configuration.

4. Initialize the database
```bash
pnpx prisma db push
```

5. Run the development server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Secret key for JWT tokens

## License

MIT License - see LICENSE file for details
