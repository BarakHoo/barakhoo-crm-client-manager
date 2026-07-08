# BarakHoo's CRM Client Manager

A modern, full-stack Customer Relationship Management (CRM) system designed for sales teams with role-based access control, client assignment, and comprehensive activity tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

## 🌟 Features

### Core Functionality
- **Client Management**: Create, view, update, and manage client information
- **Activity Tracking**: Comprehensive notes system with timestamps and author tracking
- **Status Management**: Track client lifecycle (New, Contacted, Interested, Not Interested, Do Not Call)
- **Click-to-Call & Email**: Direct integration for quick communication
- **Smart Search**: Search clients by name, company, phone, or email

### Role-Based Access Control
- **Sales Agent**: View and manage assigned clients only, add notes, update statuses
- **Agent Manager**: Full client access, assign clients to agents, create/delete clients
- **Big Boss**: Super admin with user management, approval workflows, and system-wide access

### Advanced Features
- **Client Assignment System**: Assign specific clients to sales agents for focused management
- **User Approval Workflow**: Big Boss must approve new user registrations
- **Audit Logging**: Complete audit trail of all system actions
- **Dark/Light Mode**: Beautiful theme switching with custom design system
- **Bilingual Support**: Full English and Hebrew translations (RTL support)
- **Super Admin Dashboard**: User management, account disable/delete, approval queue

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt password encryption
- **Role-Based Authorization**: Method-level security with Spring Security
- **Self-Protection**: Big bosses cannot delete/disable themselves
- **Hierarchical Permissions**: Only the first big boss can disable other big bosses

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.2 with Java 17
- **Security**: Spring Security with JWT
- **Database**: MySQL 8.0 with JPA/Hibernate
- **API**: RESTful API with CORS support

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **UI**: React Bootstrap with custom theming
- **Routing**: React Router v6
- **State**: React Hooks with localStorage persistence
- **Icons**: Bootstrap Icons

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (serves frontend, proxies API)
- **Database**: MySQL 8.0 in Docker

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (for cloning)
- 8GB+ RAM recommended

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/barakhoo-crm.git
   cd barakhoo-crm
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080/api

### First-Time Setup

1. **Register a user** at http://localhost:80/register
2. **Wait for approval** (first user becomes big_boss automatically)
3. **Login** with your credentials

### Default Ports
- **Frontend**: 80 (Nginx)
- **Backend**: 8080 (Spring Boot)
- **Database**: 3306 (MySQL)

## 📁 Project Structure

```
.
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/example/crm/
│   │       ├── controller/  # REST controllers
│   │       ├── model/       # JPA entities
│   │       ├── repository/  # Data access layer
│   │       ├── service/     # Business logic
│   │       ├── security/    # JWT & authentication
│   │       └── dto/         # Data transfer objects
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main dashboard
│   │   ├── ClientPage.jsx  # Client detail view
│   │   ├── SuperAdmin.jsx  # Admin management
│   │   ├── Login.jsx       # Authentication
│   │   ├── Register.jsx    # User registration
│   │   ├── Layout.jsx      # Navigation & layout
│   │   ├── auth.js         # Auth utilities
│   │   ├── i18n.jsx        # Translations
│   │   ├── theme.jsx       # Theme system
│   │   └── styles.css      # Global styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔐 User Roles & Permissions

### Sales Agent
- ✅ View assigned clients only
- ✅ Add notes to assigned clients
- ✅ Update status of assigned clients
- ✅ Click-to-call and email assigned clients
- ❌ Cannot create new clients
- ❌ Cannot view unassigned clients
- ❌ Cannot delete clients

### Agent Manager
- ✅ All sales agent permissions
- ✅ View all clients
- ✅ Create new clients
- ✅ Delete clients
- ✅ Assign clients to sales agents
- ❌ Cannot manage users

### Big Boss
- ✅ All agent manager permissions
- ✅ User management (approve, disable, delete)
- ✅ View pending registrations
- ✅ Full system access
- ⚠️ Cannot delete/disable self
- ⚠️ Only first big boss can disable other big bosses

## 🛠️ Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Access
```bash
docker exec -it consoleapp1-db-1 mysql -u crmuser -p
# Password: crmpass
```

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and get JWT

### Clients
- `GET /api/clients` - List clients (filtered by role)
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create client (manager+)
- `DELETE /api/clients/code/{code}` - Delete client (manager+)
- `PATCH /api/clients/{id}/assign` - Assign client to agent (manager+)
- `GET /api/clients/agents` - List available agents (manager+)

### Notes & Status
- `POST /api/clients/code/{code}/notes` - Add note
- `PATCH /api/clients/code/{code}/status` - Update status

### Admin (Big Boss Only)
- `GET /api/admin/pending` - Pending user approvals
- `POST /api/admin/approve/{userId}` - Approve user
- `POST /api/admin/deny/{userId}` - Deny user
- `GET /api/admin/users` - List active users
- `DELETE /api/admin/users/{userId}` - Delete user
- `POST /api/admin/users/{userId}/disable` - Disable user

## 🎨 Customization

### Themes
Edit `frontend/src/styles.css` to customize colors, fonts, and spacing. The app includes built-in dark/light mode support.

### Translations
Add or modify translations in `frontend/src/i18n.jsx`. Currently supports English and Hebrew (RTL).

### Roles
Add new roles by modifying the `Role` entity and updating security configurations in `SecurityConfig.java`.

## 📊 Database Schema

### Main Tables
- **users**: User accounts and authentication
- **roles**: Available system roles
- **user_roles**: Many-to-many user-role mapping
- **clients**: Client information and assignments
- **notes**: Client activity notes
- **audit_log**: System audit trail

## 🐛 Troubleshooting

### Containers won't start
```bash
docker-compose down -v
docker-compose up --build
```

### Database connection errors
Ensure MySQL container is fully started before backend:
```bash
docker-compose logs db
```

### Port conflicts
Edit `docker-compose.yml` to change exposed ports if 80 or 8080 are in use.

### Frontend shows blank page
Check browser console and ensure backend API is accessible at `/api`.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**BarakHoo**

---

## 🚧 Roadmap

- [ ] Activity timeline and history
- [ ] Task and reminder system
- [ ] Analytics dashboard
- [ ] Email integration
- [ ] Document attachment
- [ ] Bulk import/export
- [ ] Mobile app
- [ ] Two-factor authentication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ for modern sales teams**
