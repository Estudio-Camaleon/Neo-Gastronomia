# ⚡ NEO - Plataforma Gastronómica SaaS Multi-Tenant

NEO es una plataforma de software como servicio (SaaS) de alto rendimiento diseñada para la industria gastronómica. Permite a múltiples comercios (Tenants) gestionar de forma autónoma su identidad de marca, menús digitales dinámicos, control operativo de catálogos y procesamiento de pedidos con integraciones de mensajería automatizada en tiempo real.

El proyecto está construido bajo una identidad de diseño **Neo-Brutalista** (alto contraste, tipografía técnica, bordes rígidos industriales y feedback de interacción física).

---

## 🛠️ Stack Tecnológico Core

- **Framework:** Next.js (App Router, Server Actions, React Server Components)
- **Lenguaje:** TypeScript (Tipado estricto, interfaces ambientales globales)
- **Estilos:** Tailwind CSS (Arquitectura de variables dinámicas inyectadas vía Base de Datos)
- **Backend e Infraestructura:** Supabase (PostgreSQL, Autenticación SSR, Storage Buckets)
- **Seguridad:** Row Level Security (RLS) a nivel de Base de Datos y Server-Side Guards en Middleware

---

## 🚦 Semáforo de Estado del Sistema & Roadmap

### 📦 Lo ya logrado (Producción-Ready)

- **Estado de Gracia Estática:** Pipeline de optimización técnica certificado (`Zero Warnings, Zero Errors`) ejecutando `npm run lint`.
- **Aislamiento Multi-tenant:** Middleware de enrutamiento dinámico para acceso por URL pública (`/[slug]`) y panel privado aislado (`/configuracion`, `/pedidos`).
- **Autenticación Blindada:** Implementación de `@supabase/ssr` con persistencia segura en cookies del servidor y base de datos con PostgreSQL Triggers automatizados para inyección de perfiles mediante Google Auth / Email.
- **Orquestador de Identidad de Marca:** Formulario de control maestro con **Slug Change Radar** (alerta UX preventiva de enlaces caídos) y sanitización de URLs en caliente.
- **Módulo de Base de Datos Seguro:** Abstracción unificada de consultas mediante `safe-query.ts` para aislar fallos de red o mutaciones críticas en Supabase.
- **UI Atómica Global:** Desacoplamiento de componentes de infraestructura compartidos (`image-upload.tsx` con control de aspecto, `error-modal.tsx`, `button.tsx`).

### 🚀 Próximos Pasos (Hoja de Ruta)

1. **Catálogo Pro (`catalog-management`):** Implementar el tipado de variantes complejas (talles, sabores, extras) mediante esquemas JSONB nativos en la Server Action de carga.
2. **Dashboard de Analíticas (`client-radar`):** Construcción de la tabla técnica de "Neo-Compradores" recurrentes, calculando ticket promedio, recurrencia y volumen de facturación.
3. **Engine de Pedidos Avanzado (`order-engine`):** Blindaje de transacciones de compra públicas con sincronización de inventario reactivo en tiempo real y optimización del formateador de mensajes para WhatsApp.

---

## 📂 Arquitectura de Carpetas Detallada

El proyecto utiliza una organización basada en **Features Modulares** y capas de abstracción para el **Core**, garantizando alta cohesión y bajo acoplamiento:

```text
NEO-APP/
├── public/                 # Assets estáticos globales de la plataforma
├── src/
│   ├── app/                # Capa de Enrutamiento (Next.js App Router)
│   │   ├── (adminPanel)/   # Layout y vistas privadas del comercio (Clientes, Configuración, Pedidos)
│   │   ├── (auth)/         # Flujos de acceso (Login, Registro) con Server-Side Protection
│   │   └── (menuPublic)/   # Menú dinámico indexable por cliente final (/[slug])
│   │
│   ├── components/         # Componentes visuales compartidos de Infraestructura
│   │   └── ui/             # Átomos puros de diseño Neo-Brutalista (button, input, badge, image-upload)
│   │
│   ├── core/               # Núcleo técnico independiente del negocio
│   │   ├── config/         # Validadores estáticos de entorno (env.ts)
│   │   ├── lib/            # Librerías globales y utilidades transversales
│   │   │   └── supabase/   # Inicializadores de Supabase (client, server, admin, safe-query)
│   │   ├── providers/      # Contenedores de contexto global (ThemeProvider)
│   │   └── types/          # Contratos globales de TypeScript (pedido.ts)
│   │
│   └── features/           # Módulos de Lógica de Negocio Encapsulados (Actions + Components)
│       ├── admin-dashboard/# Orquestación visual de métricas del panel principal
│       ├── auth-portal/    # Componentes de UI y Server Actions estrictas de login/registro
│       ├── catalog-management/ # Lógica de gestión de productos, categorías y modificadores JSONB
│       ├── client-radar/   # Tablas técnicas y analíticas de usuarios compradores
│       ├── marketing-landing/  # Páginas estáticas optimizadas para conversión comercial de NEO
│       ├── order-engine/   # Lógica pública del carrito, persistencia en Zustand y envío
│       └── tenant-branding/# Formularios de marca, editores de horarios dinámicos y subsecciones

## ⚡ Guía de Instalación y Puesta en Marcha
Sigue estos pasos con precisión de consola para clonar y levantar NEO en tu entorno de desarrollo local de forma segura:

1. Clonar el repositorio y acceder
Abre tu terminal (PowerShell / CMD / Terminal Unix) y ejecuta:

Bash

git clone [https://github.com/LynxWiLd/URL)

2. Instalar dependencias del sistema
Asegúrate de estar utilizando Node.js (versión 18 o superior recomendada). Instala el árbol de módulos limpios:

Bash
npm install


3. Configurar variables de entorno
Crea un archivo llamado .env.local en la raíz del proyecto copiando las variables esenciales inyectadas en process-env.d.ts:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_privada_de_servicio_role
4. Certificar la consistencia del código (Linter Check)
Antes de levantar el servidor, corre el pipeline de validación para garantizar que no existan desajustes locales:

Bash
npm run lint
Deberías ver el mensaje: ✅ [NEO SYSTEM]: Codigo Impecable. Listo para produccion. 🚀

5. Levantar el entorno de desarrollo con Turbopack
Inicia el compilador optimizado de alta velocidad de Next.js:

Bash
npm run dev
La plataforma estará disponible de inmediato en http://localhost:3000.
```
