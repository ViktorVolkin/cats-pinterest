import React, { useEffect, useState, useCallback, useRef } from 'react';
import './allCatsPage.scss';
import heartBorder from '../../assets/favorite_border.png';
import heartHovered from '../../assets/favorite.png';
import userFavorite from '../../assets/favorite__picked.png';

interface CatImage {
  id: string;
  url: string;
  is_favorite: boolean;
  favourite_id?: number;
}

const PAGE_LIMIT = 20;

const AllCatsPage: React.FC = () => {
  const [cats, setCats] = useState<CatImage[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCatElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      try {
        console.log('__API_BASE_URL__:', __API_BASE_URL__);
        const response = await fetch(`${__API_BASE_URL__}/images?page=${page}&limit=${PAGE_LIMIT}`);
        console.log('Fetching cats from:', `${__API_BASE_URL__}/images?page=${page}&limit=${PAGE_LIMIT}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cat images');
        }
        const data: CatImage[] = await response.json();
        console.log('Received cat data:', data);

        const favResponse = await fetch(`${__API_BASE_URL__}/favourites`);
        console.log('Fetching favourites from:', `${__API_BASE_URL__}/favourites`);
        if (!favResponse.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const favData: Array<{ id: number; image_id: string }> = await favResponse.json();
        console.log('Received favourites data:', favData);
        const favMap = new Map<string, number>();
        favData.forEach(fav => {
          favMap.set(fav.image_id, fav.id);
        });

        const catsWithFavIds = data.map(cat => ({
          ...cat,
          favourite_id: favMap.get(cat.id),
        }));

        setCats(prevCats => {
          const existingIds = new Set(prevCats.map(cat => cat.id));
          const newCats = catsWithFavIds.filter(cat => !existingIds.has(cat.id));
          return [...prevCats, ...newCats];
        });

        if (data.length < PAGE_LIMIT) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching cats or favourites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, [page]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  const toggleFavorite = async (cat: CatImage) => {
    if (cat.is_favorite) {
      if (!cat.favourite_id) return;
      try {
        const response = await fetch(`${__API_BASE_URL__}/favourites/${cat.favourite_id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to remove favorite');
        }
        setCats(prevCats =>
          prevCats.map(c =>
            c.id === cat.id ? { ...c, is_favorite: false, favourite_id: undefined } : c
          )
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await fetch(`${__API_BASE_URL__}/favourites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_id: cat.id }),
        });
        if (!response.ok) {
          throw new Error('Failed to add favorite');
        }
        const data = await response.json();
        setCats(prevCats =>
          prevCats.map(c =>
            c.id === cat.id ? { ...c, is_favorite: true, favourite_id: data.id } : c
          )
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="all-cats-page">
      <div className="cats-grid">
        {cats.map((cat, index) => {
          const isLast = index === cats.length - 1;
          const heartImgSrc = cat.is_favorite
            ? userFavorite
            : hoveredCatId === cat.id
            ? heartHovered
            : heartBorder;

          const catCard = (
            <div
              className="cat-card"
              key={cat.id}
              ref={isLast ? lastCatElementRef : undefined}
              onMouseEnter={() => setHoveredCatId(cat.id)}
              onMouseLeave={() => setHoveredCatId(null)}
            >
              <img
                src={cat.url}
                alt="Cat"
                loading="lazy"
                onError={handleImageError}
                className='cat-image'
                onClick={() => toggleFavorite(cat)}
                style={{ cursor: 'pointer' }}
              />
              <img
                src={heartImgSrc}
                alt={cat.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                className="heart-icon"
                onClick={() => toggleFavorite(cat)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          );

          return catCard;
        })}
      </div>
      {loading && <div className="loading">... загружаем котиков ...</div>}
    </div>
  );
};

export default AllCatsPage;
