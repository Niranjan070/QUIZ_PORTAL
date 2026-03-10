import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, X, Key, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Admin.css';

const DEPARTMENT_DATA = {
    'Aided': {
        'PG': [
            'M.A., History',
            'M.A., English Literature',
            'B.Sc., Mathematics',
            'M.Sc., Botany',
            'M.Com., Commerce'
        ],
        'UG': [
            'B.A., History',
            'B.A., English',
            'B.Sc., Mathematics',
            'B.Sc., Physics',
            'B.Sc., Chemistry',
            'B.Sc., Botany',
            'B.Sc., Zoology',
            'B.Sc., Nutrition & Dietetics',
            'B.Sc., Computer Science',
            'B.Com.'
        ]
    },
    'Self Financing': {
        'PG': [
            'M.A., History',
            'M.A., English Literature',
            'B.Sc., Mathematics',
            'M.Sc., Botany',
            'M.Com., Commerce',
            'M.A., English Literature',
            'M.Sc., Mathematics',
            'M.Sc., Physics',
            'M.Sc., Foods & Nutrition',
            'M.C.A., Computer Applications',
            'M.Sc., Computer Science',
            'M.Com.',
            'M.Com., CA',
            'M.Com., Corporate Secretaryship',
            'M.L.I.Sc.',
            'M.A., Tamil',
            'M.Sc., Chemistry',
            'MSW',
            'M.Sc., Zoology'
        ],
        'UG': [
            'B.A., English Literature',
            'B.Sc., Mathematics',
            'B.Sc., Physics',
            'B.Sc., Biochemistry',
            'B.C.A.',
            'B.Sc., Computer Science (Additional Section)',
            'B.Sc., Information Technology',
            'B.Sc., Computer Technology',
            'B.Sc., Costume Design & Fashion',
            'B.Com., (Additional Section)',
            'B.Com., with CA (Additional Section)',
            'B.Com., Corporate Secretaryship',
            'B.Com., Cooperation',
            'B.Com., E-Commerce',
            'B.B.A., with CA',
            'B.A., Tamil Literature',
            'B.Com., Professional Accounting',
            'B.Com., Banking and Insurance',
            'B.Com., with Accounting and Finance',
            'B.Sc., Computer Science with Data Analytics',
            'B.Sc., Geography',
            'B.Sc., Computer Science with Artificial Intelligence',
            'B.Sc., Computer Science with Cyber Security',
            'B.Voc Fashion and Boutique Management',
            'B.Com., Business Analytics',
            'B.Sc., Internet of Things',
            'B.Sc., Computer Science with Cognitive Systems'
        ]
    }
};

const DESIGNATIONS = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Head of the Department',
    'Guest Lecturer',
    'Teaching Assistant'
];

const FACULTY_DEPARTMENTS = [
    'History',
    'English Literature',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Botany',
    'Zoology',
    'Commerce',
    'Computer Science',
    'Computer Applications',
    'Business Administration',
    'Economics',
    'Tamil',
    'Nutrition & Dietetics',
    'Biochemistry',
    'Information Technology',
    'Costume Design & Fashion',
    'Social Work'
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [filter, setFilter] = useState({
        role: '', search: '', stream: '', level: '', department: '', designation: '', year: ''
    });
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student',
        stream: '', level: '', department_name: '', designation: '', year: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.role) params.append('role', filter.role);
            if (filter.search) params.append('search', filter.search);
            if (filter.stream) params.append('stream', filter.stream);
            if (filter.level) params.append('level', filter.level);
            if (filter.department) params.append('department', filter.department);
            if (filter.designation) params.append('designation', filter.designation);
            if (filter.year) params.append('year', filter.year);

            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', email: '', password: '', role: 'student',
            stream: '', level: '', department_name: '', designation: '', year: ''
        });
        setEditingUser(null);
    };

    const handleImportCSV = async (e) => {
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

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            const usersToImport = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim());
                const user = {};
                headers.forEach((header, index) => {
                    if (header === 'name' || header === 'email' || header === 'password' ||
                        header === 'role' || header === 'stream' || header === 'level' ||
                        header === 'department_name' || header === 'designation' || header === 'year') {
                        user[header] = values[index];
                    }
                });
                if (!user.role) user.role = 'student';
                return user;
            }).filter(u => u.name && u.email && u.password);

            if (usersToImport.length === 0) {
                toast.error('No valid user data found. Required: name, email, password');
                return;
            }

            const loadingToast = toast.loading(`Importing ${usersToImport.length} users...`);
            try {
                const response = await api.post('/admin/users/bulk-import', { users: usersToImport });
                toast.dismiss(loadingToast);
                if (response.data.success) {
                    toast.success(response.data.message);
                    fetchUsers();
                }
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.response?.data?.message || 'Failed to import users');
            }
            // Reset input
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const downloadSampleTemplate = () => {
        const headers = ['name', 'email', 'password', 'role', 'stream', 'level', 'department_name', 'designation', 'year'];
        const sampleData = [
            ['John Doe', 'john.doe@vcw.ac.in', 'Student123', 'student', 'Aided', 'UG', 'Computer Science', '', 'I Year'],
            ['Jane Smith', 'jane.s@vcw.ac.in', 'Student456', 'student', 'Self-Finance', 'PG', 'Mathematics', '', 'II Year'],
            ['Dr. Robert', 'robert@vcw.ac.in', 'Faculty789', 'faculty', '', '', 'Physics', 'Assistant Professor', '']
        ];

        const csvContent = [
            headers.join(','),
            ...sampleData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.toLowerCase().endsWith('@vcw.ac.in')) {
            toast.error('Only @vcw.ac.in emails are allowed');
            return;
        }

        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    isActive: true,
                    stream: formData.role === 'student' ? formData.stream : null,
                    level: formData.role === 'student' ? formData.level : null,
                    department_name: (formData.role === 'student' || formData.role === 'faculty') ? formData.department_name : null,
                    designation: formData.role === 'faculty' ? formData.designation : null,
                    year: formData.role === 'student' ? formData.year : null
                });
                toast.success('User updated!');
            } else {
                await api.post('/admin/users', formData);
                toast.success('User created!');
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            stream: user.stream || '',
            level: user.level || '',
            department_name: user.department_name || '',
            designation: user.designation || '',
            year: user.year || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted!');
            fetchUsers();
            setSelectedUsers(prev => prev.filter(userId => userId !== id));
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) return;

        const loadingToast = toast.loading(`Deleting users...`);
        try {
            for (const id of selectedUsers) {
                await api.delete(`/admin/users/${id}`);
            }
            toast.dismiss(loadingToast);
            toast.success('Selected users deleted');
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to delete some users');
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        setSelectedUsers(users.map(u => u.id));
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    const handleResetPassword = async (id) => {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;

        try {
            await api.put(`/admin/users/${id}/reset-password`, { newPassword });
            toast.success('Password reset!');
        } catch (error) {
            toast.error('Failed to reset password');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage all users in the system</p>
                </div>
                <div className="flex gap-1">
                    <button className="btn btn-ghost" onClick={downloadSampleTemplate}>
                        Get Template
                    </button>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={20} /> Bulk Import
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-3">
                <div className="input-wrapper" style={{ width: 'auto' }}>
                    <Search size={18} className="input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search users..."
                        style={{ paddingLeft: '2.5rem', width: '250px' }}
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>

                <select
                    className="form-select"
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value, stream: '', level: '', department: '', designation: '', year: '' })}
                >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admins</option>
                </select>

                {filter.role === 'student' && (
                    <>
                        <select
                            className="form-select"
                            value={filter.stream}
                            onChange={(e) => setFilter({ ...filter, stream: e.target.value, level: '', department: '' })}
                        >
                            <option value="">All Funding</option>
                            <option value="Aided">Aided</option>
                            <option value="Self Financing">Self Financing</option>
                        </select>

                        {filter.stream && (
                            <select
                                className="form-select"
                                value={filter.level}
                                onChange={(e) => setFilter({ ...filter, level: e.target.value, department: '' })}
                            >
                                <option value="">All Levels</option>
                                <option value="UG">UG</option>
                                <option value="PG">PG</option>
                            </select>
                        )}

                        {filter.stream && filter.level && (
                            <select
                                className="form-select"
                                value={filter.department}
                                onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENT_DATA[filter.stream]?.[filter.level]?.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        )}

                        <select
                            className="form-select"
                            value={filter.year}
                            onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                        >
                            <option value="">All Years</option>
                            <option value="I Year">I Year</option>
                            <option value="II Year">II Year</option>
                            <option value="III Year">III Year</option>
                        </select>
                    </>
                )}

                {filter.role === 'faculty' && (
                    <>
                        <select
                            className="form-select"
                            value={filter.department}
                            onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                        >
                            <option value="">All Departments</option>
                            {FACULTY_DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        <select
                            className="form-select"
                            value={filter.designation}
                            onChange={(e) => setFilter({ ...filter, designation: e.target.value })}
                        >
                            <option value="">All Designations</option>
                            {DESIGNATIONS.map(desig => (
                                <option key={desig} value={desig}>{desig}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="card">
                    {users.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                                        <th colSpan="7">
                                            <div className="flex justify-between items-center py-1 px-2">
                                                <div className="flex items-center gap-2">
                                                    <button className="btn btn-ghost btn-sm" onClick={selectAllUsers}>
                                                        Select All
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={clearSelection}>
                                                        Clear
                                                    </button>
                                                    {selectedUsers.length > 0 && (
                                                        <button className="btn btn-ghost btn-sm text-danger flex items-center gap-1" onClick={handleBulkDelete}>
                                                            <Trash2 size={14} /> Delete ({selectedUsers.length})
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted">
                                                    {selectedUsers.length} of {users.length} selected
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department/Details</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected-row' : ''}>
                                            <td onClick={() => toggleUserSelection(user.id)} style={{ cursor: 'pointer' }}>
                                                <div className={`question-checkbox ${selectedUsers.includes(user.id) ? 'selected' : ''}`} style={{ width: '20px', height: '20px' }}>
                                                    {selectedUsers.includes(user.id) && <Plus size={12} style={{ transform: 'rotate(45deg)' }} />}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="user-avatar-sm">{user.name.charAt(0).toUpperCase()}</div>
                                                    <strong>{user.name}</strong>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge badge-${user.role === 'admin' ? 'danger' :
                                                    user.role === 'faculty' ? 'primary' : 'success'
                                                    }`}>{user.role}</span>
                                            </td>
                                            <td>
                                                {user.role === 'student' ? (
                                                    <div className="text-sm">
                                                        <div>{user.department_name}</div>
                                                        <div className="text-secondary">{user.stream} • {user.level} {user.year ? `• ${user.year}` : ''}</div>
                                                    </div>
                                                ) : user.role === 'faculty' ? (
                                                    <div className="text-sm">
                                                        <div>{user.designation}</div>
                                                        <div className="text-secondary">{user.department_name}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(user)} title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon" onClick={() => handleResetPassword(user.id)} title="Reset Password">
                                                        <Key size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(user.id)} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No users found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                {!editingUser && (
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {formData.role === 'student' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Funding Type</label>
                                            <select
                                                className="form-select"
                                                value={formData.stream}
                                                onChange={(e) => setFormData({ ...formData, stream: e.target.value, level: '', department_name: '' })}
                                                required={formData.role === 'student'}
                                            >
                                                <option value="">Select Funding Type</option>
                                                <option value="Aided">Aided</option>
                                                <option value="Self Financing">Self Financing</option>
                                            </select>
                                        </div>

                                        {formData.stream && (
                                            <div className="form-group">
                                                <label className="form-label">Level</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.level}
                                                    onChange={(e) => setFormData({ ...formData, level: e.target.value, department_name: '' })}
                                                    required={formData.role === 'student'}
                                                >
                                                    <option value="">Select Level</option>
                                                    <option value="UG">UG</option>
                                                    <option value="PG">PG</option>
                                                </select>
                                            </div>
                                        )}

                                        {formData.stream && formData.level && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label">Department</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.department_name}
                                                        onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                                        required={formData.role === 'student'}
                                                    >
                                                        <option value="">Select Department</option>
                                                        {DEPARTMENT_DATA[formData.stream]?.[formData.level]?.map((dept) => (
                                                            <option key={dept} value={dept}>{dept}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Year of Studying</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.year}
                                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                        required={formData.role === 'student'}
                                                    >
                                                        <option value="">Select Year</option>
                                                        <option value="I Year">I Year</option>
                                                        <option value="II Year">II Year</option>
                                                        {formData.level === 'UG' && <option value="III Year">III Year</option>}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {formData.role === 'faculty' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Designation</label>
                                            <select
                                                className="form-select"
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                required={formData.role === 'faculty'}
                                            >
                                                <option value="">Select Designation</option>
                                                {DESIGNATIONS.map(desig => (
                                                    <option key={desig} value={desig}>{desig}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Department</label>
                                            <select
                                                className="form-select"
                                                value={formData.department_name}
                                                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                                required={formData.role === 'faculty'}
                                            >
                                                <option value="">Select Department</option>
                                                {FACULTY_DEPARTMENTS.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? 'Update' : 'Create'} User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default UserManagement;
