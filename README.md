# CuraFlow - Hospital Management System

A comprehensive hospital and clinic management system built with Next.js, Supabase, and AI integration.

## 🚀 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/curaflow)

## ✨ Features

- **Patient Management** - Complete patient database with family relationships
- **Appointment Scheduling** - Token-based appointment system
- **Real-time Queue Management** - Live queue with call/skip functionality
- **Doctor Management** - Doctor profiles, schedules, and availability
- **Live Display** - Real-time waiting room display
- **AI Integration** - Intelligent queue prioritization and reasoning
- **Multi-tenant Support** - Support for multiple clinics
- **Print Integration** - Token printing with Bluetooth support
- **WhatsApp Integration** - Appointment confirmations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI**: Radix UI, Tailwind CSS
- **AI**: Google Gemini via Genkit
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/curaflow.git
cd curaflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema-fixed-uuid.sql` in your Supabase SQL Editor
3. Get your Supabase URL and API keys

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:9002`

## 🌐 Deploy to Vercel

### Option 1: Deploy Button (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/curaflow)

### Option 2: Manual Deployment

1. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/curaflow.git
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

## 🔐 Default Login Credentials

- **CuraFlow Central Hospital**: `admin` / `1234`
- **Sunrise Medical Clinic**: `sunrise-admin` / `5678`

## 📊 Database Schema

The system includes the following main tables:
- `clinics` - Hospital/clinic information
- `doctors` - Doctor profiles and schedules
- `patients` - Patient records
- `visits` - Appointment records
- `queue` - Real-time queue management
- `sessions` - Time-based sessions
- `departments` - Clinic departments
- `ad_resources` - Display content

## 🤖 AI Features

- **Intelligent Queue Prioritization** - AI analyzes symptoms to prioritize patients
- **Queue Extension Reasoning** - AI helps receptionists choose appropriate responses
- **Smart Queue Management** - Automated queue optimization

## 🔧 Configuration

### Supabase Setup

1. Run the SQL schema in your Supabase dashboard
2. Enable Row Level Security (RLS)
3. Configure authentication policies

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## 📱 Features Overview

### Dashboard
- Real-time statistics
- Quick actions
- Recent activity

### Patient Management
- Patient registration
- Family relationships
- Visit history
- Search functionality

### Queue Management
- Real-time queue display
- Call/skip patients
- Priority management
- AI-powered prioritization

### Doctor Management
- Doctor profiles
- Schedule management
- Availability status
- Specialty management

### Live Display
- Waiting room display
- Real-time updates
- Advertisement support
- Multi-screen support

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Compatible with Next.js
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@curaflow.com or create an issue on GitHub.

---

**Built with ❤️ for healthcare professionals**