# NEO — AGENTS.md (PRO)

---

## 🎯 Contexto del producto

- SaaS gastronómico multi-tenant
- Usuarios: dueños de locales gastronómicos
- Objetivo: aumentar ventas, simplificar operaciones y digitalizar procesos
- Prioridad de negocio: simplicidad > complejidad técnica

---

## ⚖️ Prioridades del sistema

Orden de importancia:

1. Evitar bugs en producción
2. Mantener consistencia visual y UX
3. Código simple y mantenible
4. Velocidad de desarrollo
5. Performance (solo si impacta UX real)

---

## ⚙️ Forma de trabajo del agente

Antes de ejecutar cambios:

1. Entender el objetivo
2. Evaluar impacto en el sistema
3. Proponer solución breve si hay ambigüedad

Evitar:

- Sobreingeniería
- Refactors innecesarios
- Reescribir código que ya funciona

---

## 💸 Uso eficiente de tokens

Requiere confirmación SOLO si:

- Se analizan +20 archivos
- Se leen archivos completos >500 líneas
- Refactors afectan +10 archivos
- Búsquedas globales sin scope (`grep` sin filtro)

Permitido sin preguntar:

- Leer archivos individuales
- Buscar dentro de una carpeta específica
- Cambios pequeños/localizados

---

## 🧱 Stack

- Next.js 16 (App Router, Server Actions, Turbopack)
- Supabase SSR (`@supabase/ssr`)
- Tailwind CSS v4
- shadcn/ui + Radix
- Zustand
- Zod v4

---

## 🧩 Arquitectura

- `src/proxy.ts` reemplaza `middleware.ts`

- 3 clientes Supabase:
  - `client.ts` → browser
  - `server.ts` → server + cookies
  - `admin.ts` → service role (server-only)

- Server Actions en `features/*/actions.ts`

- Multi-tenant obligatorio (`negocio_id`)

---

## 🗄️ Reglas de base de datos

- TODAS las queries deben incluir `negocio_id`
- Nunca confiar en datos del cliente
- Validar inputs con Zod SIEMPRE
- No exponer service role en cliente
- Preferir lógica en backend antes que frontend

---

## 🔁 Server Actions

- Toda mutación va en Server Actions
- No hacer inserts/updates desde el cliente
- Manejar errores explícitamente
- Retornar datos tipados
- Evitar lógica innecesaria en el frontend

---

## 🎨 UX

- Siempre mostrar feedback:
  - loading
  - éxito
  - error

- Acciones destructivas requieren confirmación
- Interfaces deben ser intuitivas sin explicación

---

## 🚨 Manejo de errores

- Nunca dejar errores silenciosos
- Log interno + mensaje claro al usuario
- No usar `console.log` como solución final

---

## 🪵 Logging

- Logs claros y accionables
- No loggear datos sensibles
- Prefijos obligatorios:
  - [AUTH]
  - [DB]
  - [UI]
  - [ACTION]

---

## 🧠 Convenciones

- Variables: camelCase
- Componentes: PascalCase
- Archivos: kebab-case
- Acciones: verbo + entidad (`createOrder`, `updateMenu`)

---

## 🧩 Frontend

- Preferir CSS sobre lógica JS para responsive
- Evitar hydration mismatch
- Componentes pequeños por responsabilidad (no por tamaño arbitrario)

---

## ⚡ Performance

- Evitar renders innecesarios
- No usar estado global sin necesidad
- Lazy load donde tenga sentido

---

## 🔐 Seguridad

- Validar todo input del usuario
- Nunca confiar en el cliente
- Respetar RLS excepto en `admin.ts`
- Secrets solo en `.env.local`

---

## 🎯 Multi-tenant

- Cada operación debe estar scoped por `negocio_id`
- Nunca mezclar datos entre tenants

---

## 🎛️ UI/UX reglas específicas

- Acciones destructivas en menú overflow (⋮)
- Botones visibles en dark mode:
  `bg-black/85 dark:bg-white/85`
- Atajos de teclado deben ignorarse si hay modals abiertos

---

## 🧭 Decisiones técnicas

En caso de duda:

- Elegir la opción más simple
- Priorizar legibilidad sobre “elegancia”
- Evitar dependencias innecesarias

---

## 🚫 Anti-patrones

Evitar:

- Lógica de negocio en el frontend
- Refactors grandes sin necesidad
- Código duplicado sin motivo
- Optimización prematura

---

## ✅ Definición de tarea completa

Una tarea está completa cuando:

- Funciona correctamente
- No rompe funcionalidades existentes
- Tiene validación y manejo de errores
- Respeta multi-tenant
- Mantiene consistencia visual

---

## 🧪 Testing

- Testear lógica crítica
- No testear cosas triviales
- Priorizar estabilidad sobre cobertura artificial

---

## 📦 Comandos clave

```bash
npm run dev
npm run build
npm run test
npm run impecable
```

---

## ⚠️ Gotchas

- No existe `tailwind.config.ts`
- `middleware.ts` está obsoleto → usar `proxy.ts`
- Supabase local usa `supabase/`
- CSS separado por contexto
- `.env*` está gitignored

---

## 🧠 Regla final

El agente debe actuar como un desarrollador senior:

- Entiende antes de ejecutar
- Minimiza riesgos
- Prioriza el negocio
- Mantiene el sistema estable

---
