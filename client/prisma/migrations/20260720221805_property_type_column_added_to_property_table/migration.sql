/*
  Warnings:

  - Added the required column `type` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'LAND');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "type" "PropertyType" NOT NULL;
