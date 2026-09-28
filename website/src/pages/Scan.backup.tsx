import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Upload,
} from "lucide-react";
import { createWorker } from "tesseract.js";

type ReceiptData = {
  merchant: string;
  date: string;
  amount: string;
  category: string;
};

export default function Scan() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrWarning, setOcrWarning] = useState("");

  const [receipt, setReceipt] = useState<ReceiptData>({
    merchant: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "Grocery",
  });

  const processReceipt = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
    setIsSaved(false);
    setIsProcessing(true);
    setOcrText("");
    setOcrWarning("");

    try {
      const worker = await createWorker("eng");

      const result = await worker.recognize(file);
      const text = result.data.text;

      await worker.terminate();

      console.log("OCR TEXT:", text);
      setOcrText(text);

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // -----------------------------
// Merchant detection
// -----------------------------
const detectedMerchant =
  lines.length > 0 ? lines[0] : "";


// -----------------------------
// Amount detection
// -----------------------------
// Do NOT simply choose the largest number.
// Phone numbers, invoice numbers, GST numbers,
// barcodes and other long numbers can appear on receipts.

const totalKeywords = [
  "grand total",
  "net total",
  "total amount",
  "amount payable",
  "amount paid",
  "bill total",
  "total",
];

const ignoredKeywords = [
  "phone",
  "mobile",
  "tel",
  "telephone",
  "invoice",
  "invoice no",
  "bill no",
  "gstin",
  "gst no",
  "tax",
  "cgst",
  "sgst",
  "igst",
  "subtotal",
  "sub total",
  "cash",
  "change",
];

const numberPattern =
  /(?:₹|Rs\.?|INR)?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/gi;

let detectedAmount = "";

for (const line of lines) {
  const lowerLine = line.toLowerCase();

  const isTotalLine = totalKeywords.some((keyword) =>
    lowerLine.includes(keyword)
  );

  const isIgnoredLine = ignoredKeywords.some((keyword) =>
    lowerLine.includes(keyword)
  );

  if (!isTotalLine || isIgnoredLine) {
    continue;
  }

  const matches = line.match(numberPattern);

  if (matches && matches.length > 0) {
    const possibleAmounts = matches
      .map((value) =>
        Number(value.replace(/[^\d.]/g, ""))
      )
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value > 0 &&
          value < 1000000
      );

    if (possibleAmounts.length > 0) {
      detectedAmount =
        possibleAmounts[possibleAmounts.length - 1].toFixed(2);

      break;
    }
  }
}


// -----------------------------
// Date detection
// -----------------------------
const dateMatch = text.match(
  /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/
);

let detectedDate = "";

if (dateMatch) {
  const day = dateMatch[1].padStart(2, "0");
  const month = dateMatch[2].padStart(2, "0");

  let year = dateMatch[3];

  if (year.length === 2) {
    year = `20${year}`;
  }

  detectedDate = `${year}-${month}-${day}`;
}


// -----------------------------
// Category detection
// -----------------------------
// Determine category from words found in the
// merchant/items/receipt text.

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
    "oil",
    "dal",
    "dairy",
    "egg",
    "eggs",
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
    "hotel",
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
  ],

  Travel: [
    "flight",
    "airline",
    "hotel",
    "booking",
    "bus",
    "train",
    "taxi",
    "cab",
    "travel",
    "uber",
    "ola",
  ],

  Bills: [
    "electricity",
    "water bill",
    "internet",
    "broadband",
    "mobile bill",
    "recharge",
    "utility",
    "bill payment",
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
    "capsule",
  ],

  Entertainment: [
    "movie",
    "cinema",
    "theatre",
    "theater",
    "netflix",
    "spotify",
    "game",
    "gaming",
    "entertainment",
  ],
};

const searchableText = text.toLowerCase();

let detectedCategory = "Other";
let bestCategoryScore = 0;

for (const [category, keywords] of Object.entries(
  categoryRules
)) {
  let score = 0;

  for (const keyword of keywords) {
    if (searchableText.includes(keyword)) {
      score++;
    }
  }

  if (score > bestCategoryScore) {
    bestCategoryScore = score;
    detectedCategory = category;
  }
}


// -----------------------------
// Receipt quality
// -----------------------------
const readableCharacters = text
  .replace(/[^a-zA-Z0-9]/g, "")
  .length;

const hasMerchant = detectedMerchant.trim().length > 2;
const hasDate = detectedDate !== "";
const hasAmount = detectedAmount !== "";

const hasUsefulText = readableCharacters >= 15;

const qualityMessage =
  !hasUsefulText
    ? "Receipt is not clear enough to read. Please upload a clearer image."
    : !hasAmount
      ? "Some receipt information could not be read clearly. Please check the amount before saving."
      : bestCategoryScore === 0
        ? "The receipt was read, but the category could not be determined reliably. Please select the category."
        : "";

if (qualityMessage) {
  console.warn("OCR:", qualityMessage);
}if (qualityMessage) {
  console.warn("OCR:", qualityMessage);
  setOcrWarning(qualityMessage);
} else {
  setOcrWarning("");
}

setReceipt({
  merchant: hasMerchant ? detectedMerchant : "",
  date: detectedDate,
  amount: detectedAmount,
  category: detectedCategory,
});
    } catch (error) {
      console.error("OCR failed:", error);
      alert("Unable to read the receipt. Please try another image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      processReceipt(file);
    }
  };
const handleSave = async () => {
  const amount = Number(receipt.amount);

  if (!receipt.merchant.trim()) {
    alert("Merchant name is required.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description: receipt.merchant,
          date: receipt.date,
          type: "EXPENSE",
          userId: "cmtkcqppm0000z48sh1aes087",
          categoryId: "cmui62r3n0003m08s45jdqwwd",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to save transaction"
      );
    }

    console.log("Transaction saved:", result.data);

    setIsSaved(true);

    alert("Receipt transaction saved successfully.");
  } catch (error) {
    console.error("Save transaction failed:", error);

    alert("Failed to save transaction. Make sure the backend is running.");
  }
};

  const resetScan = () => {
    setPreview(null);
    setIsSaved(false);
    setIsProcessing(false);
    setOcrText("");

    setReceipt({
      merchant: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "Grocery",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Scan Receipt
        </h1>

        <p className="mt-1 text-[var(--muted)]">
          Upload or capture a receipt to extract transaction details.
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(event) => event.preventDefault()}
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
            Drag and drop an image here, or choose an option below.
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
                  const file = event.target.files?.[0];

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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Receipt Preview</h2>

              <button
                onClick={resetScan}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <RotateCcw size={16} />
                Scan Again
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-[500px] w-full object-contain"
              />
            </div>

            {isProcessing && (
              <p className="mt-4 text-center text-sm text-[var(--muted)]">
                Reading receipt with OCR...
              </p>
            )}

            {!isProcessing && ocrText && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  View detected OCR text
                </summary>

                <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-gray-100 p-4 text-xs dark:bg-gray-900">
                  {ocrText}
                </pre>
              </details>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-semibold">
              Extracted Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Merchant
                </label>

                <input
                  value={receipt.merchant}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      merchant: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                  placeholder="Merchant name"
                />
              </div>

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
                      date: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Amount
                </label>

                <input
                  type="number"
                  value={receipt.amount}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      amount: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={receipt.category}
                  onChange={(event) =>
                    setReceipt({
                      ...receipt,
                      category: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                >
                  <option value="Grocery">Grocery</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Medical">Medical</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 size={18} />
                    Saved
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Save Transaction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}