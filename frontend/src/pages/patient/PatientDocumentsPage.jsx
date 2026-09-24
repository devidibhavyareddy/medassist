import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/patientApi';
import { documentApi } from '../../api/documentApi';
import { useToast } from '../../context/ToastContext';
import {
  FolderLock,
  Upload,
  FileText,
  FileCheck,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

const PatientDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('labReport');

  const { showToast } = useToast();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const profRes = await patientApi.getMyProfile();
      const pat = profRes.data.patient;
      if (pat?._id) {
        setPatientId(pat._id);
        const docsRes = await documentApi.getPatientDocuments(pat._id);
        setDocuments(docsRes.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
      showToast('Could not load medical documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file to upload', 'warning');
      return;
    }
    if (!patientId) {
      showToast('Patient profile missing', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('patientId', patientId);
    formData.append('documentType', documentType);

    try {
      await documentApi.uploadDocument(formData);
      showToast('Document securely uploaded to medical archive!', 'success');
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchDocs();
    } catch (err) {
      console.error('Upload error', err);
      showToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await documentApi.getDocumentBlob(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      showToast('Could not securely download file', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <Loading text="Verifying digital credentials & loading secure files..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Secure Medical Documents
            <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
              HIPAA / ISO-Protected
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Encrypted file storage for prior medical reports, radiology scans, discharge summaries, and lab PDFs.
          </p>
        </div>

        <Button onClick={() => setUploadModalOpen(true)} variant="primary" size="sm" icon={Upload}>
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title="No Documents Uploaded"
          description="You currently have no external clinical documents uploaded."
          actionLabel="Upload First Document"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <Table headers={['Document Name', 'Category', 'File Size', 'Upload Date', 'Uploaded By', 'Action']}>
          {documents.map((doc) => (
            <TableRow key={doc._id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white text-sm">{doc.originalName || doc.fileName}</span>
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">{doc.fileType}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 capitalize">
                  {doc.documentType || 'other'}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-400">{formatFileSize(doc.fileSize)}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-300">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-400 font-mono">
                  {doc.uploadedBy?.name || 'Self'} ({doc.uploadedBy?.role || 'patient'})
                </span>
              </TableCell>

              <TableCell>
                <Button
                  onClick={() => handleDownload(doc._id, doc.originalName || doc.fileName)}
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 px-2.5"
                  icon={Download}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Clinical Document"
        subtitle="Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Document Type / Category</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="labReport">Diagnostic Lab Report</option>
              <option value="prescription">Prior Prescription</option>
              <option value="radiology">Radiology Scan (X-Ray / MRI / CT)</option>
              <option value="dischargeSummary">Discharge Summary</option>
              <option value="insurance">Insurance Document</option>
              <option value="other">Other Clinical Document</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select File</label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => setUploadModalOpen(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={uploading} variant="primary" size="sm">
              Upload Encrypted Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientDocumentsPage;
