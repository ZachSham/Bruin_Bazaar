import React from "react";
import './ListingCard.css';

function ListingCard({title, price, description, seller, images, onClick}) {
    return (
        <div className="listing-item" onClick={onClick}>
            <img src={images[0]} alt={title} />
            <div className="listing-descrip">
                <h1>${price}</h1>
                <p className="listing-title">{title}</p>
            </div>
        </div>
    );
};
export default ListingCard;