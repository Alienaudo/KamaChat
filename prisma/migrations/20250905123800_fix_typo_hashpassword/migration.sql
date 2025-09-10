/*
  Warnings:

  - You are about to drop the column `hased_password` on the `User` table. All the data in the column will be lost.
  - Added the required column `hashed_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "hased_password",
ADD COLUMN     "hashed_password" VARCHAR(255) NOT NULL;
