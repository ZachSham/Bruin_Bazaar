import React from "react";
import './SearchBar.css';
import { useState } from "react";

function SearchBar({onResults, onClear}) {
    const [query, setQuery] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            const res = await fetch(`http://localhost:3000/listings/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            onResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClear = () => {
        setQuery("");
        onClear();
    };

    return (
        <div className="search">
            <form className="search-bar" onSubmit={handleSearch}>
                <input 
                    type="text"
                    className="search-input" 
                    placeholder="Search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value === "") onClear();
                    }}
                />
                <button className="clear" type="button" onClick={handleClear}>✕</button>
            </form>
        </div>
    );
};
export default SearchBar;