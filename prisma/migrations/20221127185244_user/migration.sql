/*
  Warnings:

  - Added the required column `term` to the `Term` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL
);
INSERT INTO "new_Term" ("authorId", "cardId", "definition", "id") SELECT "authorId", "cardId", "definition", "id" FROM "Term";
DROP TABLE "Term";
ALTER TABLE "new_Term" RENAME TO "Term";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
