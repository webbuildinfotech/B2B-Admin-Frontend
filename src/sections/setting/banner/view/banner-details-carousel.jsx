import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { Image } from 'src/components/image';
import { Lightbox, useLightBox } from 'src/components/lightbox';
import {
  Carousel,
  useCarousel,
  CarouselArrowNumberButtons,
} from 'src/components/carousel';

// Dummy image URL for fallback
const DUMMY_IMAGE = 'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=';

// ----------------------------------------------------------------------

export function BannerDetailsCarousel({ images }) {
  // Handle both single image string and multiple images array
  const imageArray = Array.isArray(images) ? images : [images];
  const validImages = imageArray.filter(img => img && typeof img === 'string');
  
  // If no valid images, use dummy image
  const slides = validImages.length > 0 
    ? validImages.map(img => ({ src: img }))
    : [{ src: DUMMY_IMAGE }];

  const carousel = useCarousel({
    loop: slides.length > 1,
    align: 'start',
  });

  const lightbox = useLightBox(slides);

  useEffect(() => {
    if (lightbox.open) {
      carousel.mainApi?.scrollTo(lightbox.selected, true);
    }
  }, [carousel.mainApi, lightbox.open, lightbox.selected]);

  return (
    <>
      <Box sx={{ mb: 2.5, position: 'relative' }}>
        <Carousel 
          carousel={carousel} 
          sx={{ borderRadius: 2, maxWidth: '100%', mx: 'auto' }}
        >
          {slides.map((slide, index) => (
            <Box key={index} sx={{ flex: '0 0 100%' }}>
              <Image
                alt={`Banner Image ${index + 1}`}
                src={slide.src}
                ratio="3/1"
                onClick={() => lightbox.onOpen(slide.src)}
                sx={{ 
                  cursor: 'zoom-in', 
                  width: '100%', 
                  height: '100%',
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
              />
            </Box>
          ))}
        </Carousel>

        {/* Show arrow buttons if multiple images */}
        {slides.length > 1 && (
          <CarouselArrowNumberButtons
            {...carousel.arrows}
            options={carousel.options}
            totalSlides={carousel.dots.dotCount}
            selectedIndex={carousel.dots.selectedIndex + 1}
            sx={{ 
              right: 16, 
              bottom: 16, 
              position: 'absolute',
              zIndex: 10
            }}
          />
        )}
      </Box>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={lightbox.setSelected}
      />
    </>
  );
}
