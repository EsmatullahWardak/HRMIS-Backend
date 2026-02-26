-- CreateTable
CREATE TABLE "ShiftChange" (
    "id" SERIAL NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "currentShift" TEXT NOT NULL,
    "requestedShift" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftChange_pkey" PRIMARY KEY ("id")
);
