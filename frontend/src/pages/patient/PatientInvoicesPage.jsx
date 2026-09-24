import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../api/invoiceApi';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const PatientInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const { showToast } = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.getMyInvoices();
      setInvoices(res.data.invoices || res.data || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
      showToast('Could not retrieve invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPayment = (inv) => {
    setPayingInvoice(inv);
    setTransactionRef(`UPI-${Date.now().toString().slice(-6)}`);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    try {
      await invoiceApi.recordPayment(payingInvoice._id, {
        paymentMethod,
        transactionReference: transactionRef,
      });
      showToast(`Payment of ₹${payingInvoice.total} recorded successfully!`, 'success');
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error('Payment failed', err);
      showToast(err.response?.data?.message || 'Failed to submit payment', 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loading text="Fetching financial records & invoice items..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            My Invoices & Billing
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {invoices.length} Bills
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review itemized consultation fees, diagnostics, medications, and settle pending balances.
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Invoices Found"
          description="You currently have no invoices or billing statements."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <Card key={inv._id} glow={inv.paymentStatus === 'pending'}>
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Invoice ID</span>
                  <p className="font-mono text-sm font-bold text-cyan-300">{inv.invoiceId}</p>
                </div>
                <Badge status={inv.paymentStatus} />
              </div>

              {/* Items summary */}
              <div className="my-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  Service Breakdown
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {inv.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span className="truncate pr-2">{item.description} (x{item.quantity})</span>
                      <span className="font-mono text-white shrink-0">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{inv.subtotal}</span>
                </div>
                {inv.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{inv.discount}</span>
                  </div>
                )}
                {inv.tax > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (GST):</span>
                    <span className="font-mono">+₹{inv.tax}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700/60">
                  <span>Total Amount:</span>
                  <span className="text-cyan-400 font-mono">₹{inv.total}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  View Details
                </button>

                {inv.paymentStatus === 'pending' || inv.paymentStatus === 'partiallyPaid' ? (
                  <Button
                    onClick={() => handleOpenPayment(inv)}
                    variant="primary"
                    size="sm"
                    icon={CreditCard}
                  >
                    Pay ₹{inv.total}
                  </Button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Detail / Printable Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice Receipt #${selectedInvoice?.invoiceId}`}
        subtitle={`Issued Date: ${selectedInvoice ? new Date(selectedInvoice.issuedAt || selectedInvoice.createdAt).toLocaleDateString() : ''}`}
      >
        {selectedInvoice && (
          <div className="space-y-6 print:text-black">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Payment Status</p>
                <div className="mt-1"><Badge status={selectedInvoice.paymentStatus} /></div>
              </div>
              {selectedInvoice.paymentMethod && (
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-mono">Payment Method</p>
                  <p className="text-sm font-bold text-white uppercase font-mono mt-0.5">{selectedInvoice.paymentMethod}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">Itemized Charges</h4>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedInvoice.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-slate-200">{item.description}</td>
                      <td className="py-2.5 text-center font-mono text-slate-400">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono text-slate-300">₹{item.price}</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-white">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-sm text-right">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Subtotal:</span>
                <span className="font-mono">₹{selectedInvoice.subtotal}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{selectedInvoice.discount}</span>
                </div>
              )}
              {selectedInvoice.tax > 0 && (
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Taxes:</span>
                  <span className="font-mono">+₹{selectedInvoice.tax}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-700">
                <span>Final Payable:</span>
                <span className="text-cyan-400 font-mono">₹{selectedInvoice.total}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button onClick={handlePrint} variant="outline" size="sm" icon={Printer}>
                Print Receipt
              </Button>
              <Button onClick={() => setSelectedInvoice(null)} variant="primary" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Bill Payment"
        subtitle={`Invoice #${payingInvoice?.invoiceId} — Total: ₹${payingInvoice?.total}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="upi">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="card">Credit / Debit Card</option>
              <option value="online">Net Banking</option>
              <option value="cash">Counter Cash Payment</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Transaction Reference ID</label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setPaymentModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingPayment} variant="primary" size="sm">
              Confirm Payment (₹{payingInvoice?.total})
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientInvoicesPage;
