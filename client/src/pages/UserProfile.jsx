import React from "react";
import Profile from "../components/Profile";
import './UserProfile.css';

function UserProfile() {
    return (
        <div className="profile-page">
            <Header />
            <div className="user-account">
                <Profile />
            </div>
        </div>
    );
};
export default UserProfile;