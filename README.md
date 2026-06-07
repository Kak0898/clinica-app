# Clínica Central — Backend API

## Setup inicial

### 1. Variables de entorno
Crea un archivo `.env` en la raíz:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/clinica_db"
NODE_ENV="development"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear la base de datos en PostgreSQL
```sql
CREATE DATABASE clinica_db;
```

### 4. Correr migraciones
```bash
npm run db:migrate
# Te pedirá un nombre para la migración, ej: "init"
```

### 5. Generar el cliente de Prisma
```bash
npm run db:generate
```

### 6. Cargar datos iniciales (seed)
```bash
npm run db:seed
```

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en desarrollo con hot-reload |
| `npm run build` | Compila TypeScript a JS |
| `npm start` | Corre el build de producción |
| `npm run db:migrate` | Crea y aplica nueva migración (desarrollo) |
| `npm run db:migrate:prod` | Aplica migraciones pendientes (producción) |
| `npm run db:seed` | Carga datos iniciales |
| `npm run db:reset` | Resetea la BD y re-corre seed |
| `npm run db:studio` | Abre Prisma Studio (UI visual de la BD) |

---

## Modelos

### Especialidad
- `id`, `nombre` (unique), `descripcion`, `icono` (nombre tabler), `activo`

### Doctor
- `id`, `nombre`, `apellido`, `avatarIniciales`, `avatarColor`, `avatarColorText`
- `especialidadId` → FK a Especialidad
- `activo`

### HorarioDoctor
- Define qué días y en qué rango horario trabaja un doctor
- `diaSemana`: 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie
- `horaInicio` / `horaFin`: formato "HH:MM"
- `intervaloMinutos`: cada cuántos minutos hay un slot (default 30)
- Unique: `(doctorId, diaSemana)`

### Cita
- Datos del paciente + FK a Doctor y Especialidad
- `estado`: PENDIENTE | CONFIRMADA | CANCELADA | COMPLETADA
- `codigoConfirmacion`: generado al crear (único)
- Unique: `(doctorId, fecha, hora)` → no permite doble reserva

---

## Próximo paso: endpoints REST

```
GET  /api/especialidades
POST /api/especialidades
PUT  /api/especialidades/:id
DEL  /api/especialidades/:id

GET  /api/doctores?especialidadId=
POST /api/doctores
PUT  /api/doctores/:id
DEL  /api/doctores/:id

GET  /api/doctores/:id/slots?fecha=YYYY-MM-DD

GET  /api/citas
POST /api/citas
PUT  /api/citas/:id/cancelar
```
