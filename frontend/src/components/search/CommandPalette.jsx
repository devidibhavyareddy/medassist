import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Stethoscope, Calendar, FileText, Loader2, X, ArrowRight } from 'lucide-react';
import { searchApi } from '../../api/searchApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    patients: [],
    doctors: [],
    appointments: [],
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search execution with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ patients: [], doctors: [], appointments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const promises = [
          searchApi.searchDoctors({ search: query }).catch(() => ({ data: { doctors: [] } })),
        ];

        // Only search patients if role is permitted
        if (user && ['admin', 'doctor', 'receptionist'].includes(user.role)) {
          promises.push(
            searchApi.searchPatients(query).catch(() => ({ data: { patients: [] } }))
          );
          promises.push(
            searchApi.filterAppointments({ status: '' }).catch(() => ({ data: { appointments: [] } }))
          );
        }

        const responses = await Promise.all(promises);
        const doctors = responses[0]?.data?.doctors || [];
        const patients = responses[1]?.data?.patients || [];
        const allAppts = responses[2]?.data?.appointments || [];

        // Simple client filter for appointments matching query
        const filteredAppts = allAppts.filter(
          (a) =>
            a.patientId?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            a.doctorId?.fullName?.toLowerCase().includes(query.toLowerCase()) ||
            a.reason?.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          doctors: doctors.slice(0, 4),
          patients: patients.slice(0, 4),
          appointments: filteredAppts.slice(0, 4),
        });
      } catch (err) {
        console.error('Command search error', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, user]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-800"
          >
            {/* Search Input bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <Search className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search MedAssist (Patients, Doctors, Appointments)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
              {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2" />}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
                ESC
              </kbd>
            </div>

            {/* Results Group list */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {/* Doctors group */}
              {results.doctors.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Doctors
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.doctors.map((doc) => (
                      <div
                        key={doc._id}
                        onClick={() => handleSelect(user?.role === 'admin' ? '/admin/doctors' : '/doctor/dashboard')}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
                            Dr
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                              {doc.fullName}
                            </p>
                            <p className="text-xs text-slate-500">{doc.specialization}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patients group */}
              {results.patients.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Patients
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.patients.map((pat) => (
                      <div
                        key={pat._id}
                        onClick={() => handleSelect(`/patient/timeline`)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold">
                            Pt
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                              {pat.fullName}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              ID: {pat.patientId} • {pat.phone || 'No phone'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments group */}
              {results.appointments.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Appointments
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.appointments.map((appt) => (
                      <div
                        key={appt._id}
                        onClick={() => handleSelect('/doctor/appointments')}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                              {appt.patientId?.fullName || 'Patient'} with {appt.doctorId?.fullName || 'Doctor'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(appt.date).toLocaleDateString()} at {appt.startTime} ({appt.status})
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state while searching */}
              {query.length >= 2 &&
                !loading &&
                results.doctors.length === 0 &&
                results.patients.length === 0 &&
                results.appointments.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    No results found matching "{query}"
                  </div>
                )}

              {/* Initial hint */}
              {query.length < 2 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  Type at least 2 characters to search across doctors, patients, and clinical records.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
