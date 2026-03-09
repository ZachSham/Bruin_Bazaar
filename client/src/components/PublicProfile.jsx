import React from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Profile from "./Profile";

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