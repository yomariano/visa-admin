# Visa Admin Panel

A secure admin interface for managing visa permit rules and required documents with Google OAuth authentication.

## 🔐 Features

- **Google OAuth Authentication** via Supabase
- **Email-based Access Control** using environment variables
- **Complete CRUD Operations** for permit rules and required documents
- **Real-time Toast Notifications** for all actions
- **Responsive Design** with modern UI components
- **PostgreSQL Database Integration** with direct queries

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/yomariano/visa-admin.git
cd visa-admin
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your values:

```bash
cp env-template.txt .env.local
```

Update `.env.local` with your actual configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-coolify-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Admin Emails (comma-separated)
ADMIN_EMAILS=your-email@gmail.com,colleague1@gmail.com,colleague2@gmail.com

# Database Connection (already configured)
DATABASE_URL=postgresql://postgres:7s4LImqKDuWEdMQmbArzk1Ws3Mc7c62t@thecodejesters.xyz:5433/postgres
```

### 3. Configure Supabase OAuth

In your Supabase dashboard, add these redirect URLs:

- **Development**: `http://localhost:3000/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the admin panel.

## 👥 Managing Admin Access

### Adding New Admins

Simply update your `.env.local` file:

```env
ADMIN_EMAILS=john@company.com,jane@company.com,admin@company.com,newperson@company.com
```

Restart the application for changes to take effect.

### Email Format

- **Comma-separated**: `email1@domain.com,email2@domain.com`
- **Case insensitive**: System automatically converts to lowercase
- **Whitespace tolerant**: Spaces around emails are automatically trimmed

### Security Notes

- Emails are stored as environment variables (server-side only)
- OAuth authentication ensures email verification
- Unauthorized users see a clear "Access Denied" message
- No database storage of user permissions needed

## 📊 Database Tables

### permit_rules
- `id`, `permit_type`, `title`, `rule`, `category`, `is_required`, `updated_at`

### required_documents  
- `id`, `permit_type`, `document_name`, `required_for`, `is_mandatory`, `condition`, `description`, `sort_order`, `is_active`, `validation_rules`, `updated_at`

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL (direct connection)
- **UI**: Tailwind CSS + shadcn/ui
- **Notifications**: react-hot-toast

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `ADMIN_EMAILS` | Comma-separated admin emails | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |

## 🚀 Deployment

1. Set environment variables in your hosting platform
2. Configure OAuth redirect URLs for your domain
3. Deploy using your preferred platform (Vercel, Netlify, etc.)

## 📞 Support

For access requests or technical issues, contact the system administrator.
