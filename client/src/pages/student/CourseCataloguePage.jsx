import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { CourseFilters } from '../../components/courses/CourseFilters.jsx';
import { CourseCard } from '../../components/courses/CourseCard.jsx';
import { CourseDetailModal } from '../../components/courses/CourseDetailModal.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export const CourseCataloguePage = () => {
  const { user, refreshUser, dataVersion, notifyDataChanged } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState(new Set());
  const [waitlistedCourseIds, setWaitlistedCourseIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('All');
  const [credits, setCredits] = useState('All');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('courseCode');

  // Selected course for modal details
  const [detailCourse, setDetailCourse] = useState(null);

  // Waitlist confirmation dialog state
  const [waitlistTarget, setWaitlistTarget] = useState(null);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);

  const fetchCourses = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (credits !== 'All') params.append('credits', credits);
      if (availability !== 'all') params.append('availability', availability);
      params.append('sortBy', sortBy);

      const [coursesRes, regRes, waitRes] = await Promise.all([
        api.get(`/courses?${params.toString()}`),
        api.get('/registrations/me?status=registered'),
        api.get('/waitlists/me'),
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.courses || []);
      }
      if (regRes.data.success) {
        setRegisteredCourseIds(
          new Set((regRes.data.registrations || []).map((r) => r.course?._id || r.course))
        );
      }
      if (waitRes.data.success) {
        setWaitlistedCourseIds(
          new Set((waitRes.data.waitlists || []).map((w) => w.course?._id || w.course))
        );
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(true);
  }, [search, department, credits, availability, sortBy, dataVersion]);

  const handleJoinWaitlistConfirm = async () => {
    if (!waitlistTarget) return;
    setIsJoiningWaitlist(true);
    try {
      const res = await api.post('/waitlists', {
        courseId: waitlistTarget._id,
        semester: waitlistTarget.semester,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Joined waitlist successfully!');
        setWaitlistTarget(null);
        notifyDataChanged('student_join_waitlist');
        await fetchCourses(false);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist.');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  return (
    <div>
      {/* Page Title & Filter Header */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Upcoming Semester Course Catalogue
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Browse active courses, verify requirements, and add selections to your registration cart.
        </p>
      </div>

      <CourseFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        credits={credits}
        onCreditsChange={setCredits}
        availability={availability}
        onAvailabilityChange={setAvailability}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalResults={courses.length}
      />

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-64" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No matching courses found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, removing filters, or searching by a different course keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              student={user}
              isRegistered={registeredCourseIds.has(course._id)}
              isWaitlisted={waitlistedCourseIds.has(course._id)}
              onOpenDetails={setDetailCourse}
              onJoinWaitlist={setWaitlistTarget}
            />
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailCourse}
        student={user}
        isOpen={!!detailCourse}
        onClose={() => setDetailCourse(null)}
        onJoinWaitlist={setWaitlistTarget}
      />

      {/* Join Waitlist Confirmation */}
      <ConfirmationDialog
        isOpen={!!waitlistTarget}
        onClose={() => setWaitlistTarget(null)}
        onConfirm={handleJoinWaitlistConfirm}
        title={`Join Waiting List: ${waitlistTarget?.courseCode}`}
        message={`Course ${waitlistTarget?.courseCode} (${waitlistTarget?.title}) is currently at full capacity (${waitlistTarget?.capacity} students). Would you like to join the waiting list? If an enrolled student drops or additional seats open, eligible students are admitted in queue order.`}
        confirmText="Join Waitlist"
        confirmVariant="warning"
        isLoading={isJoiningWaitlist}
      />
    </div>
  );
};
