import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import Header from '../components/Header';

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!data.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Header />
            <section className='register-wrapper'>
                <div className='register-page'>
                    <h2>Register</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <form className='register-form' onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor='username'>Username</label><br />
                            <input 
                                type='text' 
                                name='username'
                                id='username' 
                                placeholder='Enter your username' 
                                required
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete='off'
                            />
                            <br />
                            <br />
                            <label htmlFor='email'>UCLA Email</label><br />
                            <input 
                                type='text' 
                                name='email'
                                id='email' 
                                placeholder='Enter your email' 
                                required
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete='off'
                            />
                            <br />
                            <br />
                            <label htmlFor='password'>Password</label><br />
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
                        <button type='submit'>Register</button>
                        <p>Already have an account? <a href='/login'>Login</a></p>
                    </form>
                </div>
            </section>    
        </>
    );
};
export default Register;