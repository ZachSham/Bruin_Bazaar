import React from "react";
import './Profile.css';
import ListingCard from "./ListingCard";
import { Link } from "react-router-dom";

function Profile({children})
{
    const user = {
        username: 'joebrewin',
        name: 'Joe Bruin',
        rating: 4.5
    }

    const listings = [
        { id: 1, title: 'Ferrari 250 Testa Rossa', seller: "Ashley Tran", description: "This is a test description for the listing.", price: '10,000,000', images: ['https://placehold.co/300x200', 'https://placehold.co/300x300'] },
        { id: 2, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 3, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 4, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
    ]

    return (
        <div className="profile-wrapper">
            <div className="profile-content">
                <div>
                    <h2>{user.name}</h2>
                    <h3>@{user.username}</h3>
                    <h3>Rating: {user.rating}/5</h3>
                    {children}
                </div>
                <div className="profile-buttons">
                    <button className="message">Message</button>
                    <Link to='/create'><button className="create-listing">Create Listing</button></Link>
                </div>
                
            </div>

            <div className="profile-listings">
                <h3>{user.name}'s Listings</h3>
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
                </div>
            </div>
        </div>
    );
}
export default Profile;