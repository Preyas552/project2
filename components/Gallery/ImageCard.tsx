import React from 'react';

interface ImageCardProps {
  imageUrl: string;
  title: string;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, title, onSelect, isSelected }) => {
  const handleSelect = () => {
    onSelect(!isSelected);
  };

  return (
    <div className={`image-card ${isSelected ? 'selected' : ''}`} onClick={handleSelect}>
      <img src={imageUrl} alt={title} className="image-card__img" />
      <div className="image-card__title">{title}</div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleSelect}
        className="image-card__checkbox"
        aria-label={`Select ${title}`}
      />
    </div>
  );
};

export default ImageCard;