# 🔄 Workflow Automation System

A complete workflow automation system similar to Zapier/n8n with Corporate Blue Theme, featuring approval workflows and professional enterprise-ready interface.

## 🚀 Features

### Core Functionality
- **📋 Workflow Designer** - Create and manage workflows with approval steps
- **▶️ Execution Engine** - Run and monitor workflow executions
- **✅ Approval System** - Manager and Finance approval workflows with role switching
- **🕐 Real-time Status** - Track workflow progress with color-coded statuses
- **🎨 Corporate UI** - Professional enterprise-ready interface

### Workflow Capabilities
- **Multi-step Workflows** - Complex approval chains
- **Conditional Logic** - Rule-based decision making
- **Approval Routing** - Manager → Finance approval flow
- **Status Tracking** - Pending, In Progress, Completed, Failed, Canceled
- **Retry Mechanism** - Handle failed executions
- **Audit Trail** - Complete activity logging

## 🛠 Tech Stack

### Backend
- **Node.js & Express.js** - RESTful API server
- **JSON-based Storage** - Simple, reliable data persistence
- **Workflow Engine** - Custom execution engine
- **Health Monitoring** - Production-ready health checks

### Frontend  
- **React 18** - Modern component-based UI
- **Ant Design** - Enterprise UI components
- **React Router** - Client-side routing
- **Axios** - API communication
- **Corporate Blue Theme** - Professional design system

## 🎨 Design System

### Corporate Blue Theme
- **Primary**: `#1E3A8A` (Deep Blue) - Sidebar & primary actions
- **Secondary**: `#3B82F6` (Bright Blue) - Active states & hover effects
- **Background**: `#F9FAFB` (Light Gray) - Main content area
- **Cards**: `#FFFFFF` (White) - Content containers
- **Text**: `#111827` (Dark Gray) - Primary text color
- **Success**: `#10B981` (Green) - Completed states
- **Error**: `#EF4444` (Red) - Failed/canceled states

### Design Principles
- **60-30-10 Rule** - Balanced color distribution
- **Clean UI** - Minimal, distraction-free interface
- **Consistent States** - Predictable status colors
- **Subtle Effects** - Professional transitions and shadows
- **Enterprise Ready** - Perfect for corporate environments

## 📦 Deployment Options

### 🐳 Docker (Recommended)
```bash
# Quick deployment
./deploy.sh          # Linux/Mac
deploy.bat           # Windows

# Manual deployment
docker-compose up -d --build
```

### ☁️ Vercel (Frontend)
```bash
npm i -g vercel
cd frontend
vercel --prod
```

### 🌐 Netlify (Frontend)
```bash
cd frontend
npm run build
# Upload build folder to Netlify
```

### 🚂 Railway (Full Stack)
```bash
npm i -g @railway/cli
railway login
railway up
```

### 🖥️ Traditional VPS
```bash
# Install dependencies
npm run install-all

# Build frontend
cd frontend && npm run build

# Start backend with PM2
cd ../backend && pm2 start server.js
```

## 📁 Project Structure

```
Halleyx-Project/
├── 📁 backend/
│   ├── 📁 data/              # JSON data storage
│   ├── 📁 routes/            # API endpoints
│   ├── 📁 services/          # Business logic
│   ├── 📁 models/            # Data models
│   ├── 📁 scripts/           # Utility scripts
│   ├── 📄 server.js          # Main server file
│   └── 🐳 Dockerfile        # Backend container
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 services/      # API services
│   │   ├── 📄 App.js         # Main app component
│   │   └── 🎨 App.css        # Corporate theme styles
│   ├── 📁 public/            # Static assets
│   ├── 📄 package.json       # Frontend dependencies
│   └── 🐳 Dockerfile        # Frontend container
├── 📄 docker-compose.yml     # Multi-container setup
├── 📄 vercel.json          # Vercel configuration
├── 📄 netlify.toml         # Netlify configuration
├── 📄 deploy.sh/.bat       # Deployment scripts
└── 📄 .gitignore          # Git exclusions
```

## 📊 API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Executions
- `GET /api/executions` - List all executions
- `POST /api/executions` - Start new execution
- `POST /api/executions/:id/cancel` - Cancel execution
- `POST /api/executions/:id/retry` - Retry failed execution

### Approvals
- `GET /api/approvals/pending/:userId` - Get pending approvals
- `POST /api/approvals/approve/:executionId` - Approve execution
- `POST /api/approvals/reject/:executionId` - Reject execution

### Health
- `GET /api/health` - System health check

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd Halleyx-Project
npm run install-all
```

### 2. Development
```bash
npm run dev
```

### 3. Production Deployment
```bash
# Choose your deployment method:
./deploy.sh          # Docker
vercel --prod        # Vercel
netlify deploy       # Netlify
railway up           # Railway
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🎯 Usage Examples

### Create Approval Workflow
1. Go to **Workflows** → **Create Workflow**
2. Add steps: Submit → Manager Review → Finance Approval
3. Configure approval assignees
4. Save and activate workflow

### Execute Workflow
1. Go to **Execute Workflow**
2. Select workflow and fill form data
3. Click **Execute**
4. Monitor progress in **Execution Logs**

### Review Approvals
1. Go to **Approvals** dashboard
2. Switch between **Manager** and **Finance** roles
3. Review pending requests
4. **Approve** or **Reject** with comments

## 🔒 Security Features

- **Input Validation** - Joi schema validation
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP security headers
- **Environment Variables** - Secure configuration

## 📈 Production Optimizations

### Frontend
- **Code Splitting** - Optimized bundle size (411KB gzipped)
- **Tree Shaking** - Dead code elimination
- **Minification** - Production build optimization
- **Caching** - Static asset optimization

### Backend
- **Health Checks** - Production monitoring
- **Error Handling** - Comprehensive error management
- **Logging** - Request/response tracking
- **Graceful Shutdown** - Clean process termination

## 🔄 CI/CD Ready

### GitHub Actions Compatible
- Automated testing
- Multi-environment deployment
- Rollback capabilities
- Health monitoring

### Environment Templates
- Development, staging, production configs
- Environment-specific variables
- Secure secret management

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch
3. **Develop** with clean code
4. **Test** thoroughly
5. **Submit** pull request

## 📄 License

MIT License - Free for commercial and personal use

---

## 🎉 Your Workflow Automation System is Ready!

**Deploy now and start automating your business processes with professional approval workflows!**

🚀 **Features**: Complete workflow automation with approval system  
🎨 **Design**: Corporate Blue Theme - Enterprise ready  
📦 **Deployment**: Multiple deployment options available  
🔒 **Security**: Production-ready security features  
📊 **Monitoring**: Health checks and logging included
