import React from "react";
import "./ListingModal.css";

function ListingModal({ listing, onClose }) {
  if (!listing) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>✕</button>
        <img src={listing.image} alt={listing.title} />
        <h2>{listing.title}</h2>
        <p>${listing.price}</p>
      </div>
    </div>
  );
}
export default ListingModal;