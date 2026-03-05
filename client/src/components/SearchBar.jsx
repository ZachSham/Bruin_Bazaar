import React from "react";
import './SearchBar.css';

function SearchBar() {
    return (
        <div className="search">
            <form className="search-bar">
                <input type="text" className="search-input" placeholder="Search"/>
            </form>
        </div>
    );
};
export default SearchBar;