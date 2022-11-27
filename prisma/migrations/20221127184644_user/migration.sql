-- CreateTable
CREATE TABLE "Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "definition" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL
);
