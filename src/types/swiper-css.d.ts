// src/swiper.d.ts
export {};
// Khai báo các module CSS của Swiper
declare module 'swiper/css';
declare module 'swiper/css/pagination';
declare module 'swiper/css/navigation';

// Khai báo Swiper tồn tại trong global window object
declare global {
  interface Window {
    Swiper: any;
  }
}
