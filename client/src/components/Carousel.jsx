import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function Carousel({ images = [] }) {
  const displayImages = images?.length > 0 ? images : ['https://placehold.co/400x400?text=No+Image'];
  const shouldLoop = displayImages.length > 1;
  return (
    <Swiper
      modules={[Navigation]}
      navigation={true}
      loop={shouldLoop}
      style={{ width: '28rem', height: '28rem' }}
    >
      {displayImages.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            alt={`slide-${i}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Carousel;