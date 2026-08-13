# Bingo Bekeff 2026

Sistema de venta y gestión de entradas para el Bingo Bekeff. Incluye una
interfaz pública de compra (mobile-first) y un panel de administración
privado para verificar pagos, numerar entradas y registrar el ingreso el
día del evento.

Pensado como un pequeño sistema reutilizable: si el Bingo vuelve a
realizarse el año próximo, alcanza con crear un nuevo `Event` en la base de
datos (nombre, fecha, precios, link de Mercado Pago) — no hace falta tocar
código.

Las decisiones de arquitectura y el modelo de datos completos están
documentados en [`.claude/plans/elegant-chasing-snail.md`](.claude/plans/elegant-chasing-snail.md).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
· Prisma 7 + PostgreSQL · React Hook Form + Zod · TanStack Table + TanStack
Query · Zustand · bcryptjs + jose (auth propia) · Railway (deploy).

## Requisitos

- Node.js 20+
- PostgreSQL 14+ corriendo localmente (o accesible por `DATABASE_URL`)

## Setup local

```bash
npm install
cp .env.example .env
```

Completá `.env`:

- `DATABASE_URL`: conexión a tu Postgres local.
- `AUTH_SECRET`: generar con `openssl rand -hex 32`.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`: credenciales del admin que crea el seed.
- `MERCADO_PAGO_LINK`: link de pago del evento (se puede editar después desde la base).
- `MERCADO_PAGO_ACCESS_TOKEN`: token privado para crear checkouts de Mercado Pago.
- `NEXT_PUBLIC_PAYMENT_PROVIDER`: `transfer`, `mercadopago` o `both`.
- `NEXT_PUBLIC_APP_URL`: URL pública del sitio, necesaria para volver desde el checkout.
- `UPLOADS_DIR`: carpeta local donde se guardan los comprobantes (por defecto `./uploads`).

Luego:

```bash
npx prisma migrate dev   # crea las tablas
npm run db:seed          # crea el evento "Bingo Bekeff 2026" + el admin inicial
npm run dev
```

- Sitio público: http://localhost:3000
- Panel admin: http://localhost:3000/admin/login (con `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

### Scripts útiles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + `prisma migrate deploy` + `next build` |
| `npm run db:migrate` | Nueva migración en desarrollo (`prisma migrate dev`) |
| `npm run db:seed` | Corre `prisma/seed.ts` |
| `npm run db:studio` | Abre Prisma Studio para editar datos a mano |
| `npm run lint` | ESLint |

## Arquitectura del código

```
prisma/schema.prisma          Modelo de datos (Event, Purchase, Ticket, TicketSequence, AdminUser)
prisma/seed.ts                Seed: evento activo + admin inicial

src/app/                      Rutas (App Router)
  page.tsx                    Landing pública
  reservar/                   Wizard de compra (5 pasos) + pago + comprobante
  confirmacion/[code]/        Página de agradecimiento
  admin/login/                Login (fuera del layout autenticado)
  admin/(protected)/          Dashboard, Compras, Ingreso — protegidos por middleware
  api/uploads/[...path]/      Sirve comprobantes (solo admin logueado)

src/components/
  landing/  wizard/  admin/   Componentes de UI por área
  shared/                     Logo, Money, StatusBadge — reutilizados en todo el sitio
  ui/                         Primitivas shadcn/ui

src/lib/                      Utilidades sin estado: precios, numeración de tickets,
                               código de compra, auth (JWT + bcrypt), storage de archivos,
                               schemas de Zod
src/server/
  actions/                    Server Actions ("use server") — mutaciones
  services/                   Lecturas de Prisma reutilizadas por Server Components
src/store/wizard-store.ts     Estado del wizard de compra (Zustand + sessionStorage)
src/middleware.ts             Protege /admin/* verificando la cookie de sesión
```

## Flujo de compra

1. **Landing → Reservar**: pasos "Tus datos", "Entradas", "Asistentes" y
   "Aporte voluntario" viven enteramente en el cliente (Zustand +
   sessionStorage), sin tocar la base — así no quedan compras a medio
   completar en el panel admin.
2. **Resumen**: al confirmar, recién ahí se crea la `Purchase` (estado
   `PENDING`) con un código público (`BK26-XXXXXX`).
3. **Pago**: por defecto muestra transferencia bancaria. Si activás Mercado
   Pago con `NEXT_PUBLIC_PAYMENT_PROVIDER`, aparece un botón de prueba que
   crea y reutiliza un checkout por compra.
4. **Comprobante**: sube el archivo, que se guarda en `UPLOADS_DIR` y se
   asocia a la compra.
5. **Confirmación**: página de agradecimiento con el código y el total.

## Panel de administración

- **Dashboard**: compras totales/pendientes/confirmadas, entradas
  ingresadas, total esperado y total confirmado.
- **Compras**: tabla con buscador y paginado (TanStack Table). El detalle de
  cada compra permite **Confirmar pago** (asigna número de entrada de forma
  atómica por evento+categoría: `A-0001`, `M-0001`, `G-0001`, sin
  reutilizarse nunca) o **Rechazar**.
- **Ingreso**: buscador reactivo (TanStack Query) por nombre, número de
  entrada o código de compra, con botón "Registrar ingreso" inmediato.

No se envían emails en ningún paso del flujo (confirmación, rechazo,
ingreso): todo se refleja solo en el panel.

## Cómo probar Mercado Pago

1. Cargá un token de prueba o sandbox en `MERCADO_PAGO_ACCESS_TOKEN`.
2. Cambiá `NEXT_PUBLIC_PAYMENT_PROVIDER` a `mercadopago` o `both`.
3. Verificá que `NEXT_PUBLIC_APP_URL` apunte a tu dominio local o de Railway.
4. Abrí una compra pendiente en `/reservar/pago/[code]`.
5. Confirmá que aparezca el botón `Probar Mercado Pago`.
6. Abrí el checkout de prueba y completá el pago con una cuenta sandbox.
7. Revisá que la compra conserve `mercadoPagoPreferenceId` y
   `mercadoPagoCheckoutUrl` para no regenerar el link.

## Despliegue en Railway

1. **Crear el servicio Postgres**: "New" → "Database" → "PostgreSQL" dentro
   del mismo proyecto de Railway.
2. **Crear el servicio de la app** apuntando a este repo. Railway detecta
   Next.js automáticamente (Nixpacks) y corre `npm install`, `npm run
   build` y `npm start`.
3. **Variables de entorno** del servicio de la app (Settings → Variables):
   - `DATABASE_URL` → referenciar la del plugin: `${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `MERCADO_PAGO_LINK`
   - `MERCADO_PAGO_ACCESS_TOKEN` y `NEXT_PUBLIC_PAYMENT_PROVIDER` cuando
     quieras habilitar o probar Mercado Pago
   - `NEXT_PUBLIC_APP_URL` → la URL pública que asigna Railway
   - `UPLOADS_DIR` → `/data/uploads` (ver paso siguiente)
4. **Volume persistente para comprobantes**: en el servicio de la app,
   Settings → Volumes → crear uno montado en `/data/uploads`. Sin esto, los
   comprobantes subidos se perderían en cada redeploy.
5. **Primer deploy**: `npm run build` ya corre `prisma migrate deploy`, así
   que las tablas se crean solas. Después del primer deploy, correr una vez
   `npm run db:seed` (Railway → servicio → "Run command", o vía `railway
   run npm run db:seed` con la CLI) para crear el evento y el admin inicial.

## Reutilizar el sistema para un futuro evento

Todo lo específico del Bingo 2026 vive en la tabla `Event`, no en el código:

- nombre, fecha y descripción del evento
- precios por categoría (adulto/menor/niño) y montos sugeridos de aporte voluntario
- link de Mercado Pago
- checkout de Mercado Pago generado por compra, si está habilitado
- logo (`logoUrl`)

Para un nuevo evento: crear un nuevo registro `Event` con `isActive: true` y
desactivar el anterior (o reutilizar el mismo, editando sus campos) desde
Prisma Studio (`npm run db:studio`). La numeración de entradas es por
evento, así que cada edición arranca limpia en `A-0001` / `M-0001` /
`G-0001`.

## Notas

- `npm audit` reporta vulnerabilidades altas en `postcss` y `sharp`, ambas
  dependencias transitivas empaquetadas dentro de `next@15.5.x` (afectan
  herramientas de build, no rutas expuestas al usuario). Se resuelven recién
  al saltar a Next 16, lo cual está fuera del alcance de este stack
  (`Next.js 15` fue un requisito explícito). Vale la pena revisar
  `npm audit` periódicamente y evaluar el upgrade cuando el ecosistema
  (shadcn/ui, etc.) lo soporte con la misma madurez.
