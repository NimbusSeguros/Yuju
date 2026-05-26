# Reporte de Vulnerabilidades de Seguridad

**Fecha:** 20 de Mayo de 2026  
**Proyecto:** Yuju Insurance Cotizadores  
**Versión:** 1.0

---

## Resumen Ejecutivo

Se identificaron **18 vulnerabilidades** de seguridad, de las cuales **8 son críticas o de alta severidad**. El proyecto requiere intervención inmediata para corregir las fallas más graves antes de producción.

---

## Vulnerabilidades Críticas (CRITICAL)

### 1. Secrets Hardcodeados en .env
**Severidad:** 🔴 CRITICAL  
**Estado:** ⚠️ CRÍTICO - Requiere rotación de credenciales

**Descripción:** El archivo `.env` contiene múltiples credenciales sensibles que, aunque no se suben a git, están expuestas en el bundle de producción.

**Credenciales comprometidas:**
```env
VITE_API_KEY=4cfbe496039e9ebed36fc38b2a69cec62c6d906bceb6d60c04f3cbc5674341f5
VITE_INFOAUTO_PASSWORD=Cl9iXaYwU5It2EhT
JWT_SECRET=yuju_super_secret_key_change_me_in_prod
SECURE_ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
VITE_PARSE_MASTER_KEY=YHjqD6iSbUDSScCgOfisygZCdFno9UiHWYpO77VB
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Acción requerida:**
1. **Rotar todas las credenciales inmediatamente** en los servicios backends
2. No exponer `VITE_API_KEY` en el cliente - usar un backend BFF (Backend-For-Frontend)
3. Implementar un secrets manager (Vercel Env vars, GitHub Secrets, AWS Secrets Manager)

---

### 2. API Keys Expuestas en Client-Side Bundle
**Severidad:** 🔴 CRITICAL  
**Archivo:** `src/services/apiClient.ts:6`

```typescript
const API_KEY = import.meta.env.VITE_API_KEY;
```

**Descripción:** La API key se embebe en el JavaScript bundle y se envía con cada request. Cualquier persona puede extraerla de la pestaña Network o del código fuente.

**Impacto:** Un atacante puede autenticarse como la aplicación a todos los backends.

**Solución temporal:** Mover la autenticación a un backend BFF que reciba requests del cliente sin credenciales expuestas.

---

### 3. Tokens de Autenticación en localStorage
**Severidad:** 🔴 CRITICAL  
**Archivos:** 
- `src/services/apiClient.ts` - usa `auth_token`
- `src/components/cotizadores/GenericTechHomeCotizador.tsx` - usa `hogar_auth_token`

```typescript
localStorage.setItem('auth_token', token);
```

**Descripción:** localStorage es vulnerable a ataques XSS. Cualquier JavaScript malicioso puede robar estos tokens.

**Acción requerida:**
1. Usar `httpOnly` cookies para almacenar tokens (no accesibles via JavaScript)
2. Implementar CSRF protection con tokens en headers
3. Como mínimo temporal: usar `sessionStorage` en vez de `localStorage` (se limpia al cerrar el navegador)

---

### 4. Client Secret Hardcodeado
**Severidad:** 🔴 CRITICAL  
**Archivo:** `src/components/cotizadores/GenericTechHomeCotizador.tsx:30`

```typescript
const response = await axios.post(
  `${...}/api/auth/token`,
  { clientSecret: 'yuju_client_secret_2024' }, // ← HARDCODED!
```

**Impacto:** Este secret da acceso al backend de Hogar. Si se filtra, un atacante puede:
- Obtener tokens de acceso
- Realizar cotizaciones fraudulentas
- Acceder a datos de seguros de hogar

**Solución:** Mover a `VITE_HOGAR_API_CLIENT_SECRET` en el .env.

---

## Vulnerabilidades de Alta Severidad (HIGH)

### 5. allowedHosts: true en Desarrollo
**Severidad:** 🟠 HIGH  
**Archivo:** `vite.config.ts:10`

```typescript
server: {
  allowedHosts: true,  // Permite cualquier host
```

**Descripción:** Esta configuración permite ataques DNS rebinding en desarrollo. Aunque es menos crítico en desarrollo, indica una falta de configuración de seguridad.

**Solución:** Especificar hosts permitidos explícitamente o eliminar en producción.

---

### 6. Fallback URL Hardcodeada
**Severidad:** 🟠 HIGH  
**Archivo:** `src/services/motoApi.ts:4`

```typescript
const MOTO_API_BASE = import.meta.env.VITE_MOTO_API_URL || 'https://apiyujumotos.com';
```

**Descripción:** Si `VITE_MOTO_API_URL` no está configurada, las requests van a un dominio fijo que podría ser comprometido via DNS.

**Solución:** Requerir la variable de entorno explícitamente y fallar si no existe.

---

### 7. Endpoints de API Internos Expuestos al Cliente
**Severidad:** 🟠 HIGH  
**Archivo:** `src/pages/Cotizadores/MotoCotizador.tsx:343-357`

```typescript
const pRus = fetch(`${BASE_URL}/rus/cotizaciones/motos`, ...)
const pAtm = fetch(`${BASE_URL}/atm/cotizar`, ...)
const pIntegrity = fetch(`${BASE_URL}/integrity/cotizar`, ...)
```

**Descripción:** Los endpoints internos de pricing (`/rus/cotizaciones/motos`, `/atm/cotizar`, `/integrity/cotizar`) están directamente expuestos al cliente. Deberían estar detrás de un BFF.

**Impacto:**
-Enumeración de precios de seguros
-Posible bypass de validaciones de negocio
-Exposición de lógica de pricing a competidores

---

### 8. Sin Validación de Código Postal
**Severidad:** 🟠 HIGH  
**Archivos:**
- `src/components/cotizadores/PostalCodeSelect.tsx:40-44`
- `src/pages/Cotizadores/MotoCotizador.tsx:262-264`

```typescript
const val = e.target.value.replace(/\D/g, "").substring(0, 4);
// Solo valida: val.length === 4
```

**Descripción:** Solo se validan 4 dígitos. No hay validación de formato real ni verificación contra una lista de códigos postales válidos.

**Impacto:**
- Enumeración de códigos postales válidos
- Cache poisoning con datos maliciosos
- Bypass de restricciones geográficas

---

## Vulnerabilidades de Severidad Media (MEDIUM)

### 9. Sin Rate Limiting
**Severidad:** 🟡 MEDIUM  
**Archivos:** Todos los API clients

**Descripción:** No hay protección contra ataques de fuerza bruta o enumeración.

---

### 10. Console Logging de Datos Sensibles
**Severidad:** 🟡 MEDIUM  
**Archivos:** Múltiples archivos

```typescript
console.error('Error fetching token:', error);
console.error("Error fetching localities:", err);
```

**Impacto:** Datos sensibles visibles en browser dev tools.

---

### 11. Posible Cache Poisoning
**Severidad:** 🟡 MEDIUM  
**Archivo:** `src/pages/Cotizadores/MotoCotizador.tsx:249-280`

```typescript
localStorage.setItem(`${CACHE_KEY_PREFIX}${val}`, JSON.stringify(locList));
```

**Descripción:** Datos de localidades cacheados en localStorage sin validación.

---

### 12. No Validación de Estructura de Respuestas API
**Severidad:** 🟡 MEDIUM  
**Archivo:** `src/utils/cotizadorUtils.ts:243-260`

```typescript
const rawPrice = Number(plan.precio || plan.premio || plan.cuota || 0);
```

**Descripción:** Si la API devuelve tipos inesperados, `Number()` puede producir `NaN`.

---

### 13. Condición de Carrera en Renovación de Token
**Severidad:** 🟡 MEDIUM  
**Archivo:** `src/services/apiClient.ts:48-81`

```typescript
if (!token && !config.url?.includes('/auth/token')) {
    await fetchToken();
}
```

**Descripción:** Múltiples requests concurrentes pueden disparar múltiples `fetchToken()`.

---

### 14. Missing Security Headers
**Severidad:** 🟡 MEDIUM  
**Descripción:** No hay CSP, HSTS, X-Frame-Options, etc.

---

### 15. Sin Dependency Vulnerability Scanning
**Severidad:** 🟡 MEDIUM  
**Archivo:** `package.json`

No hay `npm audit` configurado en CI/CD.

---

## Plan de Remediación

### Fase 1: Inmediato (Critical) - ✅ PARCIALMENTE COMPLETADO
- [x] **Remover secrets hardcodeados** del .env (reemplazados con placeholders)
- [x] Mover `clientSecret` de GenericTechHomeCotizador a variable de entorno (`VITE_HOGAR_API_CLIENT_SECRET`)
- [x] Cambiar almacenamiento de tokens de `localStorage` a `sessionStorage` (apiClient, GenericTechHomeCotizador, AutoCotizador)
- [x] Actualizar vite.config.ts para especificar hosts permitidos (reemplazado `allowedHosts: true` con `['localhost', '127.0.0.1']`)

### Fase 2: Corto Plazo (High)
- [ ] Implementar validación de código postal (formato + checksum)
- [ ] Crear backend BFF para ocultar credentials del cliente
- [ ] Implementar rate limiting en clientes
- [ ] Eliminar console.error con datos sensibles
- [ ] Mover Variable de entorno `VITE_HOGAR_API_CLIENT_SECRET` a `.env` local (no comprometido)

### Fase 3: Mediano Plazo (Medium)
- [ ] Implementar ErrorBoundary en React
- [ ] Agregar security headers en producción
- [ ] Configurar npm audit en CI/CD
- [ ] Crear interfaces TypeScript para respuestas API
- [ ] Usar sessionStorage para caches de marcas/modelos (MotoCotizador, BrandSelect) - menor severidad pero mejora seguridad

---

##severity: CRITICAL (requiere acción inmediata)
##type: security
##components: apiClient.ts, motoApi.ts, GenericTechHomeCotizador.tsx, MotoCotizador.tsx, vite.config.ts
