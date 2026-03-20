# Plan de Verificación Completa - NUREA App

**Generated**: 2026-03-19
**Estimated Duration**: 2.5-3 horas

---

## Sprint 1: Build & Lint ✅

| Verificación | Estado |
|-------------|--------|
| `npm run build` | ✅ PASA (201 páginas) |
| Dashboards cargan | ✅ Admin, Patient, Professional |
| APIs responden | ✅ /api/agents |

---

## Sprint 2: Dashboard Admin

**URL**: `http://localhost:3000/dashboard/admin`

| Página | Verificar |
|--------|-----------|
| Principal | KPIs (MRR, suscripciones, tickets), gráfico citas, muro felicidad, refresh |
| Appointments | Lista, filtros estado, búsqueda, paginación |
| Credentials | KYP docs, aprobar/rechazar, estados visuales |
| Finances | Ingresos, gráfico barras, gráfico líneas, liquidaciones |
| Marketing | Códigos VIP, crear, toggle activo/inactivo, copiar, eliminar |
| Patients | Lista, buscar, ver perfil, bloquear/desbloquear |
| Professionals | Estados (pendiente, revisión, verificado, rechazado), acciones |
| Payments | Historial, filtros estado, búsqueda |
| Settings | Configuraciones plataforma, guardar |
| Support | Tickets abiertos, conversación, responder, cerrar |
| Teams | Agentes IA, crear tarea, asignar, ejecutar, logs |
| Users | Filtros rol, ver detalles, bloquear, cambiar rol |
| Verifications | Aprobar, rechazar con razón, estados visuales |

**Tiempo estimado**: 30-45 minutos

---

## Sprint 3: Dashboard Paciente

**URL**: `http://localhost:3000/dashboard/patient`

| Página | Verificar |
|--------|-----------|
| Principal | Perfil, citas próximas, doctores favoritos, link videollamada |
| Appointments | Lista, tabs (próximas, pasadas, canceladas), detalles |
| Appointments/Success | Confirmación pago, detalles cita |
| Buscar | Búsqueda profesionales, filtros, resultados con imágenes optimizadas |
| Payments | Historial de pagos |
| Family | Miembros familia, agregar/editar |
| Favorites | Doctores favoritos, quitar |
| Documents | Documentos subidos, subir nuevo |
| Chat | Mensajes con doctores |

**Tiempo estimado**: 20-30 minutos

---

## Sprint 4: Dashboard Profesional

**URL**: `http://localhost:3000/dashboard/professional`

| Página | Verificar |
|--------|-----------|
| Principal | Calendario interactivo, estadísticas |
| Appointments | Calendario semanal/mensual, crear cita, ver detalles, cancelar |
| Availability | Configurar horarios por día, guardar |
| Patients | Lista pacientes, historial médico, notas |
| Profile | Editar perfil, subir foto, especialidad, bio |
| Onboarding | Wizard 5 pasos, completar perfil |
| Fichas | Lista fichas médicas, búsqueda |
| Consultation/[id] | Nota clínica (TipTap), guardar, crear receta, crear derivación, videollamada |
| Payments | Historial ingresos, estadísticas |
| Payouts | Solicitudes de retiro, estado |
| Reviews | Reseñas de pacientes |
| Settings | Configuraciones, notificaciones |
| Chat | Mensajes con pacientes |
| Support | Tickets abiertos |

**Tiempo estimado**: 30-45 minutos

---

## Sprint 5: APIs Backend

| Endpoint | Método | Verificar |
|----------|--------|-----------|
| `/api/agents` | GET | Lista agentes, stats |
| `/api/agents` | POST | Crear tarea, ejecutar tarea |
| `/api/admin/users` | GET | Lista usuarios con filtros |
| `/api/admin/users` | POST | Crear usuario |
| `/api/admin/payments` | GET | Historial pagos con filtros |
| `/api/admin/professionals` | GET | Lista profesionales |
| `/api/admin/verifications` | GET/PATCH | Verificaciones, aprobar/rechazar |
| `/api/professional/appointments` | GET/POST | Lista citas, crear cita |
| `/api/professional/patients` | GET | Lista pacientes |
| `/api/professional/profile` | GET/PATCH | Perfil profesional |
| `/api/appointments/[id]` | GET/PATCH | Detalles cita, actualizar |

**Tiempo estimado**: 15-20 minutos

---

## Sprint 6: Autenticación

| Flujo | Verificar |
|-------|-----------|
| Registro `/signup` | Formulario, validación, email verificación |
| Login `/login` | Credenciales correctas, credenciales incorrectas, redirección por rol |
| Logout | Sesión limpiada, redirección a login |
| Route Guards | Admin → /dashboard/admin, Profesional → /dashboard/professional, Paciente → /dashboard/patient |
| Protected Routes | Redirección a /login si no autenticado |

**Tiempo estimado**: 15 minutos

---

## Sprint 7: Páginas Públicas

| Página | Verificar |
|--------|-----------|
| Home `/` | Carga rápida, CTAs, imágenes optimizadas, carousel |
| Search `/search` | Búsqueda global, resultados |
| Professionals `/profesionales/[id]` | Perfil público, foto, especialidad, agendar |
| Booking `/booking/[id]` | Flujo reserva, selección hora, datos paciente, pago |
| Signup `/signup` | Registro nuevo usuario |
| Login `/login` | Login usuarios existentes |
| Terms `/terms` | Términos y condiciones cargan |

**Tiempo estimado**: 15 minutos

---

## Sprint 8: Performance

| Métrica | Herramienta | Objetivo |
|---------|-------------|----------|
| Build Size | npm run build | < 500KB initial JS |
| LCP | Lighthouse | < 2.5s |
| FID | Lighthouse | < 100ms |
| CLS | Lighthouse | < 0.1 |
| Lighthouse Score | lighthouse | > 90 |

**Comandos**:
```bash
# Build
npm run build

# Lighthouse
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

**Tiempo estimado**: 20 minutos

---

## Checklist Final

### Sprint 1
- [x] Build pasa sin errores
- [x] Dashboards cargan
- [x] APIs responden

### Sprint 2
- [ ] Dashboard admin completo funcional
- [ ] Todas las páginas cargan datos
- [ ] Interacciones funcionan

### Sprint 3
- [ ] Dashboard paciente completo funcional
- [ ] Buscar profesionales funciona
- [ ] Reservar cita funciona

### Sprint 4
- [ ] Dashboard profesional completo funcional
- [ ] Consulta médica funciona
- [ ] Calendario interactivo

### Sprint 5
- [ ] Todas las APIs responden
- [ ] Datos correctos

### Sprint 6
- [ ] Auth flujos funcionan
- [ ] Route guards activos

### Sprint 7
- [ ] Páginas públicas cargan
- [ ] SEO básico funciona

### Sprint 8
- [ ] Performance aceptable
- [ ] Sin errores de renderizado

---

## Resumen de Sprints

| Sprint | Descripción | Tiempo |
|--------|-------------|--------|
| 1 | Build & Lint | 5 min ✅ |
| 2 | Dashboard Admin | 30-45 min |
| 3 | Dashboard Paciente | 20-30 min |
| 4 | Dashboard Profesional | 30-45 min |
| 5 | APIs Backend | 15-20 min |
| 6 | Autenticación | 15 min |
| 7 | Páginas Públicas | 15 min |
| 8 | Performance | 20 min |

**Total estimado: 2.5-3 horas**

---

## Risks & Gotchas

1. **Supabase offline**: APIs fallarán si la base de datos no está disponible
   - Verificar conexión antes de testing

2. **Rate limiting**: Muchas peticiones pueden ser limitadas
   - Añadir delays entre requests

3. **Environment variables**: APIs externas requieren credenciales
   - Verificar `.env.local` completo

4. **Tiempo**: Son 50+ verificaciones manuales
   - Priorizar flujos críticos primero
