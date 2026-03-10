import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Profile";
import './PublicProfile.css';

function PublicProfile() {
    const { userId } = useParams();
    return (
        <div className="user-page">
            <Header />
            <div className="user-account">
                <Profile userId={userId}
                />
            </div>
        </div>
    );
}
export default PublicProfile;