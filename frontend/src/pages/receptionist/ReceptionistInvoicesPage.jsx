import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi';
import { searchApi } from '../../api/searchApi';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  Plus,
  CreditCard,
  Printer,
  Trash2,
  XCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const ReceptionistInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Create Form State
  const [newInvoice, setNewInvoice] = useState({
    patientId: '',
    items: [{ description: 'General Consultation', quantity: 1, price: 500 }],
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    transactionReference: '',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'cash',
    transactionReference: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, patRes] = await Promise.all([
        invoiceApi.getAllInvoices(),
        searchApi.searchPatients('').catch(() => ({ data: { patients: [] } })),
      ]);
      setInvoices(invRes.data.invoices || invRes.data || []);
      setPatients(patRes.data.patients || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
      showToast('Error loading billing ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newInvoice.items];
    updated[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((acc, it) => acc + (it.quantity * it.price || 0), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return Math.max(0, sub - (Number(newInvoice.discount) || 0) + (Number(newInvoice.tax) || 0));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newInvoice.patientId) {
      showToast('Please select a patient', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await invoiceApi.createInvoice({
        patientId: newInvoice.patientId,
        items: newInvoice.items,
        discount: Number(newInvoice.discount) || 0,
        tax: Number(newInvoice.tax) || 0,
        paymentMethod: newInvoice.paymentMethod,
        transactionReference: newInvoice.transactionReference,
      });
      showToast('Invoice generated and logged!', 'success');
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Create invoice error', err);
      showToast(err.response?.data?.message || 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      paymentMethod: 'cash',
      transactionReference: `RCPT-${Date.now().toString().slice(-6)}`,
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invoiceApi.recordPayment(selectedInvoice._id, paymentForm);
      showToast(`Payment recorded for Invoice #${selectedInvoice.invoiceId}!`, 'success');
      setPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvoice = async (id) => {
    if (!window.confirm('Cancel this invoice permanently?')) return;
    try {
      await invoiceApi.cancelInvoice(id);
      showToast('Invoice cancelled', 'info');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel invoice', 'error');
    }
  };

  if (loading) {
    return <Loading text="Loading clinic billing ledger..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Billing & Invoices
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {invoices.length} Invoices
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate itemized clinic charges, collect cash/card/UPI payments, and issue printable statements.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} variant="primary" size="sm" icon={Plus}>
          Generate Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Invoices Found"
          description="Generate a billing invoice for consultations or diagnostic services."
          actionLabel="Create Invoice"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <Table headers={['Invoice ID', 'Patient', 'Total Amount', 'Payment Method', 'Status', 'Actions']}>
          {invoices.map((inv) => (
            <TableRow key={inv._id}>
              <TableCell>
                <span className="font-mono text-xs font-bold text-cyan-400">#{inv.invoiceId}</span>
                <span className="block text-[10px] text-slate-400">
                  {new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}
                </span>
              </TableCell>

              <TableCell>
                <div className="font-semibold text-white">{inv.patientId?.fullName || 'Patient'}</div>
                <div className="text-xs text-slate-400 font-mono">{inv.patientId?.patientId}</div>
              </TableCell>

              <TableCell>
                <span className="font-mono font-bold text-white text-sm">₹{inv.total}</span>
                {inv.discount > 0 && (
                  <span className="block text-[10px] text-emerald-400 font-mono">Disc: -₹{inv.discount}</span>
                )}
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono uppercase text-slate-300">
                  {inv.paymentMethod || 'Unspecified'}
                </span>
              </TableCell>

              <TableCell>
                <Badge status={inv.paymentStatus} />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {inv.paymentStatus === 'pending' || inv.paymentStatus === 'partiallyPaid' ? (
                    <Button
                      onClick={() => handleOpenPayment(inv)}
                      variant="primary"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                      icon={CreditCard}
                    >
                      Collect
                    </Button>
                  ) : null}

                  {inv.paymentStatus !== 'cancelled' && (
                    <Button
                      onClick={() => handleCancelInvoice(inv._id)}
                      variant="danger"
                      size="sm"
                      className="text-xs py-1 px-2"
                      icon={XCircle}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate New Clinic Invoice"
        subtitle="Add services, procedures, consultations, and medications"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Patient *</label>
            <select
              required
              value={newInvoice.patientId}
              onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName} ({p.patientId}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Itemized list */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Itemized Services</span>
              <Button onClick={handleAddItem} variant="outline" size="sm" icon={Plus}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {newInvoice.items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Service or test description"
                      required
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      required
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Price (₹)"
                      required
                      value={it.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Discount Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={newInvoice.discount}
                onChange={(e) => setNewInvoice({ ...newInvoice, discount: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Tax / GST (₹)</label>
              <input
                type="number"
                min="0"
                value={newInvoice.tax}
                onChange={(e) => setNewInvoice({ ...newInvoice, tax: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right space-y-1">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">₹{calculateSubtotal()}</span>
            </div>
            <div className="text-base font-bold text-white flex justify-between pt-1 border-t border-slate-800">
              <span>Final Total:</span>
              <span className="text-cyan-400 font-mono">₹{calculateTotal()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setCreateModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary" size="sm">
              Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Collection Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Collect Bill Payment"
        subtitle={`Invoice #${selectedInvoice?.invoiceId} — Balance: ₹${selectedInvoice?.total}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Payment Tender</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="cash">Cash (Counter)</option>
              <option value="upi">UPI (QR / App)</option>
              <option value="card">POS Credit / Debit Card</option>
              <option value="online">Net Banking</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Transaction Reference Code</label>
            <input
              type="text"
              required
              value={paymentForm.transactionReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setPaymentModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} variant="primary" size="sm">
              Record ₹{selectedInvoice?.total} Received
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistInvoicesPage;
