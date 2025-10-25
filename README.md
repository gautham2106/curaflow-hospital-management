# 🏥 CuraFlow Hospital Management System

A comprehensive, multi-tenant hospital management system built with Next.js 15, React 18, TypeScript, and Supabase.

## ✨ Features

### 🏢 **Multi-Tenant Architecture**
- **Unlimited clinics** supported
- **Complete data isolation** between clinics
- **Dynamic authentication** system
- **Scalable infrastructure**

### 👨‍⚕️ **Core Functionality**
- **Doctor Management** - Add, edit, and manage doctors
- **Patient Database** - Comprehensive patient records
- **Appointment Scheduling** - Token-based system
- **Queue Management** - Real-time queue with AI prioritization
- **Session Management** - Morning, Afternoon, Evening sessions
- **Visit Tracking** - Complete visit lifecycle management

### 🤖 **AI Integration**
- **Intelligent Queue Prioritization** - AI-powered patient prioritization
- **Queue Extension Reasoning** - AI suggestions for visit extensions
- **Google Gemini Integration** - Advanced AI capabilities

### 🔐 **Superadmin System**
- **Complete clinic management** - Create, edit, deactivate clinics
- **System-wide statistics** - Monitor all clinics
- **Secure authentication** - Token-based sessions
- **Audit trail** - Complete operation logging

### 📱 **Modern UI/UX**
- **Responsive design** - Works on all devices
- **Real-time updates** - Live queue and status updates
- **Cross-page synchronization** - Updates across browser tabs
- **Beautiful interface** - Modern, professional design

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini via Genkit
- **UI**: Radix UI, Tailwind CSS
- **Authentication**: Custom token-based system
- **Database**: PostgreSQL with Row Level Security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/curaflow.git
   cd curaflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_ID=your_phone_id
   ```

4. **Set up the database**
   - Run the SQL scripts in your Supabase dashboard:
     - `COMPLETE-SUPABASE-SETUP.sql`
     - `ATOMIC-TOKEN-GENERATION.sql`
     - `QUICK-SECURITY-FIXES.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Login Credentials

### Superadmin Access
- **URL**: `/superadmin`
- **Username**: `superadmin`
- **Password**: `superadmin123`

### Clinic Access
- **URL**: `/login`
- **Username**: `admin` (for default clinic)
- **PIN**: `1234`

## 📊 System Status

- ✅ **Production Ready**: 98% Complete
- ✅ **Security Hardened**: Bcrypt, rate limiting, audit logging
- ✅ **Multi-tenant**: Unlimited clinics supported
- ✅ **Real-time**: Live queue and display updates
- ✅ **Mobile Optimized**: Responsive design
- ✅ **WhatsApp Integration**: Appointment notifications
- ✅ **Thermal Printing**: Token printing support

## 🏗️ Architecture

### Database Schema
- **clinics**: Multi-tenant clinic data
- **doctors**: Doctor profiles and availability
- **patients**: Patient records and history
- **visits**: Appointment and visit tracking
- **queue**: Real-time queue management
- **sessions**: Time slot configurations
- **ad_resources**: Promotional content
- **audit_logs**: Security and operation tracking

### API Endpoints
- `/api/auth/login` - Clinic authentication
- `/api/superadmin/*` - Superadmin operations
- `/api/tokens` - Token generation
- `/api/queue/*` - Queue management
- `/api/notifications/whatsapp` - WhatsApp integration
- `/api/ad-resources/*` - Ad management

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── (display)/         # TV display pages
│   ├── superadmin/        # Superadmin pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
└── services/              # External service integrations
```

### Key Features Implemented
- ✅ **Token Generation**: Sequential, atomic token numbering
- ✅ **Queue Management**: Real-time status updates
- ✅ **Mobile Display**: QR code tracking
- ✅ **WhatsApp Notifications**: Appointment confirmations
- ✅ **Ad Management**: Supabase Storage integration
- ✅ **Security**: Comprehensive security measures
- ✅ **Session Management**: Automatic session transitions

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_ID=
VERCEL_URL=
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for healthcare professionals**