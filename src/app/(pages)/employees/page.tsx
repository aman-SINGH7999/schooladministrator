'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Ellipsis, Plus, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import axios from "axios";
import { ComboBox } from '@/components/SearchableDropdown';
import { TableSkeleton } from '@/components/Skeletons';
import { SchoolEmployeeData } from '@/data';
import { IUser } from '@/types/user';
import SelectFilter from '@/components/SelectFilter';
import CheckBoxButtons from '@/components/CheckBoxButtons';

export default function Page() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<IUser[]>([]);
  const [filters, setFilters] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    subjects: [] as string[],
    department: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (searchValue) params.append("searchValue", searchValue); 

      const res = await axios.get(`/api/schools?${params.toString()}`, { withCredentials: true });
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.log("Error in fetching data: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    setEmployees(SchoolEmployeeData);
    setFilteredEmployees(SchoolEmployeeData);
  }, [page]);

  // 🧠 Main filtering logic
  const handleFilter = () => {
    let filtered = [...employees];

    // 1️⃣ Filter by role
    if (filters.includes("Teachers")) {
      filtered = filtered.filter((emp) => emp.role.toLowerCase() === "teacher");
    } else if (filters.includes("Staff")) {
      filtered = filtered.filter((emp) => emp.role.toLowerCase() === "staff");
    }

    // 2️⃣ Filter by status (active)
    if (filters.includes("Status")) {
      filtered = filtered.filter((emp) => emp.isActive);
    }

    // 3️⃣ Search by name, email, subject, or department
    if (searchValue.trim() !== "") {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter((emp) => {
        const nameMatch = emp.name.toLowerCase().includes(search);
        const emailMatch = emp.email!.toLowerCase().includes(search);
        const deptOrSubject =
          emp.role === "teacher"
            ? emp.teacher?.subjectSpecialization?.join(", ").toLowerCase()
            : emp.staff?.department?.toLowerCase();
        const deptMatch = deptOrSubject?.includes(search);
        return nameMatch || emailMatch || deptMatch;
      });
    }

    setFilteredEmployees(filtered);
  };

  // 🔁 Auto filter whenever filters or search change (optional live filter)
  useEffect(() => {
    const timeout = setTimeout(() => handleFilter(), 600);
    return () => clearTimeout(timeout);
  }, [filters, searchValue, employees]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await axios.post("/api/schools", form, { withCredentials: true });

      if (res.data.success) {
        setSuccess("School registered successfully!");
        setOpen(false);
        setForm({
        name: "",
        email: "",
        phone: "",
        gender: "",
        role: "",
        subjects: [],
        department: "",
      });
      }
    } catch (err: unknown) {
      let message = "Error in register school";
      if (err instanceof Error) message = err.message;
      setError(message || "Error in register school");
    } finally {
      setLoading(false);
    }
  };

  // --- subject select ---
  const handleSelect = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects
        : [...prev.subjects, subject],
    }));
  };

  const handleFilterChange = (selected: string[]) => {
    setFilters(selected);
  };

  return (
    <>
      {/* Filters, Search and other Options */}
      <Card className="flex flex-col p-2 lg:p-5 md:flex-row gap-3 md:gap-5 justify-center md:items-center">
        <CheckBoxButtons
          options={["Teachers", "Staff", "Status"]}
          onChange={handleFilterChange}
        />

        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search Employee here..."
            className="flex-1 min-w-[100px]"
          />
        </div>

        {/* Register Employee */}
        <div className="w-full md:w-auto">
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register Employee
          </Button>
        </div>
      </Card>

      {/* Table data */}
      <Card className="p-2 mt-5">
        <Table>
          <TableCaption>
            {loading ? "Loading..." : "List of employees"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Select</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department / Subject</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : (
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No matching employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id || employee.name}>
                    <TableCell>
                      <Checkbox className="cursor-pointer" />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/schools/${employee._id}`}
                        className="text-sky-800 font-medium"
                      >
                        {employee.name}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee?.profile?.phone || "N/A"}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {employee.isActive ? "Active ✅" : "Not Active ❌"}
                    </TableCell>
                    <TableCell>
                      {employee.role === "teacher"
                        ? employee?.teacher?.subjectSpecialization?.join(", ") ||
                          "N/A"
                        : employee.role === "staff"
                        ? employee?.staff?.department || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell className="float-right pr-5">
                      <Ellipsis className="cursor-pointer hover:bg-gray-300 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          )}
        </Table>
      </Card>

      {/* Pagination */}
      <div className="pb-5">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modal form */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Register Employee"
        className="w-[700px] m-1 md:m-0"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-scroll"
        >
          {/* Employee Name */}
          <div className="md:col-span-2">
            <Label htmlFor="name" className="mb-1">Employee Name</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          {/* Email */}
          <div>
            <Label className="mb-1" htmlFor="email">Email</Label>
            <Input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          {/* Phone */}
          <div>
            <Label className="mb-1" htmlFor="phone">Phone</Label>
            <Input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          {/* Role */}
          <div>
            <SelectFilter label="Select Role" values={["Teacher", "Staff"]} onChange={(val) => setForm({ ...form, role: val })} />
          </div>

          {/* Gender */}
          <div>
            <SelectFilter label="Select Gender" values={["Male", "Female", "Other"]} onChange={(val) => setForm({ ...form, gender: val })} />
          </div>

          {/* Subjects */}
          {form.role === "Teacher" && (
            <div className="md:col-span-2">
              <div className="flex justify-between">
                <div className="text-sm text-gray-700">
                  <strong>Subjects:</strong> {form.subjects.length > 0 ? form.subjects.join(", ") : "None selected"}
                </div>
                <X onClick={() => setForm({ ...form, subjects: [] })} size={20} className="mr-2 cursor-pointer" />
              </div>

              <ComboBox
                label=""
                value={selectedSubject}
                onChange={(val: string) => {
                  setSelectedSubject(val);
                  handleSelect(val);
                }}
                options={["Maths", "Science", "English", "History", "Computer"]}
                placeholder="Select Subjects"
              />
            </div>
          )}

          {/* Department */}
          {form.role === "Staff" && (
            <div>
              <SelectFilter
                label="Select Department"
                values={["Accountant", "Manager", "Other"]}
                onChange={(val) => setForm({ ...form, department: val })}
              />
            </div>
          )}


          {/* More info */}
          <div className="md:col-span-2">
            <Label className="mb-1" htmlFor="address">
              More Info
            </Label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} />
          </div>

          {/* Error / Success */}
          <div className="md:col-span-2">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Registering..." : "Register Employee"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
