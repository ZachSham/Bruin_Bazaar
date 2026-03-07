import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function Carousel({ images }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation={true}
      loop={true}
      style={{ width: '28rem', height: '28rem' }}
    >
      {images.map((img, i) => (
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