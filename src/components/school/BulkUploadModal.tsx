'use client';
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  schoolId?: string;
  schoolCode?: string;
  onSuccess?: () => void;
};

type RawRow = {
  name?: string;
  rollNo?: string;
  standard?: string;
  section?: string;
  dob?: string;
  gender?: string;
  moreInfo?: string;
};


// ✅ Excel date parser: returns "YYYY-MM-DD" (not ISO string)
function parseExcelDate(value: any): string {
  if (!value) return "";
  
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}





// ✅ Normalize gender field
function normalizeGender(g: string = ""): "male" | "female" | "other" {
  const val = g.trim().toLowerCase();
  if (["m", "male"].includes(val)) return "male";
  if (["f", "female"].includes(val)) return "female";
  return "other";
}

// ✅ Format helpers
const formatStandard = (std: string) => {
  const num = parseInt(std);
  if (isNaN(num) || num < 1 || num > 12) {
    throw new Error(`Invalid standard: ${std}`);
  }
  return String(num).padStart(2, "0"); // always 2 digits
};

const formatRollSuffix = (suffix: string) => {
  const num = parseInt(suffix);
  if (isNaN(num) || num < 1 || num > 99) {
    throw new Error(`Invalid roll number: ${suffix}`);
  }
  return String(num).padStart(2, "0"); // always 2 digits
};

export default function BulkUploadModal({
  isOpen,
  onClose,
  schoolId,
  schoolCode,
  onSuccess,
}: Props) {
  const [rows, setRows] = useState<RawRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Handle Excel file
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "", raw: false });

        const normalized: RawRow[] = json.map((r) => {
          const keys = Object.keys(r).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = (r[key] || "").toString().trim();
            return acc;
          }, {} as Record<string, string>);

          const name = keys["name"] || "";
          const rawRoll = keys["rollno"] || keys["roll"] || "";
          const standard = formatStandard(keys["standard"] || "");
          const section = (keys["section"] || "").toUpperCase();
          const dob = parseExcelDate(keys["dob"]);
          const gender = normalizeGender(keys["gender"]);
          const moreInfo = keys["moreinfo"] || "";

          if (!schoolCode) throw new Error("Missing schoolCode");

          const rollSuffix = formatRollSuffix(rawRoll);
          const rollNo = `${schoolCode}-${standard}${section}-${rollSuffix}`;

          return { name, rollNo, standard, section, dob, gender, moreInfo };
        });

        setRows(normalized);
        toast.success(`${normalized.length} rows loaded successfully`);
      } catch (err) {
        console.error("File parse error:", err);
        toast.error("Failed to parse file. Check your Excel format.");
      }
    };

    reader.readAsArrayBuffer(file);
    e.currentTarget.value = ""; // allow re-upload of same file
  };

  // ✅ Validate each row
  const validateRow = (r: RawRow): string | null => {
    if (!r.name?.trim()) return "Missing name";
    if (!r.rollNo?.trim()) return "Missing rollNo";
    if (!r.standard?.trim()) return "Missing standard";
    if (!r.section?.trim()) return "Missing section";
    if (!r.dob?.trim()) return "Missing dob";
    if (!r.gender?.trim()) return "Missing gender";

    const d = new Date(r.dob);
    if (isNaN(d.getTime())) return "Invalid DOB format";
    if (d > new Date()) return "DOB cannot be in the future";

    return null;
  };

  // ✅ Upload valid rows
  const handleUpload = async () => {
    if (!schoolId) return toast.error("School not selected");
    if (rows.length === 0) return toast.error("No rows loaded");

    const errors: { index: number; error: string }[] = [];
    const validRows: RawRow[] = [];

    rows.forEach((r, idx) => {
      const err = validateRow(r);
      if (err) errors.push({ index: idx + 1, error: err });
      else validRows.push(r);
    });

    if (errors.length > 0) {
      console.error("Validation errors:", errors.slice(0, 20));
      toast.error(`Found ${errors.length} invalid rows. Check console for details.`);
      return;
    }

    setLoading(true);
    try {
      const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
      const res = await axios.post(
        `${server_url}/api/schools/${schoolId}/students/bulk`,
        { students: validRows },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(`${res.data.count} students registered successfully`);
        setRows([]);
        onSuccess?.();
        onClose();
      } else {
        const msg = res.data?.error || res.data?.message || "Bulk upload failed";
        toast.error(msg);
        console.error("Bulk upload response:", res.data);
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      toast.error("Bulk upload failed (network/server)");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Students"
      className="w-[800px]"
    >
      <div className="space-y-4">
        <div>
          <Label>Download sample template</Label>
          <a
            className="text-sm text-sky-600 block mb-2"
            href="/templates/students_template.xlsx"
            download
          >
            Download students_template.xlsx
          </a>

          <Label>Upload file (.xlsx or .csv)</Label>
          <Input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFile}
            disabled={loading}
          />
        </div>

        {rows.length > 0 && (
          <div className="max-h-60 overflow-auto border rounded p-2">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Std</th>
                  <th>Sec</th>
                  <th>DOB</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i % 2 ? "bg-gray-50" : ""}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.rollNo}</td>
                    <td>{r.standard}</td>
                    <td>{r.section}</td>
                    <td>
                      {r.dob ? new Date(r.dob).toLocaleDateString() : "-"}
                    </td>
                    <td>{r.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setRows([]);
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || rows.length === 0}
            className="bg-green-600 text-white"
          >
            {loading ? "Uploading..." : "Upload & Register"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
