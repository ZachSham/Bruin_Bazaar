import React, { useState } from 'react';
import Header from '../components/Header';
import ListingGrid from '../components/ListingGrid';
import SearchBar from '../components/SearchBar';

function Home () {

    const [searchResults, setSearchResults] = useState(null);
    
    return (
        <div className='home-page'>
            <Header />
            <SearchBar onResults={setSearchResults} onClear={() => setSearchResults(null)}/>
            <ListingGrid searchResults={searchResults}/>
        </div>
    );
};

export default Home;