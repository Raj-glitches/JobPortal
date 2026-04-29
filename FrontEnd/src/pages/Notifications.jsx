import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiTrash2, FiClock, FiBriefcase } from 'react-icons/fi';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ page: 1, limit: 50 });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id 
          ? { ...n, read: true, readAt: new Date() }
          : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({
        ...n,
        read: true,
        readAt: n.readAt || new Date()
      })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      application: FiBriefcase,
      job: FiCheck,
      interview: FiClock,
      system: FiBell,
      alert: FiBell
    };
    const Icon = icons[type] || FiBell;
    return <Icon className="w-5 h-5" />;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
        <div className="container-app">
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="container-app">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBell className="w-8 h-8" />
            Notifications
          </h1>
          <div className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full">
            {unreadCount} unread
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn btn-outline text-sm"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card text-center py-20">
            <FiBell className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400">You'll see notifications here for new applications, job approvals, and more.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`card p-4 flex items-start gap-4 cursor-pointer group hover:shadow-lg transition-all ${
                  !notification.read ? 'ring-2 ring-primary-200 dark:ring-primary-900 bg-primary-50 dark:bg-primary-950/50' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-900'}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-8">
                      {notification.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTime(notification.createdAt)}</span>
                    {notification.link && (
                      <a href={notification.link} className="text-primary-600 hover:underline font-medium">
                        View
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4 text-primary-600" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
