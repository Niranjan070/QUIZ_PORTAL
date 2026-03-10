import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Check, Users, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

const FacultyCourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/faculty/dashboard');
            setCourses(response.data.data.courses);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                name: course.name,
                code: course.code,
                description: course.description
            });
        } else {
            setEditingCourse(null);
            setFormData({ name: '', code: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCourse(null);
        setFormData({ name: '', code: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await api.put(`/faculty/courses/${editingCourse.id}`, formData);
                toast.success('Course updated successfully');
            } else {
                await api.post('/faculty/courses', formData);
                toast.success('Course created successfully');
            }
            fetchCourses();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course? All associated data will be removed.')) return;
        try {
            await api.delete(`/faculty/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch (error) {
            toast.error('Failed to delete course');
        }
    };

    if (loading) {
        return (
            <div className="loading-container"><div className="spinner"></div></div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Course Management</h1>
                    <p className="page-subtitle">Manage your courses and student enrollments</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} /> Add Course
                </button>
            </div>

            <div className="admin-courses-grid">
                {courses.length > 0 ? courses.map((course) => (
                    <div key={course.id} className="card admin-course-card">
                        <div className="course-header">
                            <span className="course-code">{course.code}</span>
                            <div className="flex gap-1">
                                <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(course)}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(course.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3>{course.name}</h3>
                        <p className="course-desc">{course.description || 'No description'}</p>

                        <div className="course-stats-row">
                            <Link to={`/faculty/courses/${course.id}/students`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <span><Users size={14} /> {course.student_count || 0} students</span>
                            </Link>
                            <span><ClipboardList size={14} /> {course.quiz_count || 0} quizzes</span>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                        <BookOpen size={48} />
                        <p>No courses yet. Create your first course!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Course Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Database Management Systems"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Course Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g., DBMS101"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Course description..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCourse ? 'Update' : 'Create'} Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyCourseManagement;
