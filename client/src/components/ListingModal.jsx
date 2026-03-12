import React, { useEffect } from "react";
import "./ListingModal.css";
import { useState } from "react";
import Carousel from './Carousel.jsx';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Profile from "./Profile.jsx";
import { API_URL } from "../config";

const CONDITION_OPTIONS = ['Brand new', 'Like new', 'Used - excellent', 'Used - good', 'Used - fair'];

function ListingModal({ listing, onClose, onDeleted, onUpdated }) {

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
      title: "",
      description: "",
      condition: "",
      price: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [isMarkingSold, setIsMarkingSold] = useState(false);
    const [soldError, setSoldError] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    const listingId = listing?._id || listing?.id;
    const currentUserId = localStorage.getItem("userId");
    const sellerId =
      typeof listing?.seller === "object" && listing?.seller !== null
        ? listing.seller?._id
        : listing?.seller;
    const profileLink = sellerId === currentUserId ? "/myaccount" : `/profile/${sellerId}`;

    const isOwner = Boolean(listingId && currentUserId && sellerId && sellerId === currentUserId);
    const sellerDisplay =
      listing?.sellerName ||
      (typeof listing?.seller === "object" && listing?.seller !== null
        ? listing.seller?.username || listing.seller?.email
        : listing?.seller);

    useEffect(() => {
      if (listing) {
        setEditForm({
          title: listing.title || "",
          description: listing.description || "",
          condition: listing.condition || "",
          price:
            listing.price !== undefined && listing.price !== null
              ? listing.price.toString()
              : "",
        });
        setEditError("");
        setIsEditing(false);
        setIsSaving(false);
      }
    }, [listing]);

    if (!listing) return null;

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

    const handleMarkSold = async () => {
      if (!listingId || !token) return;
      try {
        setIsMarkingSold(true);
        setSoldError(null);
        const res = await fetch(`${API_URL}/listings/${listingId}/listing_sold`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to mark as sold");
        }
        const updatedListing = { ...listing, sold: true };
        onUpdated?.(updatedListing);
      } catch (err) {
        setSoldError(err?.message || "Failed to mark as sold");
      } finally {
        setIsMarkingSold(false);
      }
    };

    const handleSaveEdit = async () => {
      if (!listingId) return;
      if (!token) {
        setEditError("You must be logged in to edit a listing.");
        return;
      }

      setEditError("");
      const parsedPrice = parseFloat(editForm.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setEditError("Please enter a valid price.");
        return;
      }

      try {
        setIsSaving(true);

        const res = await fetch(`${API_URL}/listings/${listingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            description: editForm.description.trim(),
            condition: editForm.condition,
            price: parsedPrice,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to update listing");
        }

        const updatedListing = {
          ...listing,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          condition: editForm.condition,
          price: parsedPrice,
        };

        onUpdated?.(updatedListing);
        setIsEditing(false);
      } catch (err) {
        setEditError(err?.message || "Failed to update listing");
      } finally {
        setIsSaving(false);
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
                    {!isOwner && (
                      <button
                        className="message"
                        onClick={() => {
                          if (!sellerId) return;
                          navigate(`/messages?toUser=${encodeURIComponent(sellerId)}`);
                          onClose?.();
                        }}
                      >
                        Message
                      </button>
                    )}
                    {isOwner && (
                      <>
                        {!listing.sold && (
                          <button
                            className="mark-sold"
                            onClick={handleMarkSold}
                            disabled={isMarkingSold}
                          >
                            {isMarkingSold ? "Marking..." : "Mark as Sold"}
                          </button>
                        )}
                        <button
                          className="edit"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </button>
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
                      </>
                    )}
                </div>
                {soldError && <p className="delete-error">{soldError}</p>}
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
                {isEditing ? (
                  <div className="edit-form">
                    <h1 className="title">Edit Listing</h1>

                    <label className="edit-label">
                      Item Name
                      <input
                        className="edit-input"
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="edit-label">
                      Condition
                      <select
                        className="edit-input"
                        value={editForm.condition}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            condition: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select condition</option>
                        {CONDITION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="edit-label">
                      Description
                      <textarea
                        className="edit-input edit-textarea"
                        rows={4}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="edit-label">
                      Price ($)
                      <input
                        className="edit-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </label>

                    {editError && <p className="edit-error">{editError}</p>}

                    <div className="edit-actions">
                      <button
                        type="button"
                        className="edit-cancel"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="edit-save"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="title">{listing.title}</h1>
                    {listing.sold && <span className="sold-badge">SOLD</span>}
                    <h2 className="price">${listing.price}</h2>
                    {listing.condition && (
                      <p className="condition">Condition: {listing.condition}</p>
                    )}
                    <p className="seller">
                      Listed by <Link to={profileLink} className="sell-profile">{sellerDisplay}</Link>
                    </p>
                    <h2 className="sell-title">Seller's description</h2>
                    <p className="description">{listing.description}</p>
                  </>
                )}
            </div>
    
        </div>
        
      </div>
    </div>
  );
}
export default ListingModal;