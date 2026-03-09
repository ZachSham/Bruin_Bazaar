import React from "react";
import "./ListingModal.css";
import { useState } from "react";
import Carousel from './Carousel.jsx';
import defaultLike from "../assets/thumb-up.png";
import activeLike from "../assets/thumb-up-clicked.png";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Profile from "./Profile.jsx";

const API_URL = "http://localhost:3000";

function ListingModal({ listing, onClose, onDeleted }) {

    const [isActive, setIsActive] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { token } = useAuth();
    if (!listing) return null;
    console.log(listing);

    const listingId = listing?._id || listing?.id;
    const currentUserId = localStorage.getItem("userId");
    const sellerId =
      typeof listing?.seller === "object" && listing?.seller !== null
        ? listing.seller?._id
        : listing?.seller;

    const isOwner = Boolean(listingId && currentUserId && sellerId && sellerId === currentUserId);
    const sellerDisplay =
      listing?.sellerName ||
      (typeof listing?.seller === "object" && listing?.seller !== null
        ? listing.seller?.username || listing.seller?.email
        : listing?.seller);

    const handleDelete = async () => {
      if (!listingId) return;
      if (!token) {
        setDeleteError("You must be logged in to delete a listing.");
        return;
      }

      try {
        setDeleteError(null);
        setIsDeleting(true);

        const res = await fetch(`${API_URL}/listings/${listingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to delete listing");
        }

        onDeleted?.(listingId);
        onClose?.();
      } catch (err) {
        setDeleteError(err?.message || "Failed to delete listing");
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>✕</button>

        <div className="modal-content">

            <div className="left-side">
                <Carousel images={listing.images || []} />
                {/*<img src={listing.images[0]} alt={listing.title} />*/}
                <div className="buttons">
                    <button className="like" onClick={() => setIsActive(!isActive)}>
                        <img src={isActive ? activeLike : defaultLike} alt="like button" />
                        <p>Like</p>
                    </button>
                <button className="message">Message</button>
                {isOwner && (
                  <button
                    className="delete"
                    onClick={() => {
                      setDeleteError(null);
                      setShowDeleteConfirm(true);
                    }}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                )}
                </div>
                {showDeleteConfirm && (
                  <div className="delete-confirm" role="dialog" aria-modal="true">
                    <p className="delete-confirm-text">
                      Delete this listing? This cannot be undone.
                    </p>
                    <div className="delete-confirm-actions">
                      <button
                        className="delete-cancel"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button
                        className="delete-confirm-btn"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Confirm delete"}
                      </button>
                    </div>
                  </div>
                )}
                {deleteError && <p className="delete-error">{deleteError}</p>}
            </div>

            <div className="right-side">
                <h1 className="title">{listing.title}</h1>
                <h2 className="price">${listing.price}</h2>
               <p className="seller">
                  Listed by <Link to={`/profile/${sellerId}`} className="sell-profile">{sellerDisplay}</Link>
                </p>
                <h2 className="sell-title">Seller's description</h2>
                <p className="description">{listing.description}</p>
            </div>
    
        </div>
        
      </div>
    </div>
  );
}
export default ListingModal;