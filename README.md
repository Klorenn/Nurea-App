# NUREA

> Plataforma de salud digital que conecta pacientes y profesionales de la salud de forma simple, humana y segura.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)

## 🎯 Visión

NUREA es una plataforma de telemedicina y gestión de consultas diseñada para ser más simple, humana y menos burocrática que las alternativas existentes. Conectamos pacientes con profesionales de la salud verificados, priorizando la claridad, confianza y seguridad.

## ✨ Características Principales

### Para Pacientes
- 🔍 **Búsqueda de profesionales** por especialidad y ubicación
- 📅 **Gestión de citas** con recordatorios automáticos
- 💬 **Mensajería segura** con profesionales
- 💳 **Pagos integrados** y transparentes
- 📄 **Documentos médicos** con acceso controlado
- ⭐ **Sistema de favoritos** y reseñas

### Para Profesionales
- 📊 **Dashboard completo** con métricas en tiempo real
- 📅 **Agenda integrada** para gestionar citas
- 👥 **Gestión de pacientes** y historial clínico
- 💰 **Seguimiento de ingresos** automático
- 🔔 **Sistema de notificaciones** en tiempo real
- ✅ **Perfil profesional** verificable

### Para Administradores
- 👤 **Gestión de usuarios** y roles
- ✅ **Verificación de profesionales**
- 💳 **Auditoría de pagos**
- 🎫 **Sistema de soporte** centralizado
- 📊 **Panel de control** con estadísticas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm, yarn o pnpm
- Cuenta de Supabase

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Klorenn/Nurea-App.git
cd Nurea-App

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
Nurea-App/
├── app/                    # Rutas y páginas (Next.js App Router)
│   ├── api/               # API routes
│   ├── dashboard/         # Panel de pacientes
│   ├── professional/       # Panel de profesionales
│   ├── admin/             # Panel de administración
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables
│   └── ...
├── lib/                  # Utilidades y helpers
│   ├── auth/             # Lógica de autenticación
│   ├── supabase/         # Clientes de Supabase
│   └── ...
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
└── public/              # Archivos estáticos
```

## 🛠️ Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4.1
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth (Email + Google OAuth)
- **UI Components:** Radix UI + shadcn/ui
- **Animaciones:** Framer Motion
- **Formularios:** React Hook Form + Zod
- **Temas:** next-themes

## 📦 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta ESLint
```

## 🔐 Autenticación

NUREA soporta múltiples métodos de autenticación:

- **Email y contraseña** con verificación obligatoria
- **Google OAuth** para inicio de sesión rápido
- **Recuperación de contraseña** por email
- **Roles:** Paciente, Profesional, Administrador

## 🌐 Internacionalización

La plataforma está disponible en:
- 🇪🇸 Español (predeterminado)
- 🇬🇧 Inglés

## 🎨 Sistema de Diseño

NUREA utiliza un sistema de diseño consistente basado en:
- **Colores:** Paleta teal/verde agua como color primario
- **Tipografía:** Sistema de fuentes claro y legible
- **Componentes:** Biblioteca de componentes reutilizables
- **Temas:** Modo claro y oscuro

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles
- 📱 Tablets
- 💻 Desktop

## 🔒 Seguridad

- Autenticación segura con Supabase
- Row Level Security (RLS) en la base de datos
- Validación de roles en middleware
- Protección de rutas por rol
- Encriptación de datos sensibles

## 📄 Licencia

Este proyecto es privado y propietario.

## 🤝 Contribuir

Este es un proyecto privado. Para contribuciones, contacta al equipo de desarrollo.

## 📞 Soporte

Para soporte técnico, contacta a: soporte@nurea.app

---

**NUREA** - Atención médica que se siente humana.
