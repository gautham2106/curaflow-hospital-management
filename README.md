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
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up database**
   - Go to your Supabase Dashboard
   - Open SQL Editor
   - Run `FINAL-COMPLETE-SQL.sql`
   - Run `SUPERADMIN-SYSTEM.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Main app: `http://localhost:3000`
   - Superadmin: `http://localhost:3000/superadmin/dashboard`

## 🔐 Security

### Default Credentials
- **Superadmin**: `superadmin` / `superadmin123` (change immediately!)
- **Demo Clinic 1**: `admin` / `1234`
- **Demo Clinic 2**: `sunrise-admin` / `5678`

### Security Features
- ✅ **No hardcoded credentials** in code
- ✅ **Environment variables** for all configuration
- ✅ **Token-based authentication** with expiry
- ✅ **Row Level Security** for data isolation
- ✅ **Input validation** on all forms
- ✅ **Audit trail** for all operations

## 📊 System Architecture

### Database Schema
- **clinics** - Multi-tenant clinic management
- **doctors** - Doctor profiles and schedules
- **patients** - Patient records and history
- **visits** - Appointment and visit tracking
- **queue** - Real-time queue management
- **sessions** - Time-based session management
- **superadmins** - System administration

### API Endpoints
- **Authentication**: `/api/auth/login`
- **Clinic Management**: `/api/superadmin/clinics`
- **Doctor Management**: `/api/doctors`
- **Patient Management**: `/api/patients`
- **Queue Management**: `/api/queue`
- **Visit Tracking**: `/api/visits`

## 🎯 Usage

### For Superadmins
1. **Login** to superadmin dashboard
2. **Create clinics** with admin credentials
3. **Monitor system** performance and usage
4. **Manage clinics** (edit, deactivate)

### For Clinic Admins
1. **Login** with clinic credentials
2. **Manage doctors** and schedules
3. **Handle patient** registrations
4. **Monitor queue** and visits
5. **Generate reports** and analytics

## 🔧 Configuration

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Database Functions
- `authenticate_clinic()` - Dynamic clinic authentication
- `create_clinic_with_admin()` - New clinic creation
- `get_clinic_stats()` - Usage statistics
- `get_full_queue()` - Queue management
- `end_session_with_tracking()` - Session analytics

## 📈 Monitoring

### System Statistics
- **Total clinics** and active/inactive status
- **Total doctors** across all clinics
- **Total patients** and visit counts
- **Real-time queue** monitoring
- **Performance metrics** and usage

### Audit Trail
- **All superadmin actions** logged
- **Clinic creation** and modifications tracked
- **Session management** with timestamps
- **Security events** monitored

## 🚀 Deployment

### Production Deployment
1. **Set up production database** (Supabase)
2. **Configure environment variables**
3. **Deploy to Vercel/Netlify/Docker**
4. **Set up monitoring** and backups
5. **Configure domain** and SSL

### Security Checklist
- [ ] Change default superadmin password
- [ ] Use strong passwords for all accounts
- [ ] Enable HTTPS in production
- [ ] Set up regular backups
- [ ] Monitor access logs
- [ ] Update dependencies regularly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Follow security guidelines
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Setup Guide](SECURE-DEPLOYMENT-GUIDE.md)
- [Security Guide](GITHUB-SECURITY-GUIDE.md)
- [API Documentation](docs/api.md)

### Issues
- Report bugs via GitHub Issues
- Request features via GitHub Discussions
- Security issues: contact directly

## 🎉 Acknowledgments

- Built with Next.js and React
- Powered by Supabase
- AI capabilities via Google Gemini
- UI components from Radix UI
- Styled with Tailwind CSS

---

**CuraFlow - Modern Hospital Management Made Simple** 🏥✨