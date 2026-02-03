# Deployment Guide

## การ Deploy ระบบ Restaurant HRM

### 1. Deploy บน Vercel (แนะนำ)

Vercel เป็น platform ที่สร้างโดยทีม Next.js เหมาะสำหรับ deploy Next.js apps

#### ขั้นตอน:

1. **สร้าง Account ที่ [vercel.com](https://vercel.com)**

2. **Install Vercel CLI (Optional)**
\`\`\`bash
npm install -g vercel
\`\`\`

3. **Deploy ผ่าน Vercel Dashboard:**
   - เข้า Vercel Dashboard
   - คลิก "New Project"
   - Import repository จาก GitHub/GitLab/Bitbucket
   - Vercel จะ detect Next.js อัตโนมัติ
   - คลิก "Deploy"

4. **หรือ Deploy ผ่าน CLI:**
\`\`\`bash
cd restaurant-hrm
vercel
\`\`\`

5. **ตั้งค่า Environment Variables:**
   - ไปที่ Project Settings > Environment Variables
   - เพิ่ม variables ที่จำเป็น:
     - DATABASE_URL
     - NEXTAUTH_SECRET
     - NEXTAUTH_URL

6. **Custom Domain (Optional):**
   - ไปที่ Project Settings > Domains
   - เพิ่ม custom domain ของคุณ

### 2. Deploy บน Netlify

#### ขั้นตอน:

1. สร้างไฟล์ `netlify.toml`:
\`\`\`toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
\`\`\`

2. เชื่อมต่อ repository กับ Netlify
3. ตั้งค่า Environment Variables
4. Deploy

### 3. Deploy บน Railway

Railway รองรับ database และ backend services

#### ขั้นตอน:

1. สร้าง account ที่ [railway.app](https://railway.app)
2. New Project > Deploy from GitHub repo
3. เพิ่ม PostgreSQL Database (คลิก New > Database > PostgreSQL)
4. เชื่อมต่อ DATABASE_URL
5. Deploy

### 4. Deploy บน AWS (Advanced)

#### ใช้ AWS Amplify:

1. ติดตั้ง Amplify CLI:
\`\`\`bash
npm install -g @aws-amplify/cli
amplify configure
\`\`\`

2. Initialize project:
\`\`\`bash
amplify init
amplify add hosting
amplify publish
\`\`\`

#### ใช้ ECS/Fargate:

1. สร้าง Dockerfile:
\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

2. Build และ Push Docker image:
\`\`\`bash
docker build -t restaurant-hrm .
docker tag restaurant-hrm:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
\`\`\`

3. สร้าง ECS Service และ Task Definition

### 5. Deploy บน DigitalOcean

#### ใช้ App Platform:

1. เข้า DigitalOcean Console
2. Create > Apps
3. เลือก GitHub repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
5. เพิ่ม Environment Variables
6. Deploy

#### ใช้ Droplet (VPS):

\`\`\`bash
# SSH เข้า Droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone repository
git clone YOUR_REPO_URL
cd restaurant-hrm

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "restaurant-hrm" -- start
pm2 save
pm2 startup
\`\`\`

### 6. Database Options

#### Vercel Postgres
\`\`\`bash
npm i @vercel/postgres
\`\`\`

#### Supabase (แนะนำ)
- Free tier ใจกว้าง
- PostgreSQL database
- Real-time subscriptions
- Built-in authentication
- Storage

#### PlanetScale
- MySQL database
- Branching like Git
- Automatic backups

#### MongoDB Atlas
- NoSQL database
- Free tier 512 MB

### 7. Environment Variables ที่จำเป็น

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
NEXTAUTH_SECRET="generate-random-secret"
NEXTAUTH_URL="https://your-domain.com"

# Optional
NEXT_PUBLIC_APP_URL="https://your-domain.com"
\`\`\`

### 8. Performance Optimization

#### Next.js Config:
\`\`\`javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // Output standalone for Docker
  output: 'standalone',
}
\`\`\`

### 9. Pre-deployment Checklist

- [ ] ทดสอบ build locally: `npm run build`
- [ ] ตรวจสอบ Environment Variables
- [ ] Setup Database และ run migrations
- [ ] ตั้งค่า CORS (ถ้าจำเป็น)
- [ ] Setup Error Monitoring (Sentry)
- [ ] Setup Analytics (Google Analytics)
- [ ] Configure Custom Domain
- [ ] Setup SSL Certificate
- [ ] Test production build
- [ ] Setup Backups
- [ ] Configure CDN (ถ้าจำเป็น)

### 10. Post-deployment

#### Monitoring:
- Vercel Analytics
- Google Analytics
- Sentry (Error tracking)

#### CI/CD:
- Setup GitHub Actions สำหรับ auto-deploy
- Automated testing
- Preview deployments

#### Example GitHub Actions:
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
\`\`\`

### 11. Backup Strategy

1. **Database Backups:**
   - Automated daily backups
   - Test restore procedures

2. **Code Backups:**
   - Git repository (GitHub/GitLab)
   - Multiple branches

3. **Asset Backups:**
   - Images, uploads
   - Use cloud storage (S3, Cloudinary)

### 12. Security Best Practices

- ใช้ HTTPS เสมอ
- ตั้งค่า CORS อย่างถูกต้อง
- Sanitize user inputs
- Rate limiting
- Regular security updates
- Environment variables management
- Database connection pooling
- SQL injection prevention

## สรุป

เลือก platform ตามความต้องการ:
- **Vercel**: ง่ายที่สุด, เหมาะกับ Next.js
- **Railway**: รวม database, เหมาะกับ full-stack
- **DigitalOcean**: Flexible, ราคาคุ้มค่า
- **AWS**: Enterprise-grade, scalable

สำหรับเริ่มต้น แนะนำ **Vercel + Supabase** เพราะ:
- ✅ Setup ง่าย
- ✅ Free tier ใจกว้าง
- ✅ Performance ดี
- ✅ Built-in features ครบ
