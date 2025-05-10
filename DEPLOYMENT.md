# Deployment Guide

This guide covers deploying Brevlink to various platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Vercel Deployment](#vercel-deployment)
  - [Railway Deployment](#railway-deployment)
  - [Manual Deployment](#manual-deployment)

## Prerequisites

Before deploying, ensure you have:
1. Node.js 18+ installed
2. pnpm package manager installed
3. A PostgreSQL database (for production)
4. Git installed

## Environment Variables

Required environment variables:
```env
# Database connection string (PostgreSQL recommended for production)
DATABASE_URL="postgresql://username:password@localhost:5432/brevlink"

# JWT secret for authentication
JWT_SECRET="your-secure-secret-here"
```

## Deployment Options

### Docker Deployment

1. Build and run using Docker Compose:
```bash
# Clone the repository
git clone https://github.com/x40x1/brevlink.git
cd brevlink

# Create .env file
cp .env.example .env
# Edit .env with your production values

# Start the application
docker-compose -f deploy/docker-compose.yml up -d
```

The application will be available at http://localhost:3000

### Vercel Deployment

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your forked repository
4. Add environment variables in Vercel's dashboard
5. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/x40x1/brevlink)

### Railway Deployment

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL plugin
4. Add environment variables
5. Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/x40x1/brevlink)

### Manual Deployment

1. Prepare your server:
```bash
# Install Node.js and pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Clone the repository
git clone https://github.com/x40x1/brevlink.git
cd brevlink

# Install dependencies
pnpm install

# Build the application
pnpm build

# Start the production server
pnpm start
```

2. Use a process manager (PM2):
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "brevlink" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

3. Setup Nginx as a reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migration

Run database migrations in production:
```bash
pnpm prisma db push
# or
pnpm prisma migrate deploy # if using migrations
```

## SSL/TLS Configuration

For production, always use HTTPS. You can use Let's Encrypt with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring

Setup monitoring using PM2:
```bash
pm2 monit
```

## Backup

Regular database backups are recommended:
```bash
# For PostgreSQL
pg_dump -U postgres brevlink > backup.sql
```

## Troubleshooting

Common issues and solutions:

1. Database connection issues:
   - Check DATABASE_URL format
   - Verify database credentials
   - Check network/firewall settings

2. Build failures:
   - Clear .next directory
   - Remove node_modules and reinstall
   - Check Node.js version compatibility

3. Runtime errors:
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Check disk space and memory usage
