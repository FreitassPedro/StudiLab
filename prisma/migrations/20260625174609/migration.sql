/*
  Warnings:

  - You are about to drop the column `github` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "github",
DROP COLUMN "linkedin",
DROP COLUMN "twitter",
DROP COLUMN "website",
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'midnight',
ADD COLUMN     "webSite" TEXT;
