import React from "react";
import './ListingCard.css';

function ListingCard({title, price, description, seller, images = [], onClick}) {
    const imageUrl = images?.length > 0 ? images[0] : 'https://placehold.co/300x200?text=No+Image';
    return (
        <div className="listing-item" onClick={onClick}>
            <img src={imageUrl} alt={title} />
            <div className="listing-descrip">
                <h1>${price}</h1>
                <p className="listing-title">{title}</p>
            </div>
        </div>
    );
};
export default ListingCard;