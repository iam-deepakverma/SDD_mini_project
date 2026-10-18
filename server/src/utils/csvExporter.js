export const exportRegistrationsToCSV = (registrations) => {
  const headers = [
    'Registration Reference',
    'Student ID',
    'Student Name',
    'Student Email',
    'Course Code',
    'Course Title',
    'Credits',
    'Faculty',
    'Semester',
    'Academic Year',
    'Status',
    'Registered At',
    'Cancelled At',
  ];

  const rows = registrations.map((reg) => [
    reg.registrationReference || '',
    reg.student?.studentId || '',
    `"${(reg.student?.name || '').replace(/"/g, '""')}"`,
    reg.student?.email || '',
    reg.course?.courseCode || '',
    `"${(reg.course?.title || '').replace(/"/g, '""')}"`,
    reg.creditsAtRegistration || reg.course?.credits || '',
    `"${(reg.course?.facultyName || '').replace(/"/g, '""')}"`,
    reg.semester || '',
    reg.academicYear || '',
    reg.status || '',
    reg.registeredAt ? new Date(reg.registeredAt).toISOString() : '',
    reg.cancelledAt ? new Date(reg.cancelledAt).toISOString() : '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};
