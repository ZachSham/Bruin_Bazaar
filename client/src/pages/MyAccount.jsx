import React from "react";
import Header from "../components/Header";
import Profile from '../components/Profile';
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import './MyAccount.css';

function MyAccount() {

    const { token } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:3000/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch profile");

                const data = await res.json();
                setUserData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
        else setLoading(false);
    }, [token]);

    if (loading) return <div className="account-page"><Header /><p>Loading...</p></div>;
    if (error)   return <div className="account-page"><Header /><p>Error: {error}</p></div>;
    if (!userData) return <div className="account-page"><Header /><p>Not logged in.</p></div>;
    return (
        <div className="account-page">
            <Header />
            <div className="my-account">
                <Profile
                    username={userData.username}
                    email={userData.email}
                    rating={4.5}
                />
            </div>
        </div>
    );
};
export default MyAccount;