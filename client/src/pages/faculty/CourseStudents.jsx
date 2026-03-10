import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, Search, Plus, Trash2, ArrowLeft, Mail, Upload, Download, BarChart2, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEPARTMENT_DATA = {
    'Aided': {
        'PG': ['M.A., History', 'M.A., English Literature', 'B.Sc., Mathematics', 'M.Sc., Botany', 'M.Com., Commerce'],
        'UG': ['B.A., History', 'B.A., English', 'B.Sc., Mathematics', 'B.Sc., Physics', 'B.Sc., Chemistry', 'B.Sc., Botany', 'B.Sc., Zoology', 'B.Sc., Nutrition & Dietetics', 'B.Sc., Computer Science', 'B.Com.']
    },
    'Self Financing': {
        'PG': ['M.A., History', 'M.A., English Literature', 'B.Sc., Mathematics', 'M.Sc., Botany', 'M.Com., Commerce', 'M.A., English Literature', 'M.Sc., Mathematics', 'M.Sc., Physics', 'M.Sc., Foods & Nutrition', 'M.C.A., Computer Applications', 'M.Sc., Computer Science', 'M.Com.', 'M.Com., CA', 'M.Com., Corporate Secretaryship', 'M.L.I.Sc.', 'M.A., Tamil', 'M.Sc., Chemistry', 'MSW', 'M.Sc., Zoology'],
        'UG': ['B.A., English Literature', 'B.Sc., Mathematics', 'B.Sc., Physics', 'B.Sc., Biochemistry', 'B.C.A.', 'B.Sc., Computer Science (Additional Section)', 'B.Sc., Information Technology', 'B.Sc., Computer Technology', 'B.Sc., Costume Design & Fashion', 'B.Com., (Additional Section)', 'B.Com., with CA (Additional Section)', 'B.Com., Corporate Secretaryship', 'B.Com., Cooperation', 'B.Com., E-Commerce', 'B.B.A., with CA', 'B.A., Tamil Literature', 'B.Com., Professional Accounting', 'B.Com., Banking and Insurance', 'B.Com., with Accounting and Finance', 'B.Sc., Computer Science with Data Analytics', 'B.Sc., Geography', 'B.Sc., Computer Science with Artificial Intelligence', 'B.Sc., Computer Science with Cyber Security', 'B.Voc Fashion and Boutique Management', 'B.Com., Business Analytics', 'B.Sc., Internet of Things', 'B.Sc., Computer Science with Cognitive Systems']
    }
};

const CourseStudents = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [enrollEmail, setEnrollEmail] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [filters, setFilters] = useState({ stream: '', level: '', department: '' });

    useEffect(() => {
        fetchStudents();
    }, [courseId, filters]);

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.stream) params.append('stream', filters.stream);
            if (filters.level) params.append('level', filters.level);
            if (filters.department) params.append('department', filters.department);

            const response = await api.get(`/faculty/courses/${courseId}/students?${params}`);
            setStudents(response.data.data.students);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await api.get(`/faculty/students/search?query=${val}`);
            setSearchResults(response.data.data.students);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleEnroll = async (email) => {
        try {
            await api.post('/faculty/enroll', { courseId, studentEmail: email });
            toast.success('Student enrolled!');
            fetchStudents();
            setShowSearch(false);
            setSearchQuery('');
            setSearchResults([]);
            setEnrollEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Enrollment failed');
        }
    };

    const handleUnenroll = async (studentId) => {
        if (!window.confirm('Are you sure you want to remove this student from the course?')) return;
        try {
            await api.delete(`/faculty/courses/${courseId}/students/${studentId}`);
            toast.success('Student removed from course');
            fetchStudents();
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        } catch (error) {
            toast.error('Failed to unenroll student');
        }
    };

    const handleBulkUnenroll = async () => {
        if (selectedStudents.length === 0) return;
        if (!window.confirm(`Are you sure you want to unenroll ${selectedStudents.length} selected students?`)) return;

        const loadingToast = toast.loading(`Unenrolling students...`);
        try {
            // Since we don't have a bulk unenroll endpoint yet, we loop through (or create one)
            // For now, I'll assume we might need a controller change or just loop if small
            // But usually bulk actions are better on server side.
            // Let's create a bulk unenroll route if I can, or just loop for now.
            for (const id of selectedStudents) {
                await api.delete(`/faculty/courses/${courseId}/students/${id}`);
            }
            toast.dismiss(loadingToast);
            toast.success('Selected students removed');
            setSelectedStudents([]);
            fetchStudents();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to unenroll some students');
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const selectAllStudents = () => {
        setSelectedStudents(students.map(s => s.id));
    };

    const clearSelection = () => {
        setSelectedStudents([]);
    };

    const handleBulkEnrollCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) {
                toast.error('CSV file is empty or missing data rows');
                return;
            }

            const headerRow = rows[0].split(',').map(h => h.trim().toLowerCase());
            const emailIndex = headerRow.indexOf('email');

            if (emailIndex === -1) {
                toast.error('CSV must have an "email" column');
                return;
            }

            const emails = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim());
                return values[emailIndex];
            }).filter(email => email && email.includes('@'));

            if (emails.length === 0) {
                toast.error('No valid emails found in CSV');
                return;
            }

            const loadingToast = toast.loading(`Enrolling ${emails.length} students...`);
            try {
                const response = await api.post('/faculty/enroll/bulk', { courseId, emails });
                toast.dismiss(loadingToast);
                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchStudents();
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.response?.data?.message || 'Bulk enrollment failed');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const downloadSampleTemplate = () => {
        const csvContent = 'name,email\nJohn Doe,john.doe@vcw.ac.in\nJane Smith,jane.s@vcw.ac.in';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enrollment_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    const totalPasses = students.reduce((acc, s) => acc + (s.pass_count || 0), 0);
    const totalFailures = students.reduce((acc, s) => acc + (s.fail_count || 0), 0);

    const passFailData = {
        labels: ['Passes', 'Failures'],
        datasets: [{
            data: [totalPasses, totalFailures],
            backgroundColor: ['#10B981', '#EF4444'],
            hoverBackgroundColor: ['#059669', '#DC2626'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/faculty')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">Course Students</h1>
                        <p className="page-subtitle">Manage student enrollments</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button className="btn btn-ghost" onClick={downloadSampleTemplate}>
                        <Download size={18} /> Template
                    </button>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={18} /> Bulk Enroll
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleBulkEnrollCSV}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button className="btn btn-primary" onClick={() => setShowSearch(!showSearch)}>
                        <Plus size={20} /> Enroll Student
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-3">
                <select
                    className="form-select"
                    value={filters.stream}
                    onChange={(e) => setFilters({ ...filters, stream: e.target.value, level: '', department: '' })}
                    style={{ width: 'auto' }}
                >
                    <option value="">All Funding</option>
                    <option value="Aided">Aided</option>
                    <option value="Self Financing">Self Financing</option>
                </select>

                <select
                    className="form-select"
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value, department: '' })}
                    style={{ width: 'auto' }}
                    disabled={!filters.stream}
                >
                    <option value="">All Levels</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                </select>

                <select
                    className="form-select"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    style={{ width: 'auto' }}
                    disabled={!filters.level}
                >
                    <option value="">All Departments</option>
                    {filters.stream && filters.level && DEPARTMENT_DATA[filters.stream]?.[filters.level]?.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-2 mb-3">
                <div className="card p-3">
                    <h3 className="card-title mb-2 flex items-center gap-1"><BarChart2 size={18} /> Performance Overview</h3>
                    <div className="grid grid-3 gap-2">
                        <div className="stat-card">
                            <div className="stat-label">Course Avg</div>
                            <div className="stat-value">
                                {students.length > 0
                                    ? (students.reduce((acc, s) => acc + (s.avg_score || 0), 0) / students.filter(s => s.avg_score !== null).length || 0).toFixed(1)
                                    : 0}%
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Passes</div>
                            <div className="stat-value text-success">{totalPasses}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Total Failures</div>
                            <div className="stat-value text-danger">{totalFailures}</div>
                        </div>
                    </div>
                </div>
                <div className="card p-3">
                    <h3 className="card-title mb-2 flex items-center gap-1"><PieChart size={18} /> Pass/Fail Ratio</h3>
                    <div style={{ height: '140px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '140px' }}>
                            <Doughnut
                                data={passFailData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 10 } } } }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showSearch && (
                <div className="card mb-3 animate-slide-down">
                    <div className="card-header">
                        <h3 className="card-title">Search & Enroll</h3>
                    </div>
                    <div className="form-group mb-2">
                        <div className="input-wrapper">
                            <Search size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="search-results">
                        {searchResults.map(student => (
                            <div key={student.id} className="search-item flex justify-between items-center p-2 hover:bg-tertiary rounded">
                                <div>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-muted small">{student.email}</div>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(student.email)}>
                                    Enroll
                                </button>
                            </div>
                        ))}
                        {searchQuery.length >= 2 && searchResults.length === 0 && (
                            <div className="text-center p-3 text-muted">No students found</div>
                        )}
                        {searchQuery.length < 2 && (
                            <div className="text-center p-3 text-muted">Enter at least 2 characters to search</div>
                        )}
                    </div>

                    <div className="divider my-3">OR</div>

                    <div className="form-group mb-0">
                        <label className="form-label">Direct Enrollment</label>
                        <div className="flex gap-1">
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter student email..."
                                value={enrollEmail}
                                onChange={(e) => setEnrollEmail(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={() => handleEnroll(enrollEmail)}>
                                Enroll
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr style={{ background: 'var(--bg-tertiary)' }}>
                                <th colSpan="7">
                                    <div className="flex justify-between items-center py-1">
                                        <div className="flex items-center gap-2">
                                            <button className="btn btn-ghost btn-sm" onClick={selectAllStudents}>
                                                Select All
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={clearSelection}>
                                                Clear
                                            </button>
                                            {selectedStudents.length > 0 && (
                                                <button className="btn btn-ghost btn-sm text-danger flex items-center gap-1" onClick={handleBulkUnenroll}>
                                                    <Trash2 size={14} /> Unenroll ({selectedStudents.length})
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {selectedStudents.length} of {students.length} selected
                                        </div>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Avg. %</th>
                                <th>P/F</th>
                                <th>Enrolled At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map((student) => (
                                <tr key={student.id} className={selectedStudents.includes(student.id) ? 'selected-row' : ''}>
                                    <td onClick={() => toggleStudentSelection(student.id)} style={{ cursor: 'pointer' }}>
                                        <div className={`question-checkbox ${selectedStudents.includes(student.id) ? 'selected' : ''}`} style={{ width: '20px', height: '20px' }}>
                                            {selectedStudents.includes(student.id) && <Plus size={12} style={{ transform: 'rotate(45deg)' }} />}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="user-avatar-sm">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td>{student.email}</td>
                                    <td>
                                        <div className="font-semibold" style={{ color: student.avg_score >= 40 ? 'var(--success-500)' : 'var(--error-500)' }}>
                                            {student.avg_score !== null ? `${student.avg_score}%` : 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <span className="badge badge-success px-1" title="Passes">{student.pass_count || 0}</span>
                                            <span className="badge badge-danger px-1" title="Failures">{student.fail_count || 0}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(student.enrolled_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-ghost text-danger btn-icon"
                                            onClick={() => handleUnenroll(student.id)}
                                            title="Unenroll Student"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted p-4">
                                        No students enrolled in this course yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .selected-row {
                    background: rgba(99, 102, 241, 0.05);
                }
                .question-checkbox {
                    border: 2px solid var(--neutral-500);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .question-checkbox.selected {
                    background: var(--primary-500);
                    border-color: var(--primary-500);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default CourseStudents;
