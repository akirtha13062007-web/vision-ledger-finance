-- CreateTable
CREATE TABLE "ReceiptScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "merchant" TEXT,
    "date" TEXT,
    "time" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "receiptNumber" TEXT,
    "paymentMethod" TEXT,
    "category" TEXT,
    "amount" REAL,
    "rawText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReceiptScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceiptScanItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptScanId" TEXT NOT NULL,
    "name" TEXT,
    "quantity" TEXT,
    "unitPrice" TEXT,
    "lineTotal" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReceiptScanItem_receiptScanId_fkey" FOREIGN KEY ("receiptScanId") REFERENCES "ReceiptScan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
