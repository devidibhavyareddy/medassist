import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/patientApi';
import { patientTimelineApi } from '../../api/patientTimelineApi';
import PatientTimeline from '../../components/timeline/PatientTimeline';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { Activity } from 'lucide-react';

const PatientTimelinePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        // First get current patient profile to obtain patient _id
        const profileRes = await patientApi.getMyProfile();
        const patient = profileRes.data.patient;

        if (!patient) {
          setError('Patient profile not initialized. Please complete profile setup on dashboard.');
          return;
        }

        setPatientData(patient);

        // Fetch complete timeline
        const timelineRes = await patientTimelineApi.getTimeline(patient._id);
        setTimelineData(timelineRes.data.timeline || []);
      } catch (err) {
        console.error('Timeline fetch error', err);
        setError(err.response?.data?.message || 'Failed to load medical timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return <Loading text="Assembling Clinical Timeline..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={Activity}
        title="Timeline Unavailable"
        description={error}
        actionLabel="Go to Dashboard"
        onAction={() => (window.location.href = '/patient/dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Your Medical Timeline</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological record of clinical visits, prescriptions, laboratory panels, and invoices.
          </p>
        </div>
      </div>

      <PatientTimeline timeline={timelineData} patient={patientData} />
    </div>
  );
};

export default PatientTimelinePage;
