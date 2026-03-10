import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shopping_cart_logo.png';

function Header() {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        logout();
        navigate('/');
        setShowLogoutConfirm(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <header className='header'>
                <nav className='nav'>
                    <div className='logo'>
                        <Link to='/'><img src={logo} alt='shopping cart'/></Link>
                        <Link to='/'><p>BruinBazaar</p></Link>
                    </div>
                    <ul>
                        { isLoggedIn ? (
                            <>
                                <li><Link to='/myaccount'>My Account</Link></li>
                                <li><button onClick={handleLogoutClick}>Log Out</button></li>
                            </>
                        ) : (
                            <li><Link to='/login'>Log In</Link></li>
                        )}
                    </ul>
                </nav>
            </header>

            {showLogoutConfirm && (
                <div
                    className="logout-confirm-backdrop"
                    onClick={handleCancelLogout}
                >
                    <div
                        className="logout-confirm-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="logout-confirm-text">Are you sure you want to log out?</p>
                        <div className="logout-confirm-actions">
                            <button
                                className="logout-cancel"
                                onClick={handleCancelLogout}
                            >
                                Cancel
                            </button>
                            <button
                                className="logout-confirm-btn"
                                onClick={handleConfirmLogout}
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;