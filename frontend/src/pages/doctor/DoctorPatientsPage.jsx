import React, { useState, useEffect } from 'react';
import { searchApi } from '../../api/searchApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Activity, Calendar, ArrowRight, HeartPulse } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await searchApi.searchPatients(query);
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Failed to search patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Patient Medical Directory
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {patients.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access patient EHR charts, chronological medical timelines, and prior clinical visits.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {loading ? (
        <Loading text="Querying electronic patient directory..." />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description={search ? `No patients matching "${search}"` : 'No registered patients available in the database.'}
        />
      ) : (
        <Table headers={['Patient Name', 'Patient ID', 'Gender & DOB', 'Contact & Phone', 'Blood Group', 'Clinical Actions']}>
          {patients.map((pat) => (
            <TableRow key={pat._id}>
              <TableCell>
                <div className="font-semibold text-white">{pat.fullName}</div>
                <div className="text-xs text-slate-400">{pat.email || 'No email'}</div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                  {pat.patientId}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300">
                  {pat.gender || 'Patient'}
                  {pat.dateOfBirth && ` • ${new Date(pat.dateOfBirth).toLocaleDateString()}`}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-300">{pat.phone || 'N/A'}</span>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs text-rose-400 font-bold">{pat.bloodGroup || 'N/A'}</span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate(`/patient/timeline`)}
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2.5"
                    icon={HeartPulse}
                  >
                    Timeline
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
};

export default DoctorPatientsPage;
