import React, { useEffect, useState } from "react";
import "./Profile.css";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Profile({ children, userId }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // { username, email }
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId;


  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        let profileRes;

        if (isOwnProfile) {
          // Fetch logged-in user's profile (requires token)
          const storedUserId = localStorage.getItem("userId");
          profileRes = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          var targetUserId = storedUserId;
        } else {
          // Fetch public profile by userId
          profileRes = await fetch(`${API_URL}/auth/profile/${userId}`);
          var targetUserId = userId;
        }

         if (!profileRes.ok) {
          const body = await profileRes.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load profile");
        }

        const profileData = await profileRes.json();

        let listingData = [];
        if (targetUserId) {
          const listingsRes = await fetch(`${API_URL}/listings/seller/${targetUserId}`);
          if (listingsRes.ok) {
            listingData = await listingsRes.json();
          }
        }

        setUser(profileData);
        setListings(Array.isArray(listingData) ? listingData : []);
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="profile-wrapper">Loading...</div>;
  }

  if (error) {
    return <div className="profile-wrapper">Error: {error}</div>;
  }

  if (!user) return null;

  return (
    <div className="profile-wrapper">
      <div className="profile-content">
        <div>
          <h2>@{user.username}</h2>
          <h3>{user.email}</h3>
          {children}
        </div>
        <div className="profile-buttons">
          {!isOwnProfile && (
            <button
              className="message"
              onClick={() => {
                if (!userId) return;
                navigate(`/messages?toUser=${encodeURIComponent(userId)}`);
              }}
            >
              Message
            </button>
          )}
          {isOwnProfile && (
            <Link to="/create">
                <button className="create-listing">Create Listing</button>
            </Link>
            )}
        </div>
      </div>

      <div className="profile-listings">
        <h3>{user.username}'s Listings</h3>
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id || listing.id}
              title={listing.title}
              price={listing.price}
              images={listing.images}
              onClick={() =>
                setSelected({
                  ...listing,
                  // Keep `seller` as the seller id for ownership checks.
                  // Provide a separate readable name for display.
                  sellerName: user.username,
                })
              }
            />
          ))}

          {listings.length === 0 && <p>No listings yet.{isOwnProfile && " Create one!"}</p>}
        </div>
      </div>

      <ListingModal
        listing={selected}
        onClose={() => setSelected(null)}
        onUpdated={(updated) => {
          setListings((prev) =>
            prev.map((l) =>
              (l._id || l.id) === (updated._id || updated.id) ? updated : l
            )
          );
          setSelected(updated);
        }}
        onDeleted={(deletedId) => {
          setListings((prev) =>
            prev.filter((l) => (l._id || l.id) !== deletedId)
          );
          setSelected(null);
        }}
      />
    </div>
  );
}

export default Profile;