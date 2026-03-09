import React from "react";
import Header from "../components/Header";
import Profile from '../components/Profile';
import './MyAccount.css';

function MyAccount() {
    return (
        <div className="account-page">
            <Header />
            <div className="my-account">
                <Profile
                    username="joebrewin"
                    email="joebruin@ucla.edu"
                    rating={4.5}
                />
            </div>
        </div>
    );
};
export default MyAccount;