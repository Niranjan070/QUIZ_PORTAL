import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Admin.css';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '', code: '', description: '', facultyId: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses');
            setCourses(response.data.data.courses);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', description: '', facultyId: '' });
        setEditingCourse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await api.put(`/admin/courses/${editingCourse.id}`, formData);
                toast.success('Course updated!');
            } else {
                await api.post('/admin/courses', formData);
                toast.success('Course created!');
            }
            setShowModal(false);
            resetForm();
            fetchCourses();
        } catch (error) {
            toast.error('Failed to save course');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            code: course.code,
            description: course.description || '',
            facultyId: course.faculty_id || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course? This will also delete all related quizzes and enrollments.')) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            toast.success('Course deleted!');
            fetchCourses();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Course Management</h1>
                    <p className="page-subtitle">Manage courses and faculty assignments</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} /> Add Course
                </button>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="admin-courses-grid">
                    {courses.length > 0 ? courses.map((course) => (
                        <div key={course.id} className="card admin-course-card">
                            <div className="course-header">
                                <span className="course-code">{course.code}</span>
                                <div className="flex gap-1">
                                    <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(course)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(course.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3>{course.name}</h3>
                            <p className="course-desc">{course.description || 'No description'}</p>

                            <p className="course-faculty">
                                <BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {course.faculty_name || 'No faculty assigned'}
                            </p>

                            <div className="course-stats-row">
                                <span><Users size={14} /> {course.student_count || 0} students</span>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <BookOpen size={48} />
                            <p>No courses yet. Create your first course!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Database Management Systems"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Course Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g., DBMS101"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Course description..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Faculty ID (optional)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.facultyId}
                                        onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                        placeholder="Enter faculty user ID"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
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

export default CourseManagement;
