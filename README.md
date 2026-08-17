# Auto Care Genius — Control de horarios

App interna para que el equipo marque entrada/salida (clock in/out) y para que el admin
gestione trabajadores, les asigne horarios y analice las horas trabajadas.

Stack: Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL.

## Desarrollo local

1. Copiá `.env.example` a `.env` y completá `DATABASE_URL` (Postgres local o de Railway) y `JWT_SECRET`.
2. Instalá dependencias y aplicá el schema:

   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run seed
   ```

   `seed` crea el primer usuario admin (usuario/contraseña definidos en `.env`, por defecto `admin` / `admin123`).

3. Levantá el servidor:

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

## Deploy en Railway

1. Creá un servicio Postgres en el proyecto de Railway y un servicio para esta app apuntando a este repo.
2. En el servicio de la app, configurá las variables de entorno:
   - `DATABASE_URL` → referenciá la del plugin de Postgres (`${{Postgres.DATABASE_URL}}`).
   - `JWT_SECRET` → un string aleatorio largo.
3. Railway detecta Next.js automáticamente (Nixpacks) y corre `npm run build`.
4. El comando `npm start` corre `prisma migrate deploy` antes de levantar el server, así las migraciones se aplican en cada deploy.
5. Para crear el primer admin en producción, corré una vez desde la consola de Railway (o localmente contra el `DATABASE_URL` de producción):

   ```bash
   npm run seed
   ```

## Modelo de datos

- **User**: trabajadores y admins (`role`: `ADMIN` | `EMPLOYEE`).
- **TimeEntry**: cada marca de entrada/salida. Un registro con `clockOut = null` es el turno activo del usuario.
- **Schedule**: horario semanal esperado por trabajador (día + hora entrada/salida), lo setea el admin.

## Estructura

- `/login` — login con usuario/contraseña.
- `/dashboard` — vista del trabajador: botón de marcar entrada/salida + su historial.
- `/admin` — reportes: horas trabajadas vs. programadas, filtrable por trabajador y rango de fechas.
- `/admin/employees` — alta y gestión de trabajadores.
- `/admin/schedules` — asignación de horarios semanales.
