import React from "react";
import "./ListingModal.css";
import { useState } from "react";
import Carousel from './Carousel.jsx';
import defaultLike from "../assets/thumb-up.png";
import activeLike from "../assets/thumb-up-clicked.png";

function ListingModal({ listing, onClose }) {

    const [isActive, setIsActive] = useState(false);
    if (!listing) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>✕</button>

        <div className="modal-content">

            <div className="left-side">
                <Carousel images={listing.images} />
                {/*<img src={listing.images[0]} alt={listing.title} />*/}
                <div className="buttons">
                    <button className="like" onClick={() => setIsActive(!isActive)}>
                        <img src={isActive ? activeLike : defaultLike} alt="like button" />
                        <p>Like</p>
                    </button>
                <button className="message">Message</button>
                </div>
            </div>

            <div className="right-side">
                <h1 className="title">{listing.title}</h1>
                <h2 className="price">${listing.price}</h2>
                <p className="seller">Listed by {listing.seller}</p>
                <h2 className="sell-title">Seller's description</h2>
                <p className="description">{listing.description}</p>
            </div>
    
        </div>
        
      </div>
    </div>
  );
}
export default ListingModal;