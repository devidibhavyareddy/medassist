import React, { useState, useEffect } from 'react';
import { labApi } from '../../api/labApi';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FlaskConical,
  Search,
  Eye,
  Send,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const LabResultsPage = () => {
  const [orders, setOrders] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'results'
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Modal State for Entering New Result
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [testRows, setTestRows] = useState([
    { testName: '', value: '', unit: '', referenceRange: '', observation: 'Normal' },
  ]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal State for Viewing Result Detail
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeResultDetail, setActiveResultDetail] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, resultsRes] = await Promise.allSettled([
        labApi.getAllLabOrders(),
        labApi.getMyLabResults(),
      ]);

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data.labOrders || ordersRes.value.data || []);
      }
      if (resultsRes.status === 'fulfilled') {
        setResults(resultsRes.value.data.results || resultsRes.value.data.labResults || resultsRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load lab results data', err);
      showToast('Error loading laboratory records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openResultEntry = (order) => {
    setSelectedOrder(order);
    // Pre-populate tests from order if available
    if (order.tests && Array.isArray(order.tests) && order.tests.length > 0) {
      setTestRows(
        order.tests.map((t) => ({
          testName: typeof t === 'string' ? t : t.testName || '',
          value: '',
          unit: '',
          referenceRange: '',
          observation: 'Normal',
        }))
      );
    } else {
      setTestRows([{ testName: '', value: '', unit: '', referenceRange: '', observation: 'Normal' }]);
    }
    setTechnicianNotes('');
    setEntryModalOpen(true);
  };

  const handleAddRow = () => {
    setTestRows((prev) => [
      ...prev,
      { testName: '', value: '', unit: '', referenceRange: '', observation: 'Normal' },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (testRows.length === 1) return;
    setTestRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, val) => {
    setTestRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    // Validate rows
    for (let i = 0; i < testRows.length; i++) {
      if (!testRows[i].testName.trim() || !testRows[i].value.trim()) {
        showToast(`Row #${i + 1} requires both Test Name and Value`, 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      await labApi.createLabResult({
        labOrderId: selectedOrder._id,
        results: testRows,
        technicianNotes,
      });

      showToast('Lab result successfully recorded & marked complete!', 'success');
      setEntryModalOpen(false);
      fetchData();
      setActiveTab('results');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit lab result', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyResult = async (resultId) => {
    setVerifying(true);
    try {
      await labApi.verifyLabResult(resultId);
      showToast('Lab result verified and released to patient & doctor!', 'success');
      setViewModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Filter orders needing results or ready for results
  const eligibleOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.orderId?.toLowerCase().includes(q) ||
      o.patientId?.fullName?.toLowerCase().includes(q) ||
      o.patientId?.patientId?.toLowerCase().includes(q);
    return matchesSearch;
  });

  const filteredResults = results.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r._id?.toLowerCase().includes(q) ||
      r.patientId?.fullName?.toLowerCase().includes(q) ||
      r.labOrderId?.orderId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Diagnostic Results & Verification
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Input clinical assay findings, evaluate reference ranges, and verify diagnostic reports.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Orders Ready for Input ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-lg shadow-teal-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Processed Results ({results.length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search patient or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <Loading text="Loading laboratory records..." />
      ) : activeTab === 'orders' ? (
        // Tab 1: Orders ready for result input
        eligibleOrders.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No orders found"
            description="All diagnostic orders have already been logged or no matching records match your query."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleOrders.map((order) => {
              const isReadyForInput = ['sampleCollected', 'processing', 'completed'].includes(order.status);
              return (
                <Card key={order._id} className="relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800 text-cyan-300">
                        #{order.orderId || order._id.slice(-6)}
                      </span>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'processing'
                            ? 'info'
                            : order.status === 'sampleCollected'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-100 text-lg">
                        {order.patientId?.fullName || 'Patient Specimen'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        PID: {order.patientId?.patientId || 'N/A'} • Age:{' '}
                        {order.patientId?.age || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Requested Tests:</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.tests?.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {typeof t === 'string' ? t : t.testName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {order.clinicalNote && (
                      <p className="text-xs text-slate-400 italic line-clamp-2">
                        &ldquo;{order.clinicalNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Doctor: Dr. {order.doctorId?.fullName || 'Clinical Staff'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => openResultEntry(order)}
                      className="gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Enter Result
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        // Tab 2: Existing Lab Results
        filteredResults.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No diagnostic results yet"
            description="Enter test outcomes from the Orders Ready for Input tab to see them here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => (
              <Card key={result._id} className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Order #{result.labOrderId?.orderId || result.labOrderId?._id?.slice(-6) || 'N/A'}
                    </span>
                    <Badge
                      variant={
                        result.verificationStatus === 'verified'
                          ? 'success'
                          : 'warning'
                      }
                      className="gap-1"
                    >
                      {result.verificationStatus === 'verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pending Review
                        </>
                      )}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100 text-lg">
                      {result.patientId?.fullName || 'Patient Record'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Logged {new Date(result.createdAt).toLocaleDateString()} at{' '}
                      {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="text-xs font-medium text-slate-400">Assay Outcomes:</div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {result.results?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-none"
                        >
                          <span className="text-slate-300 font-medium">{item.testName}</span>
                          <span className="font-mono text-cyan-300">
                            {item.value} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.technicianNotes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2">
                      Notes: {result.technicianNotes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-slate-300 hover:text-white"
                    onClick={() => {
                      setActiveResultDetail(result);
                      setViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Details
                  </Button>

                  {result.verificationStatus !== 'verified' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1 text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30"
                      onClick={() => handleVerifyResult(result._id)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verify Now
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Modal: Enter Lab Result */}
      <Modal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        title={`Record Findings: Order #${selectedOrder?.orderId || selectedOrder?._id?.slice(-6)}`}
        size="lg"
      >
        <form onSubmit={handleSubmitResult} className="space-y-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <span className="font-medium text-slate-200">
                {selectedOrder?.patientId?.fullName} ({selectedOrder?.patientId?.patientId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ordering Physician:</span>
              <span className="font-medium text-slate-200">
                Dr. {selectedOrder?.doctorId?.fullName || 'Physician'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                Assay Parameter Rows
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddRow}
                className="gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Parameter
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {testRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800 items-center"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <label className="text-xs text-slate-400 block mb-1">Test Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hemoglobin"
                      value={row.testName}
                      onChange={(e) => handleRowChange(index, 'testName', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Value *</label>
                    <input
                      type="text"
                      required
                      placeholder="13.5"
                      value={row.value}
                      onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="g/dL"
                      value={row.unit}
                      onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Ref Range</label>
                    <input
                      type="text"
                      placeholder="12.0 - 15.5"
                      value={row.referenceRange}
                      onChange={(e) => handleRowChange(index, 'referenceRange', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-1">
                    <label className="text-xs text-slate-400 block mb-1">Obs</label>
                    <select
                      value={row.observation}
                      onChange={(e) => handleRowChange(index, 'observation', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Normal">Norm</option>
                      <option value="Elevated">High</option>
                      <option value="Low">Low</option>
                      <option value="Critical">Crit</option>
                    </select>
                  </div>

                  <div className="col-span-1 flex justify-end pt-5">
                    {testRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Technician Notes / Pathologist Observations
            </label>
            <textarea
              rows={3}
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Add specimen observations, sample conditions, or method notes..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEntryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="gap-2">
              <Send className="w-4 h-4" />
              Save Lab Findings
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View & Verify Detail */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Diagnostic Report Review"
        size="md"
      >
        {activeResultDetail && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="font-semibold text-slate-100">
                  {activeResultDetail.patientId?.fullName || 'Patient'}
                </h4>
                <p className="text-xs text-slate-400">
                  Order ID: {activeResultDetail.labOrderId?.orderId || activeResultDetail.labOrderId?._id || 'N/A'}
                </p>
              </div>
              <Badge
                variant={
                  activeResultDetail.verificationStatus === 'verified'
                    ? 'success'
                    : 'warning'
                }
              >
                {activeResultDetail.verificationStatus}
              </Badge>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assay Findings
              </h5>
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                {activeResultDetail.results?.map((res, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-medium text-slate-200">{res.testName}</div>
                      {res.referenceRange && (
                        <div className="text-slate-500 text-[11px]">
                          Ref: {res.referenceRange}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-cyan-300 font-semibold">
                        {res.value} {res.unit}
                      </div>
                      {res.observation && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            res.observation === 'Normal'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {res.observation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeResultDetail.technicianNotes && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium block mb-1">Technician Notes:</span>
                <p className="text-slate-300">{activeResultDetail.technicianNotes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>

              {activeResultDetail.verificationStatus !== 'verified' && (
                <Button
                  loading={verifying}
                  onClick={() => handleVerifyResult(activeResultDetail._id)}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Release Result
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabResultsPage;
