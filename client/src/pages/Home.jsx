import React, { useState } from 'react';
import Header from '../components/Header';
import ListingGrid from '../components/ListingGrid';
import SearchBar from '../components/SearchBar';

function Home () {
    return (
        <div className='home-page'>
            <Header />
            <SearchBar />
            <ListingGrid />
        </div>
    );
};

export default Home;