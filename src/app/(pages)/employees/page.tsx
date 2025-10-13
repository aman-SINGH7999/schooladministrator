'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Ellipsis, Plus, Search, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [role, setRole] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [filters, setFilters] = useState<string[]>([]);



  const [form, setForm] = useState({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
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
    // if (class) params.append("city", city);
    // if (state) params.append("state", state);

    const res = await axios.get(`/api/schools?${params.toString()}`, { withCredentials: true });
    // setEmployee(res.data.data);
    setTotalPages(res.data.pagination.totalPages);
  } catch (err) {
    console.log("Error in fetching data: ", err);
  } finally {
    setLoading(false);
  }
}
useEffect(() => {
  fetchSchools();
  setEmployees(SchoolEmployeeData);
}, [page]);



  const handleFilter = async ()=>{
    setPage(1);
    fetchSchools();
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await axios.post("/api/schools", form);

      if (res.data.success) {
        setSuccess("School registered successfully!");
        setOpen(false);
        setForm({
          name: "",
          owner: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
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


    const handleSelect = (subject: string) => {
    // Duplicate avoid karne ke liye
    setSubjects((prev) =>
      prev.includes(subject) ? prev : [...prev, subject]
    );
  };

  const handleFilterChange = (selected: string[]) => {
    setFilters(selected);
    console.log("Selected filters:", selected);
  };

  return (
    <>

      {/* Filters, Search and other Options */}
      <Card className='p-2 lg:p-5'>
        <Tabs defaultValue='All' className="flex flex-col md:flex-row gap-3 md:gap-5 justify-center md:items-center">
        <CheckBoxButtons
          options={["Teachers", "Staff", "Admin"]}
          onChange={handleFilterChange}
        />
      
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            value={searchValue}
            onChange={(e)=> setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search Employee here..."
            className="flex-1 min-w-[100px]"
          />

          <Button onClick={handleFilter} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Register School */}
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
      </Tabs>
      </Card> 


       {/* Table data */}
       <Card className='p-2 mt-5'>
        <Table>
          <TableCaption>{loading ? "Loading..." : "A list of your recent invoices."} </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          {
            loading ? <TableSkeleton rows={5} columns={7} /> :
            <TableBody>
              {employees.map((employee)=>{
                  return (
                    <TableRow key={employee?._id? employee?._id.toString() : employee.name}>
                      <TableCell><Checkbox className='cursor-pointer' /></TableCell>
                      <TableCell><Link href={`/schools/${employee._id}`} className='text-sky-800 font-medium'>{employee.name}</Link></TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee?.profile?.phone ? employee?.profile?.phone : "N/A"}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee?.isActive ? "Active" : "Not Active"}</TableCell>
                      <TableCell>{employee.role === 'teacher' ? employee?.teacher?.subjectSpecialization : employee.role === 'staff' ? employee.staff?.department : "N/A"}</TableCell>
                      <TableCell className="float-right pr-5">
                        <Ellipsis className='cursor-pointer hover:bg-gray-300 rounded-xl' />
                      </TableCell>
                    </TableRow>
                  )
                }) 
              }
            </TableBody>
          }
        </Table>
       </Card>

       {/* Pagination */}
       <div className='pb-5'>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
       </div>
        
        {/* Modal form */}
       <Modal isOpen={open} onClose={() => setOpen(false)} title="Register School" className='w-[700px] m-1 md:m-0'>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[90vh] overflow-y-scroll">
            {/* Employee Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className='mb-1'>Employee Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>

            {/* Email */}
            <div >
              <Label className='mb-1' htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
            </div>

            {/* Phone */}
            <div >
              <Label className='mb-1' htmlFor="phone">Phone</Label>
              <Input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>

            {/* Role */}
            <div className="">
              <SelectFilter
                label="Select Role"
                values={["Teacher", "Staff"]}
                onChange={(val)=>setRole(val)}
              />
            </div>

            {/* Gender */}
            <div className="">
              <SelectFilter
                label="Select Gender"
                values={["Male", "Female", "Other"]}
                onChange={(val)=>setGender(val)}
              />
            </div>

            {/* Subjects */}
            <div className='md:col-span-2'>
              <div className='flex justify-between'>
                {/* Display selected subjects */}
                <div className="text-sm text-gray-700">
                  <strong>Subjects:</strong>{" "}
                  {subjects.length > 0 ? subjects.join(", ") : "None selected"}
                </div>
                <X onClick={()=>setSubjects([])} size={20} className='mr-2 cursor-pointer' />
                {/* <Button variant='ghost' ></Button> */}
              </div>

              {/* ComboBox select */}
              <ComboBox
                label=""
                value={selectedSubject}
                onChange={(val: string) => {
                  setSelectedSubject(val);
                  handleSelect(val);
                }}
                options={["Maths", "Science", "English", "History", "Computer"]}
                placeholder="Select Subjects"
                disabled= {role !== "Teacher"}
                
              />
            </div>

            {/* Department */}
            <div className="">
              <SelectFilter
                label="Select Department"
                values={["Accountant", "Manager", "Other"]}
                onChange={(val)=>setDepartment(val)}
                disabled={role !== "Staff"}
              />
            </div>

            {/* More info */} 
            <div className="md:col-span-2">
              <Label className='mb-1' htmlFor="address">More Info</Label> 
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
                {loading ? "Registering..." : "Register School"}
              </Button>
            </div>
          </form>
      </Modal>
    </>
  )
}

