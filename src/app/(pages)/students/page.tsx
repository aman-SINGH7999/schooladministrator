'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Ellipsis, FunnelX, Plus, Search } from 'lucide-react'
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
import { IUser } from '@/types/user';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { IAxiosErrorResponse, isAxiosError } from '@/types/axios';
import SelectFilter from '@/components/SelectFilter';



export default function Page() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<string>("");
  const [standard, setStandard] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [students, setStudents] = useState<IUser[]>([]);
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    standard: "",
    section: "",
    dob: "",
    gender: "",
    moreInfo: "",
  });
  const [rollSuffix, setRollSuffix] = useState(""); // Only user input suffix
  
  
  const school = useAppSelector((state)=> state.auth.school);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const fetchStudents = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
    });
    if (searchValue) params.append("searchValue", searchValue);
    if (section) params.append("section", section);
    if (standard) params.append("standard", standard);

    const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
    const res = await axios.get(`${server_url}/api/schools/${school?._id}/students?${params.toString()}`, { withCredentials: true });
    setStudents(res.data.students);
    console.log("Data: ",res.data)
    setTotalPages(res.data.pagination.totalPages);
  } catch (err) {
    console.log("Error in fetching data: ", err);
  } finally {
    setLoading(false);
  }
}
useEffect(() => {
  console.log("School: ", school);
  if(school?._id){
    fetchStudents();
  }
}, [page, standard, section, school]);



  const handleFilter = async ()=>{
    setPage(1);
    fetchStudents();
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
      const res = await axios.post(`${server_url}/api/schools/${school?._id}/students`, form, { withCredentials:true });

      if (res.data.success) {
        toast.success("Student registered successfully");
        await fetchStudents();
        setOpen(false);

        setForm({
          name: "",
          rollNo: "",
          standard: "",
          section: "",
          dob: "",
          gender: "",
          moreInfo: "",
        });
      }
    } catch (err: unknown) {
      let message = "Error in register Student";
            if (isAxiosError<IAxiosErrorResponse>(err) && err.response?.data?.error) {
              message = err.response.data.error;
            } else if (err instanceof Error) {
              message = err.message;
            }
            setError(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {/* Filters, Search and other Options */}
      <Card className="flex flex-col md:flex-row p-2 lg:p-5 gap-3 md:gap-5 justify-center md:items-center">
        <div className='flex flex-col sm:flex-row gap-3 md:items-center'>
          {/* State */}
          <div className="w-full md:w-48">
            <ComboBox
              label=""
              value={standard}
              onChange={(val) => setStandard(val)}
              options={["LKG","UKG", "1st Standard", "2nd Standard", "3rd Standard", "4th Standard", "5th Standard", "6th Standard", "7th Standard", "8th Standard", "9th Standard", "10th Standard", "11th Standard", "12th Standard"]}
              placeholder="Select Standard"
            />
          </div>

          {/* Section */}
          <div className="w-full md:w-48">
            <ComboBox
              label=""
              value={section}
              onChange={(val) => setSection(val)}
              options={["A", "B", "C", "D", "E"]}
              placeholder={standard ? "Select Section" : "Select Class first"}
              disabled={!standard}
            />
          </div>
          
          {/* Clear / All button + Search */}
          <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap"
              onClick={() => {setStandard(""); setSection(""); setSearchValue("")}}
          > 
              <FunnelX  />
              Clear Filters
          </Button>
        </div>
      
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            value={searchValue}
            onChange={(e)=> setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search Students here..."
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
            Register Students
          </Button>
        </div>
      </Card>


       {/* Table data */}
       <Card className='p-2 mt-5'>
        <Table>
          <TableCaption>{loading ? "Loading..." : "A list of registered students"} </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          {
            loading ? <TableSkeleton rows={5} columns={7} /> :
            <TableBody>
              {students.map((student)=>{
                  return (
                    <TableRow key={student?._id? student?._id.toString() : student.rollNo}>
                      <TableCell><Checkbox className='cursor-pointer' /></TableCell>
                      <TableCell><Link href={`/schools/${student._id}`} className='text-sky-800 font-medium'>{student?.name}</Link></TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student?.student?.standard}</TableCell>
                      <TableCell>{student?.student?.section}</TableCell>
                      <TableCell>{student?.student?.dob ? new Date(student?.student?.dob).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{"2"}</TableCell>
                      <TableCell>{"80%"}</TableCell>
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
            {/* Student Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className='mb-1'>Student Name</Label>
              <Input id="name" type='text' name="name" value={form.name} onChange={handleChange} required />
            </div>

            {/* Standard */}
            <div className="md:col-span-1">
              <ComboBox
                label=""
                value={form.standard}
                onChange={(val)=> setForm({ ...form, standard: val })}
                options={["LKG","UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]}
                placeholder="Select Standard"
              />
            </div>

            {/* Section */}
            <div >
              <ComboBox
                label=""
                value={form.section}
                onChange={(val)=> setForm({ ...form, section: val })}
                options={["A", "B", "C", "D", "E"]}
                placeholder={form?.standard ? "Select Section" : "Select Class first"}
                disabled={!form?.standard}
              />
            </div>

            {/* Roll No */}
            <div>
              <Label className='mb-1' htmlFor="rollNo">Roll No.</Label>
              <Input
                type="text"
                id="rollNo"
                name="rollNo"
                value={rollSuffix ? `${school?.schoolCode}-${rollSuffix}` : `${school?.schoolCode}-`}
                onChange={(e) => {
                  // Remove prefix if user tries to type it
                  const val = e.target.value.replace(`${school?.schoolCode}-`, "");
                  setRollSuffix(val);
                  setForm({ ...form, rollNo: `${school?.schoolCode}-${val}` });
                }}
                required
                placeholder="Enter Roll No e.g. 01"
              />
            </div>


            {/* Date of Birth */}
            <div >
              <Label className='mb-1' htmlFor="dob">DOB</Label>
              <Input type="date" id="dob" name="dob" value={form.dob} onChange={handleChange} required />
            </div>

            {/* Gender */}
            <SelectFilter label="Select Gender" values={["Male", "Female", "Other"]} onChange={(val) => setForm({ ...form, gender: val })}  />
           

            {/* Error / Success */}
            <div className="md:col-span-2">
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Registering..." : "Register Student"}
              </Button>
            </div>
          </form>
      </Modal>
    </>
  )
}

