 import React, { useState, useEffect } from "react";
 import ListingCard from './ListingCard';
 import ListingModal from './ListingModal';
 import './ListingGrid.css';
 import { Link } from "react-router-dom";
 import { useAuth } from "../context/AuthContext";

 function ListingGrid({sellerId, searchResults}) {
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

    const displayListings = searchResults ?? listings;

    if (loading && !searchResults) return <p className="status-msg">Loading listings...</p>;
    if (error) return <p className="status-msg">Error: {error}</p>;

    return (
        <div>
            {searchResults && (
                <p className="status-msg">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
            )}

            <div className={`listing-grid ${!isLoggedIn ? 'blurred' : ''}`}>
                {displayListings.map(listing => (
                    <ListingCard
                        key={listing._id}
                        title={listing.title}
                        price={listing.price}
                        images={listing.images}
                        sold={listing.sold}
                        onClick={() => setSelected(listing)}
                    />
                ))}
            </div>

            {!isLoggedIn && (
                <div className="login-prompt">
                    <p>Sign in to view listings</p>
                    <Link to='/login'><p className="login-btn">Login</p></Link>
                </div>
            )}

            <ListingModal
                listing={selected}
                onClose={() => setSelected(null)}
                onUpdated={(updated) => {
                    setListings((prev) =>
                        prev.map((l) =>
                            (l._id || l.id) === (updated._id || updated.id) ? updated : l
                        )
                    );
                    setSelected(updated);
                }}
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
 