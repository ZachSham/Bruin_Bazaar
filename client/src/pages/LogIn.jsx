import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogIn.css';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function LogIn() {

    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();  // add this

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json()

            if (!data.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token);
            localStorage.setItem('userId', data.userId);
            navigate('/');

        } catch (err) {
            setError(err.message);
        }
    } 

    return (
            <section className='login-wrapper'>
                <Header />
                <div className='login-page'>
                    <div className='login-box'>
                        <h2>Login</h2>
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                    <form className='login-form' method='post' onSubmit={handleSubmit}>
                        <div>
                            <label for='identifier'>Username or email</label><br />
                            <input 
                                type='text' 
                                name='identifier'
                                id='identifier' 
                                placeholder='Enter your email or username' 
                                required
                                value={formData.identifier}
                                onChange={handleChange}
                                autoComplete='off'
                            />
                            <br />
                            <br />
                            <label for='password'>Password</label><br />
                            <input 
                                type='password' 
                                id='password' 
                                name='password'
                                placeholder='Enter your password' 
                                required
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete='off'
                                />
                        </div>
                        <button type='submit'>Login</button>
                        <p>Don't have an account? <Link to='/register'>Register</Link> </p>
                    </form>
                    </div>
                </div>
            </section>
    );
};
export default LogIn;