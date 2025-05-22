import React, { useState, useEffect } from 'react';
import { getBackendImageUrl } from '../services/api';

interface DoctorImageProps {
  name: string;
  imageUrl?: string;
  index: number;
  className?: string;
}

export const DoctorImage: React.FC<DoctorImageProps> = ({
  name,
  imageUrl,
  index,
  className = 'w-full h-full object-cover'
}) => {
  const [imageError, setImageError] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');

  useEffect(() => {
    if (imageUrl) {
      console.log(`Processing doctor image for ${name}:`, imageUrl);
      // Use the centralized backend image URL function instead of local processing
      const processed = getBackendImageUrl(imageUrl);
      console.log(`Final image URL for ${name}:`, processed);
      setProcessedImageUrl(processed);
      setImageError(false);
    } else {
      setImageError(true);
    }
  }, [imageUrl, name]);

  // Get fallback doctor image that exists in the public folder
  const getFallbackImage = (): string => {
    // Use a simple rotation of 5 doctor images based on index
    const imageIndex = (Math.abs(index) % 5) + 1;
    return `/doctor-${imageIndex}.jpg`;
  };

  // Handle image loading error
  const handleImageError = () => {
    console.log(`Image error for ${name}, using fallback`);
    setImageError(true);
  };

  // Use the processed URL if we have one and no error, otherwise use fallback
  const imageSrc = !imageError && processedImageUrl ? processedImageUrl : getFallbackImage();

  return (
    <img
      src={imageSrc}
      alt={`Dr. ${name}`}
      className={className}
      onError={handleImageError}
    />
  );
};

export default DoctorImage; 