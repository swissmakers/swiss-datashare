-- CreateTable
CREATE TABLE "UserContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "UserContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserContact_userId_email_key" ON "UserContact"("userId", "email");

-- CreateIndex
CREATE INDEX "UserContact_userId_idx" ON "UserContact"("userId");

-- CreateIndex
CREATE INDEX "UserContact_userId_name_idx" ON "UserContact"("userId", "name");

-- CreateIndex
CREATE INDEX "UserContact_userId_email_idx" ON "UserContact"("userId", "email");
