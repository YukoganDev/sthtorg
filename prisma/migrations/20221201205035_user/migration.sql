/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Card_name_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPreferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageScale" INTEGER NOT NULL DEFAULT 1,
    "colorTheme" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL
);
INSERT INTO "new_UserPreferences" ("id", "pageScale") SELECT "id", "pageScale" FROM "UserPreferences";
DROP TABLE "UserPreferences";
ALTER TABLE "new_UserPreferences" RENAME TO "UserPreferences";
CREATE UNIQUE INDEX "UserPreferences_id_key" ON "UserPreferences"("id");
CREATE TABLE "new_Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "star" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Term" ("authorId", "cardId", "definition", "id", "term") SELECT "authorId", "cardId", "definition", "id", "term" FROM "Term";
DROP TABLE "Term";
ALTER TABLE "new_Term" RENAME TO "Term";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Card_id_key" ON "Card"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
