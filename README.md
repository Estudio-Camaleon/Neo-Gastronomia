## 🚀 Cómo empezar

1. Requisitos previos
   Node.js (v18 o superior recomendado).

Git.

Una cuenta en Supabase.

2. Instalación
   Bash

# Clonar el repositorio

git clone <tu-url-del-repositorio>

# Entrar a la carpeta

cd neo-app

# Instalar dependencias

npm install

3. Configuración de variables de entorno
   Crea un archivo .env.local en la raíz del proyecto basándote en el archivo .env.example:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

4. Ejecución en desarrollo
   Bash
   npm run dev
   Luego, abre http://localhost:3000 en tu navegador.

## Notas para el equipo (Estudio Camaleón):

No toques lib/supabase/server.ts a menos que sea estrictamente necesario para cambios en la autenticación. Es el núcleo de seguridad.

Uso de componentes: Siempre verifica si estás en un componente de cliente ("use client") antes de elegir la importación:

import { supabase } from "@/lib/supabase/client" (Cliente)

import { createClient } from "@/lib/supabase/server" (Servidor)

CSS: Estamos utilizando Tailwind CSS. Si agregas componentes nuevos, mantén la consistencia usando las clases de utilidades existentes (espaciados, colores, bordes).

## Estructura Actual de Carpetas

neo-app/
├── app/
│ ├── (auth)/ # Rutas de autenticación (Login/Registro)
│ │ ├── login/page.tsx
│ │ └── registro/page.tsx
│ ├── (adminPanel)/ # Rutas privadas (Admin, Productos, Config)
│ │ ├── admin/
│ │ │ ├── loading.tsx
│ │ │ └── page.tsx # Server Component (usa lib/supabase/server)
│ │ ├── configuracion/
│ │ │ └── page.tsx
│ │ ├── productos/
│ │ │ └── page.tsx
│ │ └── layout.tsx # Contiene el Sidebar (Client Component)
│ ├── (public)/ # Vista pública del catálogo
│ │ ├── [slug]/
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── globals.css
│ ├── layout.tsx # Layout raíz global
│ └── page.tsx # Landing Page principal
├── components/
│ ├── auth/ # Formularios de acceso
│ ├── adminPanel/ # Componentes del panel (Sidebar, Tablas, Forms)
│ ├── menu/ # Componentes de la vista pública
│ └── shared/ # Navbar/Footer globales
├── lib/
│ ├── supabase/
│ │ ├── client.ts # Para "use client" (Navegador)
│ │ └── server.ts # Para Server Components (Cookies/Auth)
│ ├── schemas.ts # Validaciones
│ └── utils.ts # Utilidades generales
└── middleware.ts # Protección de rutas

## Tecnologías y Herramientas

El proyecto está construido bajo una arquitectura moderna centrada en el rendimiento y la seguridad, utilizando Next.js 16 (App Router) y Supabase.

1. Stack Tecnológico
   Framework: Next.js 16 (App Router) - Utilizado por su capacidad de renderizado híbrido (Server/Client Components) y optimización SEO.

Autenticación y Backend: Supabase - Provee la base de datos (PostgreSQL), autenticación de usuarios y almacenamiento.

Gestión de Sesión: @supabase/ssr - Librería oficial para manejar la autenticación en el servidor y sincronizarla con el cliente mediante cookies.

Estilos: Tailwind CSS - Framework de utilidades para un diseño rápido, responsivo y mantenible.

2. Herramientas Clave
   TypeScript: Garantiza la seguridad de tipos en todo el código, reduciendo bugs en tiempo de ejecución.

Middleware: Implementado para proteger rutas privadas (/admin, /productos, /configuracion) asegurando que solo usuarios autenticados tengan acceso.

Route Groups: Estructura de carpetas ((auth), (adminPanel), (public)) para organizar el proyecto sin afectar la estructura de URLs.

3. Arquitectura del Cliente vs. Servidor
   Para evitar conflictos de sesión y optimizar la carga, se separaron las responsabilidades:

Server Components (lib/supabase/server.ts): Utilizados para lectura de datos y protección de rutas. Acceden directamente a cookies() de Next.js.

Client Components (lib/supabase/client.ts): Utilizados para formularios e interactividad, gestionando el estado de la sesión directamente en el navegador.
