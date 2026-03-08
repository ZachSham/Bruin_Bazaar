import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shopping_cart_logo.png';
import { useNavigate

 } from 'react-router-dom';
function Header() {

    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
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
                            <li><button onClick={handleLogout}>Log Out</button></li>
                        </>
                    ) : (
                        <li><Link to='/login'>Log In</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;