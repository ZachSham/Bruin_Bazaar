 import React, { useState } from "react";
 import ListingCard from './ListingCard';
 import ListingModal from './ListingModal';
 import './ListingGrid.css';
 import { useAuth } from "../context/AuthContext";

 function ListingGrid() {
    const {isLoggedIn} = useAuth();
    const [selected, setSelected] = useState(null);

    const listings = [
        { id: 1, title: 'Ferrari 250 Testa Rossa', seller: "Ashley Tran", description: "This is a test description for the listing.", price: '10,000,000', images: ['https://placehold.co/300x200', 'https://placehold.co/300x300'] },
        { id: 2, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 3, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 4, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 5, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 6, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 7, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] },
        { id: 8, title: 'Custom colleges, DM for more info', price: 10.50, images: ['https://placehold.co/300x200'] }
    ]
    // For backend implementaiton
    //const [listings, setListings] = useState([]);
    //const [loading, setLoading] = useState(true);
    return (
        <div>
            <div className={`listing-grid ${!isLoggedIn ? 'blurred' : ''}`}>
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
            {!isLoggedIn && (
                <div className="login-prompt">
                    <p>Sign in to view listings</p>
                    <a href='/login'>Login</a>
                </div>
            )}

            <ListingModal listing={selected} onClose={() => setSelected(null)} />
        </div>
    );
 }
 export default ListingGrid;
 