import React from "react";
import './Profile.css';
import { useState } from "react";
import ListingCard from "./ListingCard";
import ListingModal from "./ListingModal";
import { Link } from "react-router-dom";

function Profile({username, email, rating})
{

    const listings = [
        { id: 1, title: 'Ferrari 250 Testa Rossa', seller: "Ashley Tran", description: "This is a test description for the listing.", price: '10,000,000', images: ['https://placehold.co/300x200', 'https://placehold.co/300x300'] },
        { id: 2, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 3, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 4, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
    ]

    const [selected, setSelected] = useState(null);
    
    return (
        <div className="profile-wrapper">
            <div className="profile-content">
                <div>
                    <h2>@{username}</h2>
                    <h3>{email}</h3>
                    <h3>Rating: {rating}/5</h3>
                </div>
                <div className="profile-buttons">
                    <button className="message">Message</button>
                    <Link to='/create'><button className="create-listing">Create Listing</button></Link>
                </div>
                
            </div>

            <div className="profile-listings">
                <h3>{username}'s Listings</h3>
                <div className="listing-grid">
                    {listings.map(listing => (
                    <ListingCard 
                        key={listing.id}
                        title={listing.title}
                        price={listing.price}
                        images={listing.images}
                        onClick={() => setSelected(listing)}
                    />
                ))}

                <ListingModal listing={selected} onClose={() => setSelected(null)} />
                </div>
            </div>
        </div>
    );
}
export default Profile;