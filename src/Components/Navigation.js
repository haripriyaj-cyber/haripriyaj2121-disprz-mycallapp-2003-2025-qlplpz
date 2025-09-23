import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faList, 
  faSignOutAlt, 
  faUserCircle,
  faMoon,
  faSun,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Navigation.css';

function Navigation() {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if the current route is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Check for form pages - now including the update-appointment path
  const isFormPage = location.pathname === '/create' || 
                     location.pathname.startsWith('/update-appointment/');

  // Don't show navigation on auth pages or form pages
  if (isAuthPage || isFormPage) {
    return null;
  }

  return (
    <nav className={`main-nav ${darkMode ? 'dark-mode' : ''}`}>
      <div className="nav-brand">
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>Appointment Scheduler</span>
      </div>
      
      {currentUser && (
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Calendar</span>
          </Link>
          <Link to="/list" className={location.pathname === '/list' ? 'nav-link active' : 'nav-link'}>
            <FontAwesomeIcon icon={faList} />
            <span>List View</span>
          </Link>
          <Link to="/create" className={location.pathname === '/create' ? 'nav-link active' : 'nav-link'}>
            <FontAwesomeIcon icon={faPlus} />
            <span>New Appointment</span>
          </Link>
        </div>
      )}
      
      <div className="nav-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode} 
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>
        
        {currentUser ? (
          <div className="user-menu">
            <div className="user-info">
              <FontAwesomeIcon icon={faUserCircle} />
              <span>{currentUser.username || 'User'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;