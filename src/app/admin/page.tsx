import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const allRegistrations = await db.query.registrations.findMany({
    orderBy: [desc(registrations.createdAt)],
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Registration Entries</h1>
            <p className="text-slate-500 mt-2">Manage and view all incoming camp registrations.</p>
          </div>
          <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            Total Entries: <span className="text-blue-600 font-bold ml-1">{allRegistrations.length}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Child Name</TableHead>
                <TableHead>Age / Grade</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Reading Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-16">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <span className="text-4xl">📭</span>
                       <span>No registrations found yet.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                allRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="cursor-default hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-600">{new Date(reg.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{reg.parentName}</TableCell>
                    <TableCell className="font-semibold text-blue-900">{reg.childName}</TableCell>
                    <TableCell className="text-slate-600">
                      {Math.floor((new Date().getTime() - new Date(reg.dateOfBirth).getTime()) / 31557600000)}y / {reg.classGrade}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-slate-700">{reg.contactNumber}</span>
                        {reg.whatsappGroup && <span className="ml-2 inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800 tracking-wide uppercase">WA</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        {reg.preferredBatch?.split(' ')[0] || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-600" title={reg.readingLevel}>{reg.readingLevel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
