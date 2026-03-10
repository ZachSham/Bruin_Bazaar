 import React, { useState, useEffect } from "react";
 import ListingCard from './ListingCard';
 import ListingModal from './ListingModal';
 import './ListingGrid.css';
 import { useAuth } from "../context/AuthContext";

 function ListingGrid({sellerId}) {
     const { isLoggedIn } = useAuth();
    const [selected, setSelected] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const url = sellerId
                    ? `http://localhost:3000/listings/seller/${sellerId}`
                    : `http://localhost:3000/listings`;

                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch listings");
                const data = await res.json();
                setListings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [sellerId]);

    if (loading) return <p className="status-msg">Loading listings...</p>;
    if (error)   return <p className="status-msg">Error: {error}</p>;
    return (
        <div>
            <div className={`listing-grid ${!isLoggedIn ? 'blurred' : ''}`}>
                {listings.map(listing => (
                    <ListingCard 
                        key={listing._id}
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

            <ListingModal
                listing={selected}
                onClose={() => setSelected(null)}
                onDeleted={(deletedId) => {
                    setListings((prev) =>
                        prev.filter((l) => (l._id || l.id) !== deletedId)
                    );
                    setSelected(null);
                }}
            />
        </div>
    );
 }
 export default ListingGrid;
 