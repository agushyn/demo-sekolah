import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import BentoCard from '@/Components/BentoCard';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import EmptyState from '@/Components/EmptyState';
import Dropdown from '@/Components/Dropdown';
import {
    Users,
    UserCheck,
    UserX,
    School,
    Search,
    Filter,
    Link as LinkIcon,
    Unlink,
    Calendar,
    Phone,
    Mail,
    Plus,
    CheckCircle2,
    Clock,
    Sparkles,
    UserPlus,
    ArrowRight,
    TrendingUp,
    Repeat,
    Eye,
    Check,
    AlertTriangle,
    Shield,
    FileSpreadsheet,
    Download,
    UploadCloud,
    X,
    ChevronDown,
    Key,
    AlertCircle,
    Lock,
    Radio,
    CreditCard,
} from 'lucide-react';

export default function StudentsIndex({
    students,
    stats = {},
    classes = [],
    academicYears = [],
    parents = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [classId, setClassId] = useState(filters.class_id || 'all');
    const [parentStatus, setParentStatus] = useState(filters.parent_status || 'all');

    // Add Student Dropdown
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    // Bulk selection state
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // RFID Modal State
    const [isRfidModalOpen, setIsRfidModalOpen] = useState(false);
    const [selectedStudentForRfid, setSelectedStudentForRfid] = useState(null);
    const [rfidMode, setRfidMode] = useState('assign'); // 'assign' | 'replace' | 'remove'
    const [rfidUidInput, setRfidUidInput] = useState('');
    const [rfidNotesInput, setRfidNotesInput] = useState('');
    const [isRfidProcessing, setIsRfidProcessing] = useState(false);

    // Batch Modal State (type: 'promote' or 'transfer')
    const [batchModalType, setBatchModalType] = useState(null); // 'promote' | 'transfer' | null
    const [batchStep, setBatchStep] = useState(1);
    const [fromClassId, setFromClassId] = useState('');
    const [toClassId, setToClassId] = useState('');
    const [batchNotes, setBatchNotes] = useState('');
    const [batchConfirmChecked, setBatchConfirmChecked] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isBatchExecuting, setIsBatchExecuting] = useState(false);

    // Import Modal State (.XLSX)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Preview, 3: Result & Credentials
    const [importFile, setImportFile] = useState(null);
    const [importPreviewData, setImportPreviewData] = useState(null);
    const [importErrorMessage, setImportErrorMessage] = useState('');
    const [isImportPreviewLoading, setIsImportPreviewLoading] = useState(false);
    const [isImportExecuting, setIsImportExecuting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // Link Parent Modal State
    const [linkingStudent, setLinkingStudent] = useState(null);
    const [selectedParentId, setSelectedParentId] = useState('');
    const [isLinkSubmitting, setIsLinkSubmitting] = useState(false);

    // Attendance Modal State
    const [attendanceStudent, setAttendanceStudent] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceStatus, setAttendanceStatus] = useState('present');
    const [attendanceCheckIn, setAttendanceCheckIn] = useState('07:15');
    const [attendanceCheckOut, setAttendanceCheckOut] = useState('15:30');
    const [attendanceNotes, setAttendanceNotes] = useState('');
    const [isAttendanceSubmitting, setIsAttendanceSubmitting] = useState(false);

    const handleFilter = (newSearch, newClass, newStatus) => {
        router.get(
            '/admin/students',
            {
                search: newSearch !== undefined ? newSearch : search,
                class_id: newClass !== undefined ? newClass : classId,
                parent_status: newStatus !== undefined ? newStatus : parentStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilter(search, classId, parentStatus);
    };

    // Selection handlers
    const isAllSelected = students.data.length > 0 && students.data.every((s) => selectedStudentIds.includes(s.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.data.map((s) => s.id));
        }
    };

    const toggleSelectStudent = (id) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    // Export Students (.xlsx)
    const handleExportStudents = () => {
        const query = new URLSearchParams({
            search: search,
            class_id: classId,
            parent_status: parentStatus,
        }).toString();

        window.location.href = `/admin/students/export?${query}`;
    };

    // Batch Modal Handlers
    const openBatchModal = (type) => {
        setBatchModalType(type);
        setBatchStep(1);
        setFromClassId(classId !== 'all' ? classId : (classes[0]?.id ? String(classes[0].id) : ''));
        setToClassId(classes[1]?.id ? String(classes[1].id) : (classes[0]?.id ? String(classes[0].id) : ''));
        setBatchNotes('');
        setBatchConfirmChecked(false);
        setPreviewData(null);
    };

    const closeBatchModal = () => {
        setBatchModalType(null);
        setBatchStep(1);
        setPreviewData(null);
    };

    const fetchBatchPreview = async () => {
        if (!fromClassId || !toClassId) return;

        setIsPreviewLoading(true);
        const endpoint = batchModalType === 'promote'
            ? '/admin/students/batch-promote/preview'
            : '/admin/students/batch-transfer/preview';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    from_class_id: fromClassId,
                    to_class_id: toClassId,
                    student_ids: selectedStudentIds.length > 0 ? selectedStudentIds : null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPreviewData(data);
                setBatchStep(2);
            }
        } catch (error) {
            console.error('Error fetching preview:', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const executeBatchAction = () => {
        if (!fromClassId || !toClassId || !previewData) return;

        const studentIdsToProcess = previewData.students
            .filter((s) => s.status === 'ready')
            .map((s) => s.id);

        if (studentIdsToProcess.length === 0) return;

        setIsBatchExecuting(true);

        const endpoint = batchModalType === 'promote'
            ? '/admin/students/batch-promote'
            : '/admin/students/batch-transfer';

        router.post(
            endpoint,
            {
                from_class_id: fromClassId,
                to_class_id: toClassId,
                student_ids: studentIdsToProcess,
                notes: batchNotes,
            },
            {
                onSuccess: () => {
                    closeBatchModal();
                    setSelectedStudentIds([]);
                },
                onFinish: () => setIsBatchExecuting(false),
            }
        );
    };

    // RFID Modal Handlers
    const openAssignRfidModal = (student, mode = 'assign') => {
        setSelectedStudentForRfid(student);
        setRfidMode(mode);
        setRfidUidInput(mode === 'replace' ? '' : (student.rfid_uid || ''));
        setRfidNotesInput('');
        setIsRfidModalOpen(true);
    };

    const handleRfidSubmit = (e) => {
        e.preventDefault();
        if (!selectedStudentForRfid) return;

        setIsRfidProcessing(true);
        if (rfidMode === 'remove') {
            router.post(`/admin/students/${selectedStudentForRfid.id}/remove-rfid`, {}, {
                onSuccess: () => {
                    setIsRfidModalOpen(false);
                    setSelectedStudentForRfid(null);
                },
                onFinish: () => setIsRfidProcessing(false),
            });
        } else if (rfidMode === 'replace') {
            router.post(`/admin/students/${selectedStudentForRfid.id}/replace-rfid`, {
                new_rfid_uid: rfidUidInput,
                reason: rfidNotesInput,
            }, {
                onSuccess: () => {
                    setIsRfidModalOpen(false);
                    setSelectedStudentForRfid(null);
                },
                onFinish: () => setIsRfidProcessing(false),
            });
        } else {
            router.post(`/admin/students/${selectedStudentForRfid.id}/assign-rfid`, {
                rfid_uid: rfidUidInput,
                notes: rfidNotesInput,
            }, {
                onSuccess: () => {
                    setIsRfidModalOpen(false);
                    setSelectedStudentForRfid(null);
                },
                onFinish: () => setIsRfidProcessing(false),
            });
        }
    };

    // Import XLSX Handlers
    const openImportModal = () => {
        setIsImportModalOpen(true);
        setImportStep(1);
        setImportFile(null);
        setImportPreviewData(null);
        setImportErrorMessage('');
        setImportResult(null);
        setIsAddMenuOpen(false);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportStep(1);
        setImportFile(null);
        setImportPreviewData(null);
        setImportErrorMessage('');
        setImportResult(null);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.name.endsWith('.xlsx')) {
                setImportErrorMessage('Format file tidak didukung. Silakan gunakan file Excel .xlsx.');
                setImportFile(null);
                return;
            }
            setImportErrorMessage('');
            setImportFile(file);
        }
    };

    const handleUploadPreview = async () => {
        if (!importFile) return;

        setIsImportPreviewLoading(true);
        setImportErrorMessage('');
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await fetch('/admin/students/import/preview', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setImportPreviewData(data);
                setImportStep(2);
            } else {
                setImportErrorMessage(data.message || 'Format file tidak didukung. Silakan gunakan file Excel .xlsx.');
            }
        } catch (error) {
            console.error('Error previewing import:', error);
            setImportErrorMessage('Terjadi kesalahan saat memproses file Excel.');
        } finally {
            setIsImportPreviewLoading(false);
        }
    };

    const handleDownloadErrorReport = async () => {
        if (!importPreviewData) return;

        const errorRows = importPreviewData.rows.filter((r) => r.row_status === 'error');

        try {
            const response = await fetch('/admin/students/import/error-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    error_rows: errorRows,
                    summary: {
                        total_rows: importPreviewData.total_rows,
                        valid_count: importPreviewData.valid_count,
                        warning_count: importPreviewData.warning_count,
                        error_count: importPreviewData.error_count,
                    },
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `import_error_siswa_${new Date().getFullYear()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error('Error downloading error report:', error);
        }
    };

    const executeImportStudents = async () => {
        if (!importPreviewData || importPreviewData.valid_count === 0) return;

        const validRows = importPreviewData.rows.filter((r) => r.row_status !== 'error');

        setIsImportExecuting(true);

        try {
            const response = await fetch('/admin/students/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ rows: validRows }),
            });

            if (response.ok) {
                const result = await response.json();
                setImportResult(result);
                setImportStep(3);
                router.reload({ only: ['students', 'stats'] });
            }
        } catch (error) {
            console.error('Error executing import:', error);
            alert('Gagal mengeksekusi import data.');
        } finally {
            setIsImportExecuting(false);
        }
    };

    const handleDownloadCredentials = async () => {
        if (!importResult || !importResult.credentials) return;

        try {
            const response = await fetch('/admin/students/import/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ credentials: importResult.credentials }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `credential_siswa_${new Date().getFullYear()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error('Error downloading credentials:', error);
        }
    };

    // Quick Link Parent
    const openLinkModal = (student) => {
        setLinkingStudent(student);
        setSelectedParentId(student.parent_id ? String(student.parent_id) : '');
    };

    const closeLinkModal = () => {
        setLinkingStudent(null);
        setSelectedParentId('');
    };

    const submitLinkParent = (e) => {
        e.preventDefault();
        if (!linkingStudent) return;

        setIsLinkSubmitting(true);
        router.post(
            `/admin/students/${linkingStudent.id}/link-parent`,
            { parent_id: selectedParentId || null },
            {
                onSuccess: () => closeLinkModal(),
                onFinish: () => setIsLinkSubmitting(false),
            }
        );
    };

    // Quick Attendance
    const openAttendanceModal = (student) => {
        setAttendanceStudent(student);
        setAttendanceDate(new Date().toISOString().split('T')[0]);
        setAttendanceStatus('present');
        setAttendanceCheckIn('07:15');
        setAttendanceCheckOut('15:30');
        setAttendanceNotes('');
    };

    const closeAttendanceModal = () => {
        setAttendanceStudent(null);
    };

    const submitAttendance = (e) => {
        e.preventDefault();
        if (!attendanceStudent) return;

        setIsAttendanceSubmitting(true);
        router.post(
            `/admin/students/${attendanceStudent.id}/attendance`,
            {
                date: attendanceDate,
                status: attendanceStatus,
                check_in: attendanceCheckIn,
                check_out: attendanceCheckOut,
                notes: attendanceNotes,
            },
            {
                onSuccess: () => closeAttendanceModal(),
                onFinish: () => setIsAttendanceSubmitting(false),
            }
        );
    };

    return (
        <AdminLayout title="Manajemen Data Siswa & Kenaikan Kelas">
            <Head title="Data Siswa & Kelas" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
                                <Users className="w-3.5 h-3.5 text-indigo-300" />
                                <span>Manajemen Siswa, XLSX Import/Export & Batch Kenaikan Kelas</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Direktori Siswa & Manajemen Rombel
                            </h1>
                            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
                                Daftarkan siswa baru secara manual, import massal dari berkas Microsoft Excel (.xlsx), unduh kredensial akun, serta eksekusi mutasi & kenaikan jenjang rombel secara aman.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* "+ Tambah Siswa" Portal Dropdown */}
                            <Dropdown
                                align="end"
                                side="bottom"
                                sideOffset={8}
                                trigger={
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="md"
                                        leftIcon={Plus}
                                        rightIcon={ChevronDown}
                                        className="bg-brand-500 hover:bg-brand-600 text-white border-none font-bold shadow-md text-xs"
                                    >Tambah Siswa
                                    </Button>
                                }
                            >
                                <Link
                                    href="/admin/students/create"
                                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900">1. Tambah Manual</p>
                                        <p className="text-[10px] text-slate-400 font-normal">Formulir pendaftaran satu per satu</p>
                                    </div>
                                </Link>

                                <Dropdown.Divider />

                                <Dropdown.Item
                                    icon={FileSpreadsheet}
                                    iconColor="bg-emerald-50 text-emerald-600"
                                    title="2. Import dari Excel (.xlsx)"
                                    description="Upload template data siswa massal"
                                    onClick={openImportModal}
                                />
                            </Dropdown>

                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                leftIcon={Download}
                                onClick={handleExportStudents}
                                className="bg-white/15 text-white hover:bg-white/25 border-white/20 font-bold backdrop-blur-md text-xs"
                            >
                                Export Excel (.xlsx)
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                leftIcon={TrendingUp}
                                onClick={() => openBatchModal('promote')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold shadow-md text-xs"
                            >
                                Batch Naik Kelas
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                leftIcon={Repeat}
                                onClick={() => openBatchModal('transfer')}
                                className="bg-white/15 text-white hover:bg-white/25 border-white/20 font-bold backdrop-blur-md text-xs"
                            >
                                Batch Pindah
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 4 Bento Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <BentoCard
                        colSpan="col-span-1"
                        icon={Users}
                        badge="Total Siswa"
                        title={stats.total?.toLocaleString('id-ID') ?? '0'}
                        description="Siswa terdaftar aktif di database"
                        iconColor="text-brand-600 bg-brand-50 border-brand-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserCheck}
                        badge="Terhubung Ortu"
                        title={stats.linked?.toLocaleString('id-ID') ?? '0'}
                        description="Siswa dengan akun wali murid aktif"
                        iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={UserX}
                        badge="Belum Terhubung"
                        title={stats.unlinked?.toLocaleString('id-ID') ?? '0'}
                        description="Perlu ditautkan ke akun orang tua"
                        iconColor="text-amber-600 bg-amber-50 border-amber-200"
                    />

                    <BentoCard
                        colSpan="col-span-1"
                        icon={School}
                        badge="Rombel Aktif"
                        title={stats.classes_count?.toLocaleString('id-ID') ?? '0'}
                        description="Total rombongan belajar terdaftar"
                        iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                    />
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                            <Input
                                placeholder="Cari NIS, NISN, atau Nama Siswa..."
                                leftIcon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={classId}
                                onChange={(e) => {
                                    setClassId(e.target.value);
                                    handleFilter(search, e.target.value, parentStatus);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                            >
                                <option value="all">Semua Kelas / Rombel</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.students_count} siswa)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <select
                                value={parentStatus}
                                onChange={(e) => {
                                    setParentStatus(e.target.value);
                                    handleFilter(search, classId, e.target.value);
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                            >
                                <option value="all">Status Wali: Semua</option>
                                <option value="linked">Sudah Terhubung Ortu</option>
                                <option value="unlinked">Belum Terhubung Ortu</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Bulk Selection Floating Action Bar */}
                {selectedStudentIds.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-xs">
                                {selectedStudentIds.length}
                            </div>
                            <div>
                                <p className="text-xs font-bold">
                                    {selectedStudentIds.length} Siswa Dipilih
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Pilih aksi massal untuk rombel siswa yang dicentang
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                leftIcon={TrendingUp}
                                onClick={() => openBatchModal('promote')}
                                className="text-xs bg-emerald-500 hover:bg-emerald-600 font-bold"
                            >
                                Naikkan Terpilih
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                leftIcon={Repeat}
                                onClick={() => openBatchModal('transfer')}
                                className="text-xs bg-slate-800 text-slate-200 hover:bg-slate-700"
                            >
                                Pindahkan Terpilih
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudentIds([])}
                                className="text-xs text-slate-400 hover:text-white"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}

                {/* Students Table */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    {students.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Data Siswa Tidak Ditemukan"
                            description={search ? `Tidak ada siswa yang cocok dengan filter pencarian.` : 'Belum ada data siswa yang tersimpan.'}
                            actionLabel={search ? 'Reset Filter' : 'Tambah Siswa Baru'}
                            onAction={() => {
                                if (search) {
                                    setSearch('');
                                    setClassId('all');
                                    setParentStatus('all');
                                    handleFilter('', 'all', 'all');
                                } else {
                                    router.visit('/admin/students/create');
                                }
                            }}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="py-3.5 px-4">Siswa</th>
                                        <th className="py-3.5 px-4">NIS / NISN</th>
                                        <th className="py-3.5 px-4">Kelas & Rombel</th>
                                        <th className="py-3.5 px-4">RFID Card</th>
                                        <th className="py-3.5 px-4">Akun Orang Tua</th>
                                        <th className="py-3.5 px-4 text-center">Presensi</th>
                                        <th className="py-3.5 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.data.map((student) => {
                                        const hasParent = Boolean(student.parent);
                                        const isSelected = selectedStudentIds.includes(student.id);
                                        const className = student.classes?.[0]?.name || student.grade_level || 'Belum Ada Kelas';

                                        return (
                                            <tr
                                                key={student.id}
                                                className={`transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'
                                                    }`}
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectStudent(student.id)}
                                                        className="w-4 h-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                    />
                                                </td>

                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs border border-indigo-100 shrink-0">
                                                            {student.user?.name ? student.user.name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/admin/students/${student.id}`}
                                                                className="font-extrabold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1 block"
                                                            >
                                                                {student.user?.name || 'Siswa'}
                                                            </Link>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate">
                                                                {student.user?.email || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 font-mono">
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-800 font-bold">
                                                            NISN: {student.nisn || '-'}
                                                        </p>
                                                        <p className="text-slate-500 text-[11px]">
                                                            NIS: {student.nis || '-'}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    <Badge variant="indigo" size="sm">
                                                        {className}
                                                    </Badge>
                                                </td>

                                                <td className="py-3 px-4">
                                                    {student.rfid_uid ? (
                                                        <div className="space-y-1">
                                                            <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                                <Radio className="w-3 h-3 text-emerald-600" />
                                                                <span>{student.rfid_uid}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => openAssignRfidModal(student, 'replace')}
                                                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold block cursor-pointer"
                                                            >
                                                                Ganti / Lepas
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openAssignRfidModal(student, 'assign')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-slate-300 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            <span>Assign RFID</span>
                                                        </button>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    {hasParent ? (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-slate-900">
                                                                    {student.parent?.user?.name || 'Wali Terdaftar'}
                                                                </span>
                                                                <Badge variant="emerald" size="xs">
                                                                    {student.parent?.relationship_type || 'Wali'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 font-mono">
                                                                {student.parent?.phone || student.parent?.user?.email || '-'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="amber" size="sm" dot>
                                                            Belum Terhubung
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        leftIcon={Calendar}
                                                        onClick={() => openAttendanceModal(student)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Presensi
                                                    </Button>
                                                </td>

                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={`/admin/students/${student.id}`}>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                leftIcon={Eye}
                                                                className="text-xs"
                                                            >
                                                                Detail
                                                            </Button>
                                                        </Link>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            leftIcon={hasParent ? Unlink : LinkIcon}
                                                            onClick={() => openLinkModal(student)}
                                                            className="text-xs text-slate-600 hover:text-brand-600"
                                                        >
                                                            {hasParent ? 'Wali' : 'Hubung'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {students.links && students.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {students.from || 0} - {students.to || 0} dari {students.total} siswa
                            </span>
                            <div className="flex items-center gap-1">
                                {students.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                        disabled={!link.url || link.active}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${link.active
                                            ? 'bg-brand-600 text-white'
                                            : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 cursor-not-allowed'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Multi-Step Modal: Import Microsoft Excel (.xlsx) */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Import Microsoft Excel Open XML (.xlsx)</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">
                                    Import Data Akun Siswa (.xlsx)
                                </h3>
                            </div>

                            <button
                                onClick={closeImportModal}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Error Notification */}
                        {importErrorMessage && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="text-xs space-y-0.5">
                                    <p className="font-bold">Format Berkas Tidak Sesuai</p>
                                    <p>{importErrorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Download Template & Upload File */}
                        {importStep === 1 && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-indigo-900">
                                            1. Download Template Resmi Excel (.xlsx)
                                        </h4>
                                        <p className="text-[11px] text-indigo-700 leading-relaxed">
                                            Workbook memiliki 2 Sheet ("Data Siswa" & "Petunjuk") dilengkapi dropdown Data Validation otomatis.
                                        </p>
                                    </div>

                                    <a href="/admin/students/template" download>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            leftIcon={Download}
                                            className="text-xs font-bold shrink-0 bg-white"
                                        >
                                            Download Template Excel (.xlsx)
                                        </Button>
                                    </a>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        2. Unggah Berkas Excel (.xlsx)
                                    </label>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 space-y-2"
                                    >
                                        <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
                                        <div className="text-xs text-slate-600">
                                            {importFile ? (
                                                <span className="font-bold text-emerald-700 text-sm">{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-slate-900">Klik untuk memilih file .xlsx</span> atau seret berkas ke sini
                                                    <p className="text-[11px] text-slate-400 mt-1">Wajib format Microsoft Excel (.xlsx) OpenXML</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={closeImportModal}
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        leftIcon={ArrowRight}
                                        disabled={!importFile}
                                        isLoading={isImportPreviewLoading}
                                        onClick={handleUploadPreview}
                                        className="font-bold"
                                    >
                                        Validasi & Preview Data (.xlsx)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Live Validation Preview & Execute */}
                        {importStep === 2 && importPreviewData && (
                            <div className="space-y-5">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">
                                                Berkas: <span className="font-mono text-brand-700">{importPreviewData.filename}</span>
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Total: {importPreviewData.total_rows} • Valid: <strong className="text-emerald-600">{importPreviewData.valid_count}</strong> • Warning: <strong className="text-amber-600">{importPreviewData.warning_count}</strong> • Error: <strong className="text-rose-600">{importPreviewData.error_count}</strong>
                                            </p>
                                        </div>

                                        {importPreviewData.error_count > 0 && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="xs"
                                                leftIcon={Download}
                                                onClick={handleDownloadErrorReport}
                                                className="text-xs text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 font-bold"
                                            >
                                                Download Error Report (.xlsx)
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Rows Table */}
                                <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">#</th>
                                                <th className="py-2.5 px-3">NIS</th>
                                                <th className="py-2.5 px-3">Nama Lengkap</th>
                                                <th className="py-2.5 px-3">Kelas & Thn Ajaran</th>
                                                <th className="py-2.5 px-3 text-center">Status Validasi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {importPreviewData.rows.map((r, i) => (
                                                <tr key={i} className={r.row_status === 'error' ? 'bg-rose-50/60' : (r.row_status === 'warning' ? 'bg-amber-50/40' : 'hover:bg-slate-50')}>
                                                    <td className="py-2.5 px-3 font-mono text-slate-400">{r.row_number}</td>
                                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.nis || '-'}</td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.name || '-'}</td>
                                                    <td className="py-2.5 px-3 text-slate-700">
                                                        <span className="font-semibold text-indigo-700">{r.class_name || '-'}</span>
                                                        <span className="text-[10px] text-slate-400 block">{r.academic_year_name || '-'}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        {r.row_status === 'valid' && (
                                                            <Badge variant="emerald" size="xs">
                                                                Valid & Siap
                                                            </Badge>
                                                        )}
                                                        {r.row_status === 'warning' && (
                                                            <Badge variant="amber" size="xs">
                                                                Warning: {r.warnings?.[0]}
                                                            </Badge>
                                                        )}
                                                        {r.row_status === 'error' && (
                                                            <Badge variant="rose" size="xs">
                                                                Error: {r.issues?.[0]}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setImportStep(1)}
                                        disabled={isImportExecuting}
                                    >
                                        Unggah File Lain
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        disabled={importPreviewData.valid_count === 0}
                                        isLoading={isImportExecuting}
                                        onClick={executeImportStudents}
                                        leftIcon={Check}
                                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                                    >
                                        Proses Import ({importPreviewData.valid_count} Siswa)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Result & Credential Export */}
                        {importStep === 3 && importResult && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black">Import Data Siswa Berhasil!</h4>
                                            <p className="text-xs text-emerald-800">
                                                Sebanyak <strong>{importResult.imported_count} akun siswa</strong> berhasil dibuat dan didaftarkan pada rombel aktif.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Credential Warning Banner */}
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-900 space-y-1">
                                        <p className="font-bold">Keamanan Password & Kredensial Siswa</p>
                                        <p className="leading-relaxed">
                                            File credential berisi password sementara. Simpan dengan aman. Password di database telah di-hash secara permanen dan tidak dapat dilihat kembali.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="md"
                                        leftIcon={Download}
                                        onClick={handleDownloadCredentials}
                                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs shadow-md"
                                    >
                                        Download Credential Siswa (.xlsx)
                                    </Button>
                                </div>

                                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={closeImportModal}
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interactive Multi-Step Bento Modal: Batch Naik Kelas & Batch Pindah Kelas */}
            {batchModalType && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        {/* Step Indicators */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
                                    {batchModalType === 'promote' ? (
                                        <>
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Wizard Batch Kenaikan Kelas</span>
                                        </>
                                    ) : (
                                        <>
                                            <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>Wizard Batch Pindah Rombel / Kelas</span>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {batchModalType === 'promote' ? 'Kenaikan Kelas Siswa' : 'Pindah Rombongan Belajar'}
                                </h3>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${batchStep === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}>1</span>
                                <span className="text-slate-300">→</span>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${batchStep === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}>2</span>
                                <span className="text-slate-300">→</span>
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${batchStep === 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}>3</span>
                            </div>
                        </div>

                        {/* STEP 1: Pilih Kelas Asal & Tujuan */}
                        {batchStep === 1 && (
                            <div className="space-y-5">
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {batchModalType === 'promote'
                                        ? 'Pilih kelas asal dan kelas jenjang berikutnya untuk proses kenaikan kelas. Siswa akan otomatis dibuatkan riwayat enrollment baru.'
                                        : 'Pilih kelas asal dan kelas tujuan untuk memindahkan rombel belajar siswa.'}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Kelas Asal <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={fromClassId}
                                            onChange={(e) => setFromClassId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                        >
                                            <option value="">-- Pilih Kelas Asal --</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.students_count} siswa) • {c.academic_year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Kelas Tujuan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={toClassId}
                                            onChange={(e) => setToClassId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                        >
                                            <option value="">-- Pilih Kelas Tujuan --</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} (Tingkat {c.grade_level}) • {c.academic_year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {selectedStudentIds.length > 0 && (
                                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-medium">
                                        ℹ️ Mode Seleksi Aktif: Memproses <strong>{selectedStudentIds.length} siswa</strong> yang telah dicentang sebelumnya di tabel.
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={closeBatchModal}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        isLoading={isPreviewLoading}
                                        disabled={!fromClassId || !toClassId || fromClassId === toClassId}
                                        onClick={fetchBatchPreview}
                                        leftIcon={ArrowRight}
                                    >
                                        Lanjut ke Preview
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Live Preview & Validasi Status */}
                        {batchStep === 2 && previewData && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            Dari: <span className="text-brand-700 font-black">{previewData.from_class.name}</span> → Ke: <span className="text-emerald-700 font-black">{previewData.to_class.name}</span>
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Total: {previewData.total_found} siswa • Siap: {previewData.ready_count} • Dilewati: {previewData.skip_count}
                                        </p>
                                    </div>

                                    <Badge variant={previewData.skip_count > 0 ? 'amber' : 'emerald'} size="sm">
                                        {previewData.ready_count} Siswa Siap
                                    </Badge>
                                </div>

                                {/* Preview Student Table */}
                                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-3">Nama Siswa</th>
                                                <th className="py-2.5 px-3">NISN</th>
                                                <th className="py-2.5 px-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewData.students.map((st) => (
                                                <tr key={st.id} className="hover:bg-slate-50">
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">
                                                        {st.name}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-500">
                                                        {st.nisn || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        {st.status === 'ready' ? (
                                                            <Badge variant="emerald" size="xs">
                                                                Siap Diproses
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="rose" size="xs">
                                                                Dilewati: {st.issues?.[0] || 'Tidak valid'}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setBatchStep(1)}
                                    >
                                        Kembali
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        disabled={previewData.ready_count === 0}
                                        onClick={() => setBatchStep(3)}
                                        leftIcon={ArrowRight}
                                    >
                                        Konfirmasi & Eksekusi ({previewData.ready_count} Siswa)
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Konfirmasi Final & Catatan */}
                        {batchStep === 3 && previewData && (
                            <div className="space-y-5">
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-900 space-y-1">
                                        <p className="font-bold">Konfirmasi Perubahan Riwayat Kelas Siswa</p>
                                        <p className="leading-relaxed">
                                            Sistem akan secara atomik memindahkan <strong>{previewData.ready_count} siswa</strong> dari <strong>{previewData.from_class.name}</strong> ke <strong>{previewData.to_class.name}</strong>. Riwayat kelas lama akan diarsipkan dan log audit tersimpan permanen.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Catatan Perubahan Kelas (Opsional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Contoh: Kenaikan kelas tahun ajaran baru 2026/2027 hasil rapat dewan guru..."
                                        value={batchNotes}
                                        onChange={(e) => setBatchNotes(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                    />
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={batchConfirmChecked}
                                            onChange={(e) => setBatchConfirmChecked(e.target.checked)}
                                            className="w-4 h-4 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        />
                                        <span>Saya memahami dan menyetujui pemindahan {previewData.ready_count} siswa ini.</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setBatchStep(2)}
                                        disabled={isBatchExecuting}
                                    >
                                        Kembali ke Preview
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        isLoading={isBatchExecuting}
                                        disabled={!batchConfirmChecked}
                                        onClick={executeBatchAction}
                                        leftIcon={Check}
                                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                                    >
                                        Proses {batchModalType === 'promote' ? 'Kenaikan' : 'Perpindahan'} Kelas
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Hubungkan Orang Tua */}
            {linkingStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                                <LinkIcon className="w-3.5 h-3.5" />
                                <span>Tautkan Akun Wali</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                Hubungkan Orang Tua Siswa
                            </h3>
                            <p className="text-xs text-slate-500">
                                Siswa: <strong>{linkingStudent.user?.name}</strong> (NISN: {linkingStudent.nisn || '-'})
                            </p>
                        </div>

                        <form onSubmit={submitLinkParent} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Pilih Akun Orang Tua / Wali
                                </label>
                                <select
                                    value={selectedParentId}
                                    onChange={(e) => setSelectedParentId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                >
                                    <option value="">-- Lepas Hubungan / Tanpa Wali --</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.relationship_type || 'Wali'}) • {p.phone || p.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={closeLinkModal}
                                    disabled={isLinkSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    isLoading={isLinkSubmitting}
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Presensi Cepat */}
            {attendanceStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Input Presensi Siswa</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                Catat Kehadiran Harian
                            </h3>
                            <p className="text-xs text-slate-500">
                                Siswa: <strong>{attendanceStudent.user?.name}</strong>
                            </p>
                        </div>

                        <form onSubmit={submitAttendance} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Tanggal Presensi
                                </label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-600">Jam Masuk (Check-In)</label>
                                    <input
                                        type="time"
                                        value={attendanceCheckIn}
                                        onChange={(e) => setAttendanceCheckIn(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold text-slate-600">Jam Keluar (Check-Out)</label>
                                    <input
                                        type="time"
                                        value={attendanceCheckOut}
                                        onChange={(e) => setAttendanceCheckOut(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Status Kehadiran
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'present', label: 'Hadir' },
                                        { id: 'permission', label: 'Izin' },
                                        { id: 'sick', label: 'Sakit' },
                                        { id: 'absent', label: 'Alpa' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setAttendanceStatus(opt.id)}
                                            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${attendanceStatus === opt.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    value={attendanceNotes}
                                    onChange={(e) => setAttendanceNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: Izin mengikuti lomba sains..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={closeAttendanceModal}
                                    disabled={isAttendanceSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    isLoading={isAttendanceSubmitting}
                                >
                                    Simpan Presensi
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RFID Assignment / Replace Modal */}
            {isRfidModalOpen && selectedStudentForRfid && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Radio className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">
                                        {rfidMode === 'remove' ? 'Lepas Kartu RFID' : rfidMode === 'replace' ? 'Ganti Kartu RFID' : 'Tautkan Kartu RFID'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedStudentForRfid.user?.name} (NIS: {selectedStudentForRfid.nis || '-'})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRfidModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {rfidMode === 'remove' ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                                    <p className="font-bold">Apakah Anda yakin ingin menonaktifkan kartu RFID ini?</p>
                                    <p className="font-mono text-[11px]">UID Saat Ini: {selectedStudentForRfid.rfid_uid}</p>
                                    <p className="text-[11px] text-amber-700">Kartu tidak dapat digunakan lagi untuk absensi kiosk sampai ditautkan kembali.</p>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsRfidModalOpen(false)}
                                        disabled={isRfidProcessing}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        onClick={handleRfidSubmit}
                                        isLoading={isRfidProcessing}
                                    >
                                        Lepas Kartu RFID
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleRfidSubmit} className="space-y-4">
                                {selectedStudentForRfid.rfid_uid && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                                        <span className="text-slate-500 font-semibold">UID Saat Ini:</span>
                                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {selectedStudentForRfid.rfid_uid}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        {rfidMode === 'replace' ? 'UID Kartu RFID Baru' : 'UID Kartu RFID'}
                                    </label>
                                    <input
                                        type="text"
                                        value={rfidUidInput}
                                        onChange={(e) => setRfidUidInput(e.target.value.toUpperCase())}
                                        placeholder="Contoh: 04A1B2C3 atau tap kartu pada reader..."
                                        className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:border-indigo-500 outline-none uppercase"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-[10px] text-slate-400">
                                        Scan kartu menggunakan RFID reader USB atau ketik UID secara manual.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Catatan / Keterangan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={rfidNotesInput}
                                        onChange={(e) => setRfidNotesInput(e.target.value)}
                                        placeholder={rfidMode === 'replace' ? 'Contoh: Kartu lama hilang/rusak' : 'Contoh: Kartu baru dibagikan'}
                                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:border-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    {selectedStudentForRfid.rfid_uid ? (
                                        <button
                                            type="button"
                                            onClick={() => setRfidMode('remove')}
                                            className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                                        >
                                            Nonaktifkan Kartu
                                        </button>
                                    ) : <div />}

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setIsRfidModalOpen(false)}
                                            disabled={isRfidProcessing}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="sm"
                                            isLoading={isRfidProcessing}
                                        >
                                            Simpan RFID
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
