import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Upload,
} from "lucide-react";
import { createWorker } from "tesseract.js";

type ReceiptItem = {
  name: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

type ReceiptData = {
  merchant: string;
  date: string;
  time: string;
  amount: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  receiptNumber: string;
  paymentMethod: string;
  items: ReceiptItem[];
};

type ReceiptScanRecord = {
  id: string;
  merchant: string | null;
  date: string | null;
  time: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  receiptNumber: string | null;
  paymentMethod: string | null;
  category: string | null;
  amount: number | null;
  rawText: string | null;
  createdAt: string;
  items: ReceiptItem[];
};

/*
 * These are the EXISTING category IDs from your database.
 * Nothing is created, deleted, or replaced.
 */
const categoryIds: Record<string, string> = {
  Bills: "cmui62r580009m08st4jxoe7r",
  Education: "cmui62r500008m08sb6ayi7iw",
  Entertainment: "cmui62r4t0007m08sp7ifl5af",
  Food: "cmtn76w4s00007g8sfnanhzhg",
  Fuel: "cmui62r490005m08snnsdwc3a",
  Grocery: "cmui62r3n0003m08s45jdqwwd",
  Medical: "cmui62r4k0006m08soui60ll0",
  Other: "cmui62r6d000cm08sms83nkha",
  Rent: "cmui62r5z000am08sailo3fln",
  Shopping: "cmui62r2h0002m08sxp1zucwk",
  Subscriptions: "cmui62r66000bm08smv56bdd3",
  Travel: "cmui62r3z0004m08s8ytgftie",
};

const categoryRules: Record<string, string[]> = {
  Grocery: [
    "grocery",
    "supermarket",
    "rice",
    "milk",
    "bread",
    "vegetable",
    "vegetables",
    "fruit",
    "fruits",
    "wheat",
    "flour",
    "sugar",
    "salt",
    "cooking oil",
    "sunflower oil",
    "olive oil",
    "dal",
    "dairy",
    "egg",
    "eggs",
    "curd",
    "yogurt",
  ],

  Food: [
    "restaurant",
    "cafe",
    "coffee",
    "tea",
    "biryani",
    "pizza",
    "burger",
    "food",
    "meal",
    "meals",
    "dining",
    "bakery",
    "breakfast",
    "lunch",
    "dinner",
    "juice",
  ],

  Shopping: [
    "shirt",
    "shirts",
    "pant",
    "pants",
    "dress",
    "clothing",
    "shoe",
    "shoes",
    "fashion",
    "garment",
    "mall",
    "shopping",
    "t-shirt",
    "jeans",
    "apparel",
  ],

  Travel: [
    "flight",
    "airline",
    "airport",
    "bus",
    "train",
    "railway",
    "taxi",
    "cab",
    "travel",
    "uber",
    "ola",
    "booking",
    "ticket",
  ],

  Bills: [
    "electricity",
    "electric bill",
    "water bill",
    "internet",
    "broadband",
    "mobile bill",
    "recharge",
    "utility",
    "bill payment",
    "phone bill",
    "gas bill",
    "dth",
  ],

  Medical: [
    "pharmacy",
    "medical",
    "medicine",
    "medicines",
    "hospital",
    "clinic",
    "doctor",
    "tablet",
    "tablets",
    "capsule",
    "capsules",
    "prescription",
    "diagnostic",
  ],

  Entertainment: [
    "movie",
    "cinema",
    "theatre",
    "theater",
    "netflix",
    "spotify",
    "gaming",
    "game",
    "entertainment",
    "concert",
  ],
};

/*
 * Convert an image file into a cleaner image before OCR.
 *
 * Receipt photographs often contain:
 * - shadows
 * - low contrast
 * - yellow lighting
 * - small text
 *
 * Enlarging and increasing contrast makes OCR more reliable.
 */
const preprocessImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const scale = Math.min(
          3,
          Math.max(1.5, 1800 / Math.max(image.width, image.height))
        );

        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Unable to process image."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const imageData = context.getImageData(
          0,
          0,
          width,
          height
        );

        const data = imageData.data;

        /*
         * Grayscale + contrast enhancement.
         */
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];

          let gray =
            0.299 * red +
            0.587 * green +
            0.114 * blue;

          /*
           * Increase contrast around the middle range.
           */
          gray = ((gray - 128) * 1.35) + 128;

          gray = Math.max(0, Math.min(255, gray));

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        context.putImageData(imageData, 0, 0);

        const processedImage = canvas.toDataURL(
          "image/png",
          1
        );

        URL.revokeObjectURL(objectUrl);

        resolve(processedImage);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load image."));
    };

    image.src = objectUrl;
  });
};

/*
 * Clean OCR text.
 */
const cleanOcrLine = (line: string) => {
  return line
    .replace(/\s+/g, " ")
    .replace(/[|]+/g, " ")
    .trim();
};

/*
 * Determine whether a line looks like a contact,
 * invoice, GST, tax or other non-total information.
 */
const isRejectedAmountLine = (line: string) => {
  const lower = line.toLowerCase();

  const rejectedPatterns = [
    /\bphone\b/i,
    /\bmobile\b/i,
    /\btel\b/i,
    /\btelephone\b/i,
    /\bcontact\b/i,
    /\binvoice\b/i,
    /\binvoice\s*(no|number)\b/i,
    /\bbill\s*(no|number)\b/i,
    /\border\s*(no|number)\b/i,
    /\bref(erence)?\s*(no|number)\b/i,
    /\btransaction\s*(no|number)\b/i,
    /\bgstin\b/i,
    /\bgst\s*(no|number|in)\b/i,
    /\bcgst\b/i,
    /\bsgst\b/i,
    /\bigst\b/i,
    /\bsubtotal\b/i,
    /\bsub\s*total\b/i,
    /\btax\b/i,
    /\bdiscount\b/i,
    /\bchange\b/i,
    /\bcash\b/i,
    /\bcard\b/i,
    /\bupi\b/i,
    /\baccount\b/i,
    /\bifsc\b/i,
    /\bpo\s*box\b/i,
  ];

  return rejectedPatterns.some((pattern) =>
    pattern.test(lower)
  );
};

const normalizeOcrLabel = (line: string): string => {
  return line
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/5/g, "s")
    .replace(/8/g, "b")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/*
 * Extract money-like values from a line.
 */
const extractMoneyValues = (line: string): number[] => {
  /*
   * Extract normal receipt amounts.
   *
   * Examples:
   * 960
   * 960.00
   * 1,250
   * ₹960
   * Rs 960
   * INR 960
   */
  const normalized = line
    .replace(/â‚¹/g, "₹")
    .replace(/[Oo]/g, "0");

  const pattern =
    /(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;

  return [...normalized.matchAll(pattern)]
    .map((match) =>
      Number(match[1].replace(/,/g, ""))
    )
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0 &&
        value <= 100000
    );
};

const isLikelyReceiptAmount = (
  value: number
): boolean => {
  /*
   * Reject values that are much more likely to be:
   * phone numbers, GST numbers, IDs, timestamps, etc.
   */
  if (!Number.isFinite(value)) {
    return false;
  }

  if (value <= 0 || value > 100000) {
    return false;
  }

  /*
   * Receipt totals are normally not huge integer identifiers.
   * Reject obvious phone-number-sized values.
   */
  if (
    Number.isInteger(value) &&
    value >= 10000000
  ) {
    return false;
  }

  return true;
};

const isTotalLabel = (
  line: string
): boolean => {
  const normalized = line
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    /\btotal\b/.test(normalized) ||
    /\bgrand\s+total\b/.test(normalized) ||
    /\bnet\s+total\b/.test(normalized) ||
    /\btotal\s+amount\b/.test(normalized) ||
    /\bamount\s+payable\b/.test(normalized) ||
    /\bamount\s+paid\b/.test(normalized) ||
    /\bamount\s+due\b/.test(normalized) ||
    /\bbill\s+total\b/.test(normalized) ||
    /\bpayable\b/.test(normalized)
  );
};

const detectAmount = (lines: string[]): string => {
  const isTotalLine = (line: string): boolean => {
    const normalized = normalizeOcrLabel(line);

    return (
      /\b(?:grand\s+)?total\b/.test(normalized) ||
      /\b(?:net\s+)?total\b/.test(normalized) ||
      /\btotal\s+(?:amount|amt)\b/.test(normalized) ||
      /\b(?:amount|bill|final|receipt)\s+total\b/.test(normalized) ||
      /\bamount\s+(?:payable|paid|due)\b/.test(normalized) ||
      /\bbalance\s+due\b/.test(normalized) ||
      /\b(?:total\s+due|payable|final\s+amount)\b/.test(normalized) ||
      /(?:t0tal|totai|t0ta1|t0tal|tal)/.test(normalized)
    );
  };

  const findValidAmount = (line: string): number | null => {
    if (!line || isRejectedAmountLine(line)) {
      return null;
    }

    const values = extractMoneyValues(line).filter(
      isLikelyReceiptAmount
    );

    if (values.length === 0) {
      return null;
    }

    return values[values.length - 1];
  };

  const sumNearbyItemTotals = (index: number): number | null => {
    const rangeStart = Math.max(0, index - 12);
    const rangeEnd = Math.min(lines.length, index + 6);
    const itemTotals: number[] = [];

    for (let i = rangeStart; i < rangeEnd; i++) {
      const currentLine = lines[i];
      if (!currentLine || isRejectedAmountLine(currentLine)) {
        continue;
      }

      const amount = findValidAmount(currentLine);
      if (amount !== null) {
        itemTotals.push(amount);
      }
    }

    if (itemTotals.length >= 2) {
      const total = itemTotals.reduce((sum, value) => sum + value, 0);
      if (total > 0 && total <= 100000) {
        return total;
      }
    }

    return null;
  };

  for (let index = 0; index < lines.length; index++) {
    const current = lines[index];

    if (!isTotalLine(current)) {
      continue;
    }

    const directAmount = findValidAmount(current);
    if (directAmount !== null) {
      return directAmount.toFixed(2);
    }

    for (let offset = 1; offset <= 3; offset++) {
      const nextLine = lines[index + offset];
      if (!nextLine || isRejectedAmountLine(nextLine)) {
        continue;
      }

      const nextAmount = findValidAmount(nextLine);
      if (nextAmount !== null) {
        return nextAmount.toFixed(2);
      }
    }

    const nearbyTotal = sumNearbyItemTotals(index);
    if (nearbyTotal !== null) {
      return nearbyTotal.toFixed(2);
    }
  }

  for (const line of lines) {
    const normalized = normalizeOcrLabel(line);

    if (
      isRejectedAmountLine(line) ||
      !/(₹|rs\.?|inr)/i.test(line) ||
      /\b(?:subtotal|gst|tax|discount|service|delivery|change)\b/.test(normalized)
    ) {
      continue;
    }

    const amount = findValidAmount(line);
    if (amount !== null) {
      return amount.toFixed(2);
    }
  }

  for (let index = 0; index < lines.length; index++) {
    const current = lines[index];
    const normalized = normalizeOcrLabel(current);

    if (!/(t0tal|totai|tal|total)/.test(normalized)) {
      continue;
    }

    const fallbackTotal = sumNearbyItemTotals(index);
    if (fallbackTotal !== null) {
      return fallbackTotal.toFixed(2);
    }
  }

  return "";
};

/*
 * Extract a valid date.
 */
const detectDate = (text: string): string => {
  const monthNames: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    sept: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };

  const parseDate = (
    first: number,
    second: number,
    yearValue: number
  ): string => {
    let year = yearValue;
    let day = first;
    let month = second;

    if (year < 100) {
      year += 2000;
    }

    if (first <= 12 && second > 12) {
      month = first;
      day = second;
    }

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return "";
    }

    const date = new Date(
      Date.UTC(year, month - 1, day)
    );

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return "";
    }

    return `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
  };

  const patterns = [
    { type: "numeric-dmy", regex: /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/ },
    { type: "numeric-ymd", regex: /\b(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/ },
    { type: "day-month", regex: /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i },
    { type: "month-day", regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{2,4})\b/i },
  ];

  const parseLineDate = (line: string): string => {
    const cleaned = cleanOcrLine(line);

    if (
      !cleaned ||
      /\b(?:invoice|order|ref|transaction|gst|gstin|phone|mobile|tel)\b/i.test(cleaned)
    ) {
      return "";
    }

    for (const { type, regex } of patterns) {
      const match = cleaned.match(regex);
      if (!match) {
        continue;
      }

      if (type === "day-month") {
        const day = Number(match[1]);
        const month = monthNames[(match[2] ?? "").toLowerCase()] ?? 0;
        const year = Number(match[3]);

        if (month && Number.isFinite(day) && Number.isFinite(year)) {
          const date = parseDate(day, month, year);
          if (date) {
            return date;
          }
        }
        continue;
      }

      if (type === "month-day") {
        const month = monthNames[(match[1] ?? "").toLowerCase()] ?? 0;
        const day = Number(match[2]);
        const year = Number(match[3]);

        if (month && Number.isFinite(day) && Number.isFinite(year)) {
          const date = parseDate(day, month, year);
          if (date) {
            return date;
          }
        }
        continue;
      }

      const first = Number(match[1]);
      const second = Number(match[2]);
      const third = Number(match[3]);

      if (
        Number.isFinite(first) &&
        Number.isFinite(second) &&
        Number.isFinite(third)
      ) {
        const date = parseDate(first, second, third);
        if (date) {
          return date;
        }
      }
    }

    return "";
  };

  for (const line of text.split(/\r?\n/)) {
    const date = parseLineDate(line);
    if (date) {
      return date;
    }
  }

  return "";
};

/*
 * Determine merchant.
 *
 * We don't blindly use line 1 because OCR often puts:
 * - invoice numbers
 * - phone numbers
 * - dates
 * - GST information
 * before the shop name.
 */
const detectMerchant = (lines: string[]): string => {
  const rejectedMerchantPatterns = [
    /\bphone\b/i,
    /\bmobile\b/i,
    /\btel\b/i,
    /\btelephone\b/i,
    /\binvoice\b/i,
    /\bgstin\b/i,
    /\bgst\b/i,
    /\bdate\b/i,
    /\btime\b/i,
    /\bcashier\b/i,
    /\baddress\b/i,
    /\bemail\b/i,
    /\bwww\./i,
    /https?:\/\//i,
    /^\d+$/,
  ];

  for (const line of lines.slice(0, 8)) {
    const cleaned = cleanOcrLine(line);

    if (cleaned.length < 3) {
      continue;
    }

    if (rejectedMerchantPatterns.some((pattern) =>
      pattern.test(cleaned)
    )) {
      continue;
    }

    const letters = cleaned.match(/[A-Za-z]/g);

    if (!letters || letters.length < 2) {
      continue;
    }

    return cleaned;
  }

  return "";
};

const detectAddress = (lines: string[]): string => {
  const addressKeywords = [
    "street",
    "st",
    "road",
    "rd",
    "avenue",
    "ave",
    "lane",
    "ln",
    "colony",
    "sector",
    "near",
    "nagar",
    "park",
    "cross",
    "main",
    "market",
    "city",
    "pune",
    "mumbai",
    "bangalore",
    "delhi",
  ];

  const addressLines: string[] = [];

  for (const line of lines) {
    const cleaned = cleanOcrLine(line);

    if (!cleaned || cleaned.length < 8) {
      continue;
    }

    if (
      /\b(?:phone|mobile|tel|date|time|invoice|receipt|bill|total|subtotal|gst|upi|cash|card|thank|welcome)\b/i.test(cleaned) ||
      /https?:\/\//i.test(cleaned) ||
      /\bwww\./i.test(cleaned) ||
      /^\d+$/.test(cleaned)
    ) {
      continue;
    }

    const hasStreetHint = addressKeywords.some((keyword) =>
      cleaned.toLowerCase().includes(keyword)
    );
    const hasDigit = /\d/.test(cleaned);
    const letters = cleaned.match(/[A-Za-z]/g)?.length ?? 0;

    if (hasStreetHint && hasDigit && letters >= 4) {
      addressLines.push(cleaned);
    }
  }

  return addressLines.slice(0, 2).join(", ");
};

const detectPhoneNumber = (lines: string[]): string => {
  const phonePattern = /(?:\+?\d{1,3}[-\s]?)?(?:\d{3,4}[-\s]?){2,3}\d{3,4}/g;

  for (const line of lines) {
    const cleaned = cleanOcrLine(line);

    if (
      !cleaned ||
      /\b(?:date|time|invoice|receipt|bill|total|subtotal|tax|gst|upi|cash|card|website|email)\b/i.test(cleaned)
    ) {
      continue;
    }

    const matches = cleaned.match(phonePattern) ?? [];
    for (const match of matches) {
      const digits = match.replace(/\D/g, "");
      if (digits.length >= 8 && digits.length <= 15) {
        return match.trim();
      }
    }
  }

  return "";
};

const detectWebsite = (lines: string[]): string => {
  const websitePattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

  for (const line of lines) {
    const match = line.match(websitePattern);
    if (match) {
      return match[0].replace(/[.,;]+$/, "").trim();
    }
  }

  return "";
};

const detectTime = (text: string): string => {
  const timePattern = /\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/g;
  const matches = text.match(timePattern) ?? [];

  for (const match of matches) {
    const normalized = match.trim();
    if (/\d{1,2}:\d{2}/.test(normalized)) {
      return normalized;
    }
  }

  return "";
};

const detectReceiptNumber = (lines: string[]): string => {
  const labelPatterns = [
    /\b(?:bill|receipt|invoice|order|transaction|ref|reference)\s*(?:no|number|#)?\s*[:#-]?\s*([A-Za-z0-9-]{1,20})/i,
    /\b(?:bill|receipt|invoice|order|transaction|ref|reference)\s*[:#-]\s*([A-Za-z0-9-]{1,20})/i,
  ];

  for (const line of lines) {
    const cleaned = cleanOcrLine(line);
    if (!cleaned) {
      continue;
    }

    for (const pattern of labelPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 1 && !/^\d{1,2}[:/.-]\d{1,2}[:/.-]\d{2,4}$/.test(value)) {
          return value;
        }
      }
    }
  }

  return "";
};

const detectPaymentMethod = (lines: string[]): string => {
  const paymentPatterns = [
    /\b(?:credit\s+card|debit\s+card|card)\b/i,
    /\b(?:cash)\b/i,
    /\b(?:upi|gpay|phonepe|paytm|bharatpe)\b/i,
    /\b(?:net\s+banking|banking)\b/i,
    /\b(?:wallet)\b/i,
  ];

  for (const line of lines) {
    const cleaned = cleanOcrLine(line);
    if (!cleaned) {
      continue;
    }

    for (const pattern of paymentPatterns) {
      if (pattern.test(cleaned)) {
        return cleaned.replace(/^[^A-Za-z]+/, "").trim();
      }
    }
  }

  return "";
};

const parseItemLine = (line: string): ReceiptItem | null => {
  const cleaned = cleanOcrLine(line);

  if (!cleaned || cleaned.length < 3) {
    return null;
  }

  if (
    /^(?:item|items|description|product|qty|price|total|subtotal|gst|tax|discount|payment|cash|card|upi|thank|welcome)/i.test(cleaned) ||
    /\b(?:total|subtotal|tax|discount|gst|balance|paid|payable|change|cash|card|upi)\b/i.test(cleaned)
  ) {
    return null;
  }

  const patterns = [
    /^(.+?)\s+(?:x\s*)?(\d{1,3})\s*(?:x\s*)?(\d{1,6}(?:[.,]\d{1,2})?)\s*(\d{1,6}(?:[.,]\d{1,2})?)?$/i,
    /^(.+?)\s+(\d{1,3})\s+(\d{1,6}(?:[.,]\d{1,2})?)\s*(\d{1,6}(?:[.,]\d{1,2})?)?$/i,
    /^(.+?)\s+[-–]\s*(\d{1,3})\s*(?:x\s*)?(\d{1,6}(?:[.,]\d{1,2})?)\s*(\d{1,6}(?:[.,]\d{1,2})?)?$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (!match) {
      continue;
    }

    const name = match[1].trim();
    const qtyValue = Number((match[2] ?? "0").replace(/,/g, ""));
    const unitValue = Number((match[3] ?? "0").replace(/,/g, ""));
    const lineValue = Number((match[4] ?? String(unitValue)).replace(/,/g, ""));

    if (!name || !Number.isFinite(qtyValue) || !Number.isFinite(unitValue)) {
      continue;
    }

    if (qtyValue <= 0 || unitValue <= 0 || qtyValue > 500 || unitValue > 100000) {
      continue;
    }

    return {
      name,
      quantity: qtyValue.toString(),
      unitPrice: unitValue.toFixed(2),
      lineTotal: lineValue.toFixed(2),
    };
  }

  return null;
};

const extractItems = (lines: string[]): ReceiptItem[] => {
  const candidates: ReceiptItem[] = [];

  for (const line of lines) {
    const item = parseItemLine(line);
    if (item) {
      candidates.push(item);
    }
  }

  return candidates.slice(0, 50);
};

const analyzeReceipt = (
  text: string,
  lines: string[],
  detectedMerchant: string,
  detectedDate: string,
  detectedAmount: string
): Omit<ReceiptData, "category"> => {
  const merchant = detectedMerchant || "";
  const address = detectAddress(lines);
  const phone = detectPhoneNumber(lines);
  const website = detectWebsite(lines);
  const receiptNumber = detectReceiptNumber(lines);
  const time = detectTime(text);
  const paymentMethod = detectPaymentMethod(lines);
  const items = extractItems(lines);

  return {
    merchant,
    date: detectedDate,
    time,
    amount: detectedAmount,
    address,
    phone,
    website,
    receiptNumber,
    paymentMethod,
    items,
  };
};

/*
 * Category detection.
 *
 * We count actual keyword evidence and require a clear
 * winner. If the evidence is weak/ambiguous, return "".
 */
const detectCategory = (
  text: string,
  merchant: string
): string => {
  const searchableText = `${merchant} ${text}`
    .toLowerCase()
    .replace(/[^a-z0-9₹.\s-]/g, " ");

  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(
    categoryRules
  )) {
    let score = 0;

    for (const keyword of keywords) {
      const escapedKeyword = keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const pattern = new RegExp(
        `\\b${escapedKeyword}\\b`,
        "i"
      );

      if (pattern.test(searchableText)) {
        /*
         * Longer/more specific phrases get more weight.
         */
        score += keyword.includes(" ")
          ? 2
          : 1;
      }
    }

    scores[category] = score;
  }

  const sorted = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  );

  const best = sorted[0];
  const second = sorted[1];

  if (!best || best[1] === 0) {
    return "";
  }

  /*
   * Require a clear winner.
   */
  if (
    second &&
    best[1] === second[1]
  ) {
    return "";
  }

  return best[0];
};

export default function Scan() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [ocrText, setOcrText] =
    useState("");

  const [ocrWarning, setOcrWarning] =
    useState("");

  const [ocrHistory, setOcrHistory] =
    useState<ReceiptScanRecord[]>([]);

  const [selectedScanId, setSelectedScanId] =
    useState<string | null>(null);

  const lastPersistedScanRef =
    useRef<string>("");

  const [receipt, setReceipt] =
    useState<ReceiptData>({
      merchant: "",
      date: "",
      time: "",
      amount: "",
      category: "",
      address: "",
      phone: "",
      website: "",
      receiptNumber: "",
      paymentMethod: "",
      items: [],
    });

  const loadOcrHistory = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/ocr-scans"
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setOcrHistory(result.data);
        if (!selectedScanId && result.data.length > 0) {
          setSelectedScanId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load OCR history", error);
    }
  };

  const persistOcrHistory = async (payload: {
    merchant: string;
    date: string;
    time: string;
    address: string;
    phone: string;
    website: string;
    receiptNumber: string;
    paymentMethod: string;
    category: string;
    amount: string;
    rawText: string;
    items: ReceiptItem[];
  }) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/ocr-scans",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "cmtkcqppm0000z48sh1aes087",
            merchant: payload.merchant || null,
            date: payload.date || null,
            time: payload.time || null,
            address: payload.address || null,
            phone: payload.phone || null,
            website: payload.website || null,
            receiptNumber: payload.receiptNumber || null,
            paymentMethod: payload.paymentMethod || null,
            category: payload.category || null,
            amount: payload.amount ? Number(payload.amount) : null,
            rawText: payload.rawText || null,
            items: payload.items,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save OCR scan");
      }

      const latest = result.data as ReceiptScanRecord;
      setOcrHistory((current) => [latest, ...current.filter((entry) => entry.id !== latest.id)].slice(0, 12));
      setSelectedScanId(latest.id);
    } catch (error) {
      console.error("OCR history save failed", error);
    }
  };

  useEffect(() => {
    void loadOcrHistory();
  }, []);

  const processReceipt = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
    setIsSaved(false);
    setIsProcessing(true);
    setOcrText("");
    setOcrWarning("");

    try {
      /*
       * Preprocess image before OCR.
       */
      const processedImage =
        await preprocessImage(file);

      const worker =
        await createWorker("eng");

      const result =
        await worker.recognize(processedImage);

      const text =
        result.data.text || "";

      await worker.terminate();

      console.log(
        "PREPROCESSED OCR TEXT:",
        text
      );

      setOcrText(text);

      const lines = text
        .split(/\r?\n/)
        .map(cleanOcrLine)
        .filter(
          (line) => line.length > 0
        );

      /*
       * Extract fields independently.
       */
      const detectedMerchant =
        detectMerchant(lines);

      const detectedDate =
        detectDate(text);

      const detectedAmount =
        detectAmount(lines);

      const analysis = analyzeReceipt(
        text,
        lines,
        detectedMerchant,
        detectedDate,
        detectedAmount
      );

      const detectedCategory =
        detectCategory(
          text,
          detectedMerchant
        );

      const readableCharacters =
        text.replace(
          /[^a-zA-Z0-9]/g,
          ""
        ).length;

      const hasMerchant =
        detectedMerchant.length > 2;

      const hasDate =
        detectedDate.length > 0;

      const hasAmount =
        detectedAmount.length > 0;

      const hasCategory =
        detectedCategory.length > 0;

      let warning = "";

      if (readableCharacters < 15) {
        warning =
          "Receipt is not clear enough to read. Please upload a clearer image.";
      } else if (!hasMerchant) {
        warning =
          "Merchant name could not be read clearly. Please enter it manually.";
      } else if (!hasAmount) {
        warning =
          "The receipt total could not be identified clearly. Please enter the amount manually.";
      } else if (!hasDate) {
        warning =
          "The receipt date could not be identified clearly. Please enter the date manually.";
      } else if (!hasCategory) {
        warning =
          "The category could not be determined reliably. Please select the category manually.";
      }

      setOcrWarning(warning);

      const finalReceiptState = {
        ...analysis,
        category: detectedCategory,
      };

      setReceipt(finalReceiptState);

      if (text.trim() && text !== lastPersistedScanRef.current) {
        lastPersistedScanRef.current = text;
        await persistOcrHistory({
          merchant: finalReceiptState.merchant,
          date: finalReceiptState.date,
          time: finalReceiptState.time,
          address: finalReceiptState.address,
          phone: finalReceiptState.phone,
          website: finalReceiptState.website,
          receiptNumber: finalReceiptState.receiptNumber,
          paymentMethod: finalReceiptState.paymentMethod,
          category: finalReceiptState.category,
          amount: finalReceiptState.amount,
          rawText: text,
          items: finalReceiptState.items,
        });
      }
    } catch (error) {
      console.error(
        "OCR failed:",
        error
      );

      setOcrWarning(
        "Unable to read this receipt reliably. Please upload a clearer image."
      );

      alert(
        "Unable to read the receipt. Please try a clearer image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      processReceipt(file);
    }
  };

  const handleSave = async () => {
    const amount =
      Number(receipt.amount);

    const categoryId =
      categoryIds[receipt.category];

    if (!receipt.merchant.trim()) {
      alert(
        "Merchant name is required."
      );
      return;
    }

    if (!receipt.date) {
      alert(
        "Receipt date is required."
      );
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert(
        "Please enter a valid amount."
      );
      return;
    }

    if (
      !receipt.category ||
      !categoryId
    ) {
      alert(
        "Please select a valid category."
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/transactions",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amount,
              description:
                receipt.merchant.trim(),
              date: receipt.date,
              type: "EXPENSE",
              userId:
                "cmtkcqppm0000z48sh1aes087",
              categoryId,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to save transaction"
        );
      }

      console.log(
        "Transaction saved:",
        result.data
      );

      setIsSaved(true);

      alert(
        "Receipt transaction saved successfully."
      );
    } catch (error) {
      console.error(
        "Save transaction failed:",
        error
      );

      alert(
        "Failed to save transaction. Make sure the backend is running."
      );
    }
  };

  const resetScan = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setIsSaved(false);
    setIsProcessing(false);
    setOcrText("");
    setOcrWarning("");

    setReceipt({
      merchant: "",
      date: "",
      time: "",
      amount: "",
      category: "",
      address: "",
      phone: "",
      website: "",
      receiptNumber: "",
      paymentMethod: "",
      items: [],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Scan Receipt
        </h1>

        <p className="mt-1 text-[var(--muted)]">
          Upload or capture a receipt to
          extract transaction details.
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[var(--primary)] dark:bg-blue-950/40">
            <FileText size={30} />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Upload your receipt
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Drag and drop an image here,
            or choose an option below.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              <Upload size={18} />
              Upload Receipt
            </button>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold">
              <Camera size={18} />
              Take Photo

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    processReceipt(file);
                  }
                }}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
            <ImageIcon size={14} />
            JPG, PNG or other image formats
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEFT: PREVIEW */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">
                Receipt Preview
              </h2>

              <button
                onClick={resetScan}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <RotateCcw size={16} />
                Scan Again
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-black/5">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-[600px] w-full object-contain"
              />
            </div>

            {isProcessing && (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />

                  <div>
                    <p className="font-medium">
                      Reading receipt...
                    </p>

                    <p className="text-xs text-[var(--muted)]">
                      Improving image quality and
                      extracting receipt information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isProcessing &&
              ocrText && (
                <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                    View detected OCR text
                  </summary>

                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap border-t border-[var(--border)] p-4 text-xs text-[var(--muted)]">
                    {ocrText}
                  </pre>
                </details>
              )}

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <h3 className="mb-3 text-sm font-semibold">
                OCR History
              </h3>

              {ocrHistory.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No OCR scans yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {ocrHistory.map((scan) => (
                    <button
                      key={scan.id}
                      type="button"
                      onClick={() => setSelectedScanId(scan.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        selectedScanId === scan.id
                          ? "border-[var(--primary)] bg-[var(--muted-bg)]"
                          : "border-[var(--border)] bg-[var(--card)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[var(--foreground)]">
                          {scan.merchant || "Unknown merchant"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          {scan.date || "Unknown date"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {scan.category || "Uncategorized"} · ₹{scan.amount ?? "0"}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedScanId && (
                (() => {
                  const selectedScan = ocrHistory.find((scan) => scan.id === selectedScanId);
                  if (!selectedScan) {
                    return null;
                  }

                  return (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                        Selected OCR details
                      </div>

                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Merchant:</span> {selectedScan.merchant || ""}</div>
                        <div><span className="font-medium">Date:</span> {selectedScan.date || ""}</div>
                        <div><span className="font-medium">Time:</span> {selectedScan.time || ""}</div>
                        <div><span className="font-medium">Amount:</span> {selectedScan.amount ? `₹${selectedScan.amount}` : ""}</div>
                        <div><span className="font-medium">Category:</span> {selectedScan.category || ""}</div>
                      </div>

                      {selectedScan.rawText && (
                        <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--background)] p-3 text-[11px] text-[var(--muted)]">
                          {selectedScan.rawText}
                        </pre>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-semibold">
              Extracted Details
            </h2>

            {ocrWarning && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-semibold">
                  Please check the extracted information
                </p>

                <p className="mt-1">
                  {ocrWarning}
                </p>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {receipt.category && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                  <span className="font-medium text-[var(--muted)]">Category:</span>{" "}
                  <span className="font-semibold text-[var(--foreground)]">{receipt.category}</span>
                </div>
              )}

              {/* MERCHANT */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Merchant
                </label>

                <input
                  type="text"
                  value={receipt.merchant}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      merchant:
                        event.target.value,
                    })
                  }
                  placeholder="Merchant name"
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date
                </label>

                <input
                  type="date"
                  value={receipt.date}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      date:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* TIME */}
              {receipt.time && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Time
                  </label>

                  <input
                    type="text"
                    value={receipt.time}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        time: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* ADDRESS */}
              {receipt.address && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>

                  <input
                    type="text"
                    value={receipt.address}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        address: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* PHONE */}
              {receipt.phone && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={receipt.phone}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        phone: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* WEBSITE */}
              {receipt.website && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Website
                  </label>

                  <input
                    type="text"
                    value={receipt.website}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        website: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* RECEIPT NUMBER */}
              {receipt.receiptNumber && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Receipt Number
                  </label>

                  <input
                    type="text"
                    value={receipt.receiptNumber}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        receiptNumber: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* PAYMENT METHOD */}
              {receipt.paymentMethod && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Payment Method
                  </label>

                  <input
                    type="text"
                    value={receipt.paymentMethod}
                    onChange={(event) =>
                      setReceipt({
                        ...receipt,
                        paymentMethod: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              {/* AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={receipt.amount}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      amount:
                        event.target.value,
                    })
                  }
                  placeholder="Enter receipt total"
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />

                {!receipt.amount &&
                  !isProcessing && (
                    <p className="mt-2 text-xs text-amber-600">
                      Total could not be identified
                      automatically. Enter it manually.
                    </p>
                  )}
              </div>

              {receipt.items.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Items
                  </label>

                  <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    {receipt.items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[var(--card)] px-3 py-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-[var(--foreground)]">
                            {item.name}
                          </div>
                          <div className="text-[var(--muted)]">
                            Qty {item.quantity} · ₹{item.unitPrice}
                          </div>
                        </div>
                        <div className="font-semibold text-[var(--foreground)]">
                          ₹{item.lineTotal}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={receipt.category}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      category:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Grocery">
                    Grocery
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Travel">
                    Travel
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Medical">
                    Medical
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Fuel">
                    Fuel
                  </option>

                  <option value="Rent">
                    Rent
                  </option>

                  <option value="Subscriptions">
                    Subscriptions
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

                {!receipt.category &&
                  !isProcessing && (
                    <p className="mt-2 text-xs text-amber-600">
                      Category could not be determined
                      reliably. Please select one.
                    </p>
                  )}
              </div>

              {/* SAVE */}
              <button
                onClick={handleSave}
                disabled={
                  isProcessing || isSaved
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2
                      size={18}
                    />
                    Saved
                  </>
                ) : (
                  <>Save Transaction</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}