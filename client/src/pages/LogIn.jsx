import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Header from '../components/Header';

function LogIn() {

    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json()

            if (!data.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('userId', data.userId)
            navigate('/');

        } catch (err) {
            setError(data.error);
        }
    }

    return (
        <>
            <Header />
            <section className='login-wrapper'>
                <div className='login-page'>
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
                                type='text' 
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
                        <p>Don't have an account? <a href='/register'>Register</a></p>
                    </form>
                </div>
            </section>
        </>
    );
};
export default LogIn;