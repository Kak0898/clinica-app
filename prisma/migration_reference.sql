-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateTable: Especialidad
CREATE TABLE "Especialidad" (
    "id"          SERIAL       NOT NULL,
    "nombre"      TEXT         NOT NULL,
    "descripcion" TEXT         NOT NULL,
    "icono"       TEXT         NOT NULL,
    "activo"      BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Especialidad_nombre_key" ON "Especialidad"("nombre");

-- CreateTable: Doctor
CREATE TABLE "Doctor" (
    "id"               SERIAL       NOT NULL,
    "nombre"           TEXT         NOT NULL,
    "apellido"         TEXT         NOT NULL,
    "avatarIniciales"  TEXT         NOT NULL,
    "avatarColor"      TEXT         NOT NULL,
    "avatarColorText"  TEXT         NOT NULL,
    "activo"           BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "especialidadId"   INTEGER      NOT NULL,
    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HorarioDoctor
CREATE TABLE "HorarioDoctor" (
    "id"               SERIAL  NOT NULL,
    "diaSemana"        INTEGER NOT NULL,
    "horaInicio"       TEXT    NOT NULL,
    "horaFin"          TEXT    NOT NULL,
    "intervaloMinutos" INTEGER NOT NULL DEFAULT 30,
    "activo"           BOOLEAN NOT NULL DEFAULT true,
    "doctorId"         INTEGER NOT NULL,
    CONSTRAINT "HorarioDoctor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HorarioDoctor_doctorId_diaSemana_key"
    ON "HorarioDoctor"("doctorId", "diaSemana");

-- CreateTable: Cita
CREATE TABLE "Cita" (
    "id"                 SERIAL         NOT NULL,
    "fecha"              DATE           NOT NULL,
    "hora"               TEXT           NOT NULL,
    "codigoConfirmacion" TEXT           NOT NULL,
    "estado"             "EstadoCita"   NOT NULL DEFAULT 'PENDIENTE',
    "pacienteNombre"     TEXT           NOT NULL,
    "pacienteRut"        TEXT           NOT NULL,
    "pacienteTelefono"   TEXT           NOT NULL,
    "pacienteEmail"      TEXT           NOT NULL,
    "prevision"          TEXT           NOT NULL DEFAULT 'No indicada',
    "createdAt"          TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3)   NOT NULL,
    "doctorId"           INTEGER        NOT NULL,
    "especialidadId"     INTEGER        NOT NULL,
    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cita_codigoConfirmacion_key" ON "Cita"("codigoConfirmacion");
CREATE UNIQUE INDEX "Cita_doctorId_fecha_hora_key"  ON "Cita"("doctorId", "fecha", "hora");

-- AddForeignKeys
ALTER TABLE "Doctor"        ADD CONSTRAINT "Doctor_especialidadId_fkey"
    FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HorarioDoctor" ADD CONSTRAINT "HorarioDoctor_doctorId_fkey"
    FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Cita"          ADD CONSTRAINT "Cita_doctorId_fkey"
    FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Cita"          ADD CONSTRAINT "Cita_especialidadId_fkey"
    FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
