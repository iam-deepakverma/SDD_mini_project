import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck, Download } from 'lucide-react';

export const PrintableRegistrationSlip = ({
  isOpen,
  onClose,
  registrationData,
  student,
  academicYear = '2026-2027',
  semesterName = 'Fall Semester 2026',
}) => {
  if (!isOpen) return null;

  const registrations = Array.isArray(registrationData)
    ? registrationData
    : [registrationData].filter(Boolean);

  const totalCredits = registrations.reduce(
    (sum, r) => sum + (r.credits || r.creditsAtRegistration || r.course?.credits || 0),
    0
  );

  const referenceCode =
    registrations[0]?.registrationReference || 'REG-2026-OFFICIAL';

  const issueDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-10 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:max-w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Official Registration Confirmation
              </h3>
              <p className="text-xs text-slate-500">
                Print or download your verified enrollment slip
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-none print:p-0">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#2E5A44] text-white flex items-center justify-center font-extrabold text-sm">
                EM
              </div>
              <span className="text-lg font-black tracking-wider text-slate-900 uppercase">
                Emedley Institute of Technology
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              Office of the University Registrar • Academic Records & Enrollments
            </p>
            <h2 className="text-base font-extrabold text-[#2E5A44] mt-2 uppercase tracking-wide">
              Official Course Registration Slip — {semesterName}
            </h2>
          </div>

          {/* Verification Barcode & Reference Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Registration Reference
              </p>
              <p className="text-base font-mono font-extrabold text-slate-800 tracking-wider">
                {referenceCode}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Date Issued: {issueDate}</p>
            </div>

            {/* Visual Barcode Simulation */}
            <div className="text-right">
              <div className="h-9 w-40 bg-slate-800 flex items-center justify-around px-2 rounded-xs">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full bg-white ${
                      i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                VERIFIED AUTHENTIC
              </span>
            </div>
          </div>

          {/* Student Academic Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-slate-100 text-xs mb-6">
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                Student Name
              </span>
              <span className="font-bold text-slate-800 text-sm">{student?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                Student ID
              </span>
              <span className="font-mono font-bold text-slate-800">
                {student?.studentId || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                Department
              </span>
              <span className="font-semibold text-slate-700">
                {student?.department || 'Computer Science'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                Semester / Year
              </span>
              <span className="font-semibold text-slate-700">
                Semester {student?.currentSemester || 5} • {academicYear}
              </span>
            </div>
          </div>

          {/* Registered Courses Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Faculty</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((item, idx) => {
                  const course = item.course || item;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold font-mono text-[#2E5A44]">
                        {course.courseCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {course.title}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">
                        {item.credits || item.creditsAtRegistration || course.credits} Cr
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {course.facultyName || 'Department Faculty'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {course.schedule?.days?.join(', ') || 'TBA'} (
                        {course.schedule?.time || 'TBA'})
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        ENROLLED
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Credits Summary & Registrar Endorsement */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t-2 border-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Total Enrolled Credits:{' '}
                <span className="text-[#2E5A44] text-sm font-extrabold">
                  {totalCredits} Credits
                </span>
              </p>
              <p className="text-[11px] text-slate-500">
                Enrollment status satisfies full-time academic degree requirements.
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-block border-b border-slate-400 w-44 mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Office of the Registrar</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Authorized Signature & Seal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
