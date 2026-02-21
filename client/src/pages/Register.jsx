import React from 'react';
import './Register.css';
import Header from '../components/Header';

function Register() {
    return (
        <>
            <Header />
            <section className='register-wrapper'>
                <div className='register-page'>
                    <h2>Register</h2>

                    <form className='register-form' method='post'>
                        <div>
                            <label for='username'>Username</label><br />
                            <input 
                                type='text' 
                                name='username'
                                id='username' 
                                placeholder='Enter your username' 
                                required
                                autoComplete='off'
                            />
                            <br />
                            <br />
                            <label for='email'>UCLA Email</label><br />
                            <input 
                                type='text' 
                                name='email'
                                id='email' 
                                placeholder='Enter your email' 
                                required
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
                                autoComplete='off'
                                />
                        </div>
                        <button type='submit'>Register</button>
                    </form>
                </div>
            </section>    
        </>
    );
};
export default Register;