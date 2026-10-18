import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import api from '../../api/client.js';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog.jsx';
import { PrintableRegistrationSlip } from '../../components/registration/PrintableRegistrationSlip.jsx';
import toast from 'react-hot-toast';

export const CartReviewPage = () => {
  const { user, academicSummary, refreshUser, notifyDataChanged } = useAuth();
  const { selectedCourses, removeFromCart, clearCart, totalCartCredits } = useCart();
  const navigate = useNavigate();

  const [validationData, setValidationData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Success state after registration
  const [confirmedRegistrations, setConfirmedRegistrations] = useState(null);
  const [showSlip, setShowSlip] = useState(false);

  // Validate selected courses against backend whenever cart changes
  const runValidation = async () => {
    if (selectedCourses.length === 0) {
      setValidationData(null);
      return;
    }

    setIsValidating(true);
    try {
      const courseIds = selectedCourses.map((c) => c._id);
      const res = await api.post('/registrations/validate', {
        courseIds,
        semester: academicSummary?.currentSemester || 5,
      });

      if (res.data.success) {
        setValidationData(res.data.data);
      }
    } catch (err) {
      console.error('Validation error:', err);
      toast.error(err.response?.data?.message || 'Pre-registration validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, [selectedCourses.length]);

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const courseIds = selectedCourses.map((c) => c._id);
      const res = await api.post('/registrations/confirm', {
        courseIds,
        semester: academicSummary?.currentSemester || 5,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Course registration confirmed successfully!');
        setConfirmedRegistrations(res.data.data.registrations || []);
        clearCart();
        notifyDataChanged('student_confirm_registration');
        await refreshUser();
        setShowSlip(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCredits = academicSummary?.registeredCredits || 0;
  const maxCredits = academicSummary?.maxCredits || 18;
  const projectedTotal = currentCredits + totalCartCredits;
  const isOverCreditLimit = projectedTotal > maxCredits;
  const excessCredits = Math.max(0, projectedTotal - maxCredits);

  // Determine if ready to submit
  const allEligible =
    validationData?.allValid && !isOverCreditLimit && selectedCourses.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Course Selection Cart & Pre-Registration Validation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your selected classes, verify eligibility requirements, and submit official registration.
          </p>
        </div>

        {selectedCourses.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full transition self-start sm:self-auto"
          >
            Clear Cart
          </button>
        )}
      </div>

      {selectedCourses.length === 0 && !confirmedRegistrations ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-slate-100 shadow-sm">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">Your course cart is empty</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto">
            Browse the course catalogue and add courses for the upcoming semester to review them here.
          </p>
          <Link
            to="/courses"
            className="px-6 py-2.5 rounded-full bg-[#2E5A44] hover:bg-[#224333] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left 2 Cols: Cart Table & Ineligibility Alerts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Credit Limit Alert if Exceeded */}
            {isOverCreditLimit && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Maximum Credit Limit Exceeded</p>
                  <p className="mt-0.5">
                    Your current registered credits ({currentCredits} cr) plus newly selected credits ({totalCartCredits} cr) equals {projectedTotal} cr, which exceeds the university limit of {maxCredits} cr by{' '}
                    <span className="font-extrabold">{excessCredits} credits</span>. Please remove one or more courses to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Courses List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">
                Selected Courses ({selectedCourses.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {selectedCourses.map((course) => {
                  const validation = validationData?.courseValidations?.find(
                    (v) => v.courseId === course._id
                  );

                  const hasMissingPrereq =
                    validation && !validation.prerequisitesMet;
                  const isFull = validation && validation.isFull;

                  return (
                    <div
                      key={course._id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-sm text-[#2E5A44] bg-[#E8F1EC] px-2.5 py-0.5 rounded-lg">
                            {course.courseCode}
                          </span>
                          <Badge variant="terracotta" size="sm">
                            {course.credits} Credits
                          </Badge>
                          {validation && !validation.canRegister && (
                            <Badge variant="danger" size="sm">
                              Ineligible
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm">
                          {course.title}
                        </h4>

                        <p className="text-xs text-slate-500">
                          Faculty: {course.facultyName} • Schedule: {course.schedule?.days?.join(', ') || 'TBA'}
                        </p>

                        {/* Missing prerequisite explanation banner */}
                        {hasMissingPrereq && (
                          <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>
                              Missing Prerequisite(s):{' '}
                              <strong className="font-bold">
                                {validation.missingPrerequisites
                                  .map((p) => p.courseCode)
                                  .join(', ')}
                              </strong>
                            </span>
                          </div>
                        )}

                        {/* Full capacity notice */}
                        {isFull && (
                          <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              Course is at maximum capacity ({course.capacity} seats). Direct registration is blocked.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          {course.credits} Cr
                        </span>
                        <button
                          onClick={() => removeFromCart(course._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Summary & Confirmation Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4 sticky top-20 sm:top-24">
              <h3 className="font-bold text-slate-800 text-base">Registration Summary</h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span>Currently Registered:</span>
                  <span className="font-bold text-slate-800">{currentCredits} Credits</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span>Cart Course Credits:</span>
                  <span className="font-bold text-[#E27D60]">+{totalCartCredits} Credits</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span>Projected Semester Total:</span>
                  <span
                    className={`font-extrabold text-sm ${
                      isOverCreditLimit ? 'text-rose-600' : 'text-[#2E5A44]'
                    }`}
                  >
                    {projectedTotal} / {maxCredits} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registration Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Open Period
                  </span>
                </div>
              </div>

              {/* Validation Status Checklist */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {!isOverCreditLimit ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className={isOverCreditLimit ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                    Within credit allowance ({maxCredits} cr limit)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {validationData?.courseValidations?.every((c) => c.prerequisitesMet) ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span
                    className={
                      validationData?.courseValidations?.some((c) => !c.prerequisitesMet)
                        ? 'text-rose-600 font-semibold'
                        : 'text-slate-700'
                    }
                  >
                    Prerequisite courses verified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {validationData?.courseValidations?.every((c) => !c.isFull) ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span
                    className={
                      validationData?.courseValidations?.some((c) => c.isFull)
                        ? 'text-amber-700 font-semibold'
                        : 'text-slate-700'
                    }
                  >
                    Class capacity available
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={!allEligible || isSubmitting || isValidating}
                onClick={() => setShowConfirmModal(true)}
                className={`w-full py-3 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                  allEligible
                    ? 'bg-[#E27D60] hover:bg-[#d06b4e] text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isValidating
                    ? 'Validating Selection...'
                    : isSubmitting
                    ? 'Confirming Registration...'
                    : 'Confirm & Submit Registration'}
                </span>
              </button>

              {!allEligible && (
                <p className="text-[11px] text-center text-slate-400">
                  Please resolve any credit limits or prerequisite warnings above to unlock submission.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog prior to submit */}
      <ConfirmationDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Course Registration"
        message={`You are about to officially register for ${selectedCourses.length} course(s) totaling ${totalCartCredits} credits for ${academicSummary?.semesterName || 'Fall 2026'}. Reserved seats will be allocated to your academic record upon confirmation.`}
        confirmText="Confirm Registration"
        confirmVariant="primary"
        isLoading={isSubmitting}
      />

      {/* Printable Slip for newly confirmed registrations */}
      <PrintableRegistrationSlip
        isOpen={showSlip}
        onClose={() => {
          setShowSlip(false);
          navigate('/my-registrations');
        }}
        registrationData={confirmedRegistrations || []}
        student={user}
        academicYear={academicSummary?.academicYear || '2026-2027'}
        semesterName={academicSummary?.semesterName || 'Fall Semester 2026'}
      />
    </div>
  );
};
