import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, X, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState({ role: '', search: '' });
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student'
    });

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.role) params.append('role', filter.role);
            if (filter.search) params.append('search', filter.search);

            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'student' });
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    isActive: true
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
            role: user.role
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted!');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete');
        }
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
        <div className="page-container">
            <Sidebar role="admin" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage all users in the system</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={20} /> Add User
                    </button>
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
                        onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                    >
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admins</option>
                    </select>
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
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
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
                                                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
            </main>
        </div>
    );
};

export default UserManagement;
