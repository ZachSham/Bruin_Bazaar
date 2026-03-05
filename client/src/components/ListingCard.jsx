import React from "react";
import './ListingCard.css';

function ListingCard({title, price, description, seller, image, onClick}) {
    return (
        <div className="listing-item" onClick={onClick}>
            <img src={image} alt='placeholder' />
            <div className="listing-descrip">
                <h1>${price}</h1>
                <p className="listing-title">{title}</p>
            </div>
        </div>
    );
};
export default ListingCard;