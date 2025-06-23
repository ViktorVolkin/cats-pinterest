import React, { useEffect, useState } from 'react';
import { useTabs } from '../../components/tabContext';
import './favouriteCatsPage.scss';
import heartHovered from '../../assets/favorite.png';
import userFavorite from '../../assets/favorite__picked.png';

interface FavoriteCat {
  id: number;
  image_id: string;
  url: string;
}

const FavouriteCatsPage: React.FC = () => {
  const { activeTab } = useTabs();
  const [favorites, setFavorites] = useState<FavoriteCat[]>([]);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      console.log('__API_BASE_URL__:', __API_BASE_URL__);
      const response = await fetch(`${__API_BASE_URL__}/favourites`);
      console.log('Fetching favourites from:', `${__API_BASE_URL__}/favourites`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data: FavoriteCat[] = await response.json();
      console.log('Received favourites data:', data);
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'favourite-cats') {
      fetchFavorites();
    }
  }, [activeTab]);

  const handleRemoveFavorite = async (fav: FavoriteCat) => {
    try {
      const response = await fetch(`${__API_BASE_URL__}/favourites/${fav.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }
      setFavorites(prev => prev.filter(f => f.id !== fav.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="favourite-cats-page">
      <div className="cats-grid">
        {favorites.map(fav => {
          const heartImgSrc =
            hoveredCatId === fav.image_id ? heartHovered : userFavorite;

          return (
            <div
              className="cat-card"
              key={fav.id}
              onMouseEnter={() => setHoveredCatId(fav.image_id)}
              onMouseLeave={() => setHoveredCatId(null)}
            >
              <img
                src={fav.url}
                alt="Favorite Cat"
                loading="lazy"
                onClick={() => handleRemoveFavorite(fav)}
                style={{ cursor: 'pointer' }}
              />
              <img
                src={heartImgSrc}
                alt="Remove from favorites"
                className="heart-icon"
                onClick={() => handleRemoveFavorite(fav)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          );
        })}
      </div>
      {loading && <div className="loading">... загружаем любимых котиков ...</div>}
      {!loading && favorites.length === 0 && (
        <div className="no-favorites">У вас пока нет любимых котиков.</div>
      )}
    </div>
  );
};

export default FavouriteCatsPage;
