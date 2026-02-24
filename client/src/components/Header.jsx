import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/shopping_cart_logo.png';

function Header() {
    return (
        <header className='header'>
            <nav className='nav'>
                <div className='logo'>
                    <Link to='/'><img src={logo} alt='shopping cart'/></Link>
                    <Link to='/'><p>BruinBazaar</p></Link>
                </div>
                <ul>
                    <li><Link to="/create">Create Listing</Link></li>
                    <li className='login'><Link to='/login'>Log In</Link></li>
                    <li className='Register'><Link to='/signup'>Register</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;