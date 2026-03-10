import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertTriangle, AlertCircle, Bookmark } from 'lucide-react';
import api from '../services/api';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Polling for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const data = response.data.data.notifications;
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="notif-icon text-success" />;
            case 'warning': return <AlertTriangle size={16} className="notif-icon text-warning" />;
            case 'error': return <AlertCircle size={16} className="notif-icon text-danger" />;
            case 'quiz': return <Bookmark size={16} className="notif-icon text-primary" />;
            case 'grade': return <Check size={16} className="notif-icon text-success" />;
            default: return <Info size={16} className="notif-icon text-info" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const handleNotifClick = (notif) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button 
                className={`header-btn ${isOpen ? 'active' : ''}`} 
                title="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notif-list">
                        {loading ? (
                            <div className="notif-empty">Loading...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                                    onClick={() => handleNotifClick(notif)}
                                >
                                    <div className="notif-icon-wrapper">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                        <div className="notif-time">
                                            <Clock size={10} /> {formatTime(notif.created_at)}
                                        </div>
                                    </div>
                                    {!notif.is_read && <div className="unread-indicator"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="notif-empty">
                                <Bell size={32} opacity={0.3} />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="notif-footer">
                        <button className="view-all-btn">View All</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
