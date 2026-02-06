# 🚀 Core Platform Frontend + IA Agents & RAG

Una interfaz moderna y de alto rendimiento construida con NextJS 15 que ofrece una experiencia de usuario excepcional para la gestión de plataformas de desarrollo con integración nativa de agentes IA y arquitectura RAG (Retrieval Augmented Generation).

## ✨ Características Destacadas con IA

### 🤖 Agentes Autónomos de IA (Roadmap)
- Deployment Agent: Predice y previene fallos en deployments
- Security Agent: Escanea vulnerabilidades en tiempo real
- Performance Agent: Sugiere mejoras de rendimiento
- Documentation Agent: Genera documentación automática

### 🧠 Sistema RAG Avanzado (Roadmap)
- Knowledge Base Vectorizada: Documentación, código y logs indexados
- Búsqueda Semántica: Encuentra información relevante usando embeddings
- Context-Aware Responses: Respuestas basadas en el contexto del proyecto
- Multi-source Retrieval: Combina código, logs, docs y tickets
- Continuous Learning: Mejora con cada interacción

### 🎨 UI/UX Moderna
- Dark/Light mode con toggle instantáneo
- Diseño completamente responsive
- Animaciones fluidas con Framer Motion
- Componentes accesibles (WCAG 2.1 compliant)

### 📊 Dashboard Inteligente
- Métricas en tiempo real con gráficos interactivos
- Widgets personalizables
- Filtros avanzados por fecha, proyecto y estado
- Exportación de reportes en múltiples formatos

### ⚡ Gestión de Proyectos Avanzada
- Vista de lista y vista de tarjetas
- Búsqueda en tiempo real
- Filtros multi-criterio
- Drag & drop para reordenar
- Vista previa rápida

### 🚀 Sistema de Deployments
- Pipeline visual en tiempo real
- Logs con WebSocket integration
- Rollback con un click
- Comparación de versiones

### 👥 Gestión de Equipos
- Invitaciones con roles granular
- Permisos visuales por proyecto
- Actividad del equipo en tiempo real
- Gestión de acceso granular

## 🏗️ Arquitectura
```
╔════════════════════════════════════════════════════════╗
║                 Frontend Layer (NextJS 15)             ║
╠════════════════════════════════════════════════════════╣
║  ┌────────────────────────────────────────┐            ║
║  │            App Router                  │            ║
║  │  • Server Components                   │            ║
║  │  • Nested Layouts                      │            ║
║  │  • Streaming                           │            ║
║  └────────────────────────────────────────┘            ║
║  ┌────────────────────────────────────────┐            ║
║  │         Component Architecture         │            ║
║  │  • ui/ - Shadcn/ui components          │            ║
║  │  • shared/ - Reusable components       │            ║
║  │  • features/ - Feature components      │            ║
║  └────────────────────────────────────────┘            ║
║  ┌────────────────────────────────────────┐            ║
║  │          State Management              │            ║
║  │  • React Query - Server state          │            ║
║  │  • Zustand - Client state              │            ║
║  │  • Context API - Theme/Auth            │            ║
║  └────────────────────────────────────────┘            ║
╚═══════════════════════════╦════════════════════════════╝
                            ║ REST API + WebSockets
╔═══════════════════════════╩════════════════════════════╗
║                    Backend Layer                       ║
║                  (core-platform-backend)               ║
╚════════════════════════════════════════════════════════╝
```

## 🚀 Comenzando

### Prerrequisitos
- Node.js 18+ 
- npm 9+ o yarn 1.22+
- Backend Core Platform ejecutándose

## Instalación Rápida

### 1. Clonar repositorio
```
git clone https://github.com/MaximilianoFRomero/CORE-Project-Frontend
cd core-platform-backend
```
### 2. Instalar dependencias

```npm install```

o

```yarn install```

### 3. Configurar variables de entorno

```cp .env.example .env.local```

### Editar ```.env.local``` con tus configuraciones

```
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME="Core Platform"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_AI_ENABLED=false
NEXT_PUBLIC_WEBSOCKETS_ENABLED=true

# Analytics (Optional)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
```

### 4. Iniciar servidor de desarrollo

```npm run dev```

o

```yarn run dev```

### 5. Abrir en navegador

Navega a ```http://localhost:3000```

## 📦 Stack Tecnológico

### Core Framework

- **NextJS 15** - React framework con App Router
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca UI con concurrent features

### UI/UX

- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes accesibles
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **clsx** - Utilidad para clases condicionales

### Data Visualization

- **Recharts** - Gráficos interactivos
- **React Table** - Tablas con features avanzadas

### Testing

- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **MSW** - Mock Service Worker

### Quality & Performance

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Bundle Analyzer** - Optimización de bundles

## 📡 Estructura de Rutas

```
CORE-Project-Frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── deployments/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── github/
│   │   │           └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── sonner.tsx
│   │   ├── dashboard-nav.tsx
│   │   ├── metrics-chart.tsx
│   │   ├── project-form.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── contexts/
│   │   └── auth-context.tsx
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useProjects.ts
│   │   └── useDeployments.ts
│   └── lib/
│       ├── api-client.ts
│       ├── utils.ts
│       └── validations.ts
├── public/
│   └── next.svg
├── .env.example
├── .gitignore
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### Testing
```
npm run test           -> Tests unitarios
npm run test:e2e       -> Tests end-to-end
npm run test:cov       -> Coverage report
```

### Database
```
npm run migration:generate  -> Generar migración
npm run migration:run       -> Ejecutar migraciones
npm run seed               -> Datos de prueba
```

### Calidad de código
```
npm run lint              -> Linting
npm run format            -> Formatear código
npm run build             -> Compilar TypeScript
```

## 📡 API Endpoints

Autenticación ```(/api/v1/auth)```

```POST /login``` - Iniciar sesión

```POST /register``` - Registrar nuevo usuario

```POST /refresh``` - Refrescar token

```POST /logout``` - Cerrar sesión

Proyectos ```(/api/v1/projects)```

```GET /``` - Listar todos los proyectos

```POST /``` - Crear nuevo proyecto

```GET /:id``` - Obtener proyecto específico

```PATCH /:id``` - Actualizar proyecto

```DELETE /:id``` - Eliminar proyecto

```GET /stats``` - Estadísticas de proyectos

Deployments ```(/api/v1/deployments)```

```GET /``` - Listar deployments

```POST /``` - Crear nuevo deployment

```GET /stats``` - Métricas de deployments

```GET /by-date-range``` - Filtro por fecha

```PATCH /:id/status``` - Actualizar estado

Usuarios ```(/api/v1/users)```

```GET /``` - Listar usuarios (admin)

```GET /profile/me``` - Perfil del usuario actual

```PATCH /profile/me``` - Actualizar perfil

```GET /:id``` - Obtener usuario específico

```POST /:id/activate``` - Activar usuario (admin)

## 🐳 Docker

docker-compose.yml

```
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: core_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./:/app
      - /app/node_modules
    command: npm run start:dev

volumes:
  postgres_data:
```


## 🔧 Scripts Disponibles

### Desarrollo

```
npm run dev           # Iniciar servidor de desarrollo
npm run build         # Build para producción
npm run start         # Iniciar build de producción
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Formatear código con Prettier
```

### Testing

```
npm run test          # Ejecutar tests unitarios
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con coverage report
npm run test:e2e      # Ejecutar tests E2E con Cypress
npm run test:e2e:open # Abrir Cypress UI
```

### Generación

```
npm run generate:component # Generar nuevo componente
npm run generate:page      # Generar nueva página
npm run generate:hook      # Generar nuevo hook
```

### Análisis

```
npm run analyze       # Analizar bundle size
npm run type-check    # Verificar tipos TypeScript
npm run security      # Auditoría de seguridad
```

## 🎨 Sistema de Diseño

### Temas

El sistema soporta temas claros y oscuros con toggle en tiempo real

### Componentes Base (Shadcn/ui)

### Customización

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación

### Middleware de Rutas

## 📊 Gestión de Estado

### Server State (React Query)

### Client State (Zustand)

## 🔄 Integración con Backend

### Cliente HTTP

### WebSockets para Tiempo Real

## 🧪 Testing

### Component Testing

### E2E Testing con Cypress

## 🚀 Deployment

### Build para Producción

```
# 1. Build la aplicación
npm run build

# 2. Verificar el build
npm run start

# 3. Los archivos estarán en /.next
```

### Docker

```
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001/api/v1
    depends_on:
      - backend
    networks:
      - core-network

  backend:
    image: core-platform-backend:latest
    ports:
      - "3001:3001"
    networks:
      - core-network

networks:
  core-network:
    driver: bridge
```

### Vercel (Recomendado)

```
1. Conectar repositorio GitHub con Vercel

2. Configurar variables de entorno:

   - ```NEXT_PUBLIC_API_URL``` → URL de tu backend

   - ```NEXT_PUBLIC_APP_URL``` → URL de tu frontend

3. Deploy automático con cada push
```

### Environment Variables por Entorno
```
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.coreplatform.com/api/v1

# .env.staging (staging)
NEXT_PUBLIC_API_URL=https://staging-api.coreplatform.com/api/v1
```

## 📈 Performance Optimization

### Code Splitting Automático

NextJS 15 hace code splitting automático por:

- Rutas (App Router)

- Componentes dinámicos (```dynamic()```)

- Libraries (```next/dynamic```)

## 🤝 Contribuir

1. Fork del repositorio
2. Crear una branch para tu feature (```git checkout -b feature/AmazingFeature```)
3. Commit tus cambios (```git commit -m 'Add some AmazingFeature'```)
4. Push a la branch (```git push origin feature/AmazingFeature```)
5. Abrir un Pull Request

### Guía de Contribución
Sigue el Conventional Commits

Mantén cobertura de tests > 80%

Documenta nuevas features

Actualiza el ```CHANGELOG.md```

## 📈 Roadmap

### ✅ Implementado

- Dashboard principal con métricas

- CRUD completo de proyectos

- Sistema de deployments con logs

- Autenticación JWT completa

- Tema dark/light

- Gráficos interactivos

- Responsive design

### 🔄 En Progreso

- WebSockets para logs en tiempo real

- Integración con GitHub/GitLab

- Notificaciones push

- Dashboard administrativo

- Exportar datos a CSV/Excel

### 🚀 Planeado

- Chatbot de asistencia con IA

- Analytics predictivos

- Multi-tenant support

### 🧠 Integración de IA (Futuro)

- Asistente de código con GPT-4

- Análisis automático de logs

- Recomendaciones de optimización

- Predicción de fallos

- Automatización inteligente

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver LICENSE para más detalles.

## 👨‍💻 Autor

Maximiliano Romero

[maximilianoromerovigo@gmail.com]

https://github.com/MaximilianoFRomero

# ⭐️ ¿Te gusta este proyecto? ¡Dale una estrella en GitHub y compártelo!
