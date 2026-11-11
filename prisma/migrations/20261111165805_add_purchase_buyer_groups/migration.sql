-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "buyerGroups" TEXT[] DEFAULT ARRAY[]::TEXT[];
