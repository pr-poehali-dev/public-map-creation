import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
}

const locations: Location[] = [
  { id: 1, name: 'Центральная площадь', lat: 55.755826, lng: 37.617300, category: 'landmark', description: 'Главная площадь города' },
  { id: 2, name: 'Городской парк', lat: 55.750000, lng: 37.630000, category: 'park', description: 'Зелёная зона для отдыха' },
  { id: 3, name: 'Музей истории', lat: 55.760000, lng: 37.615000, category: 'museum', description: 'Исторический музей' },
  { id: 4, name: 'Торговый центр', lat: 55.745000, lng: 37.625000, category: 'shopping', description: 'Крупный ТЦ' },
  { id: 5, name: 'Набережная', lat: 55.748000, lng: 37.605000, category: 'landmark', description: 'Прогулочная зона у воды' },
  { id: 6, name: 'Спортивный комплекс', lat: 55.765000, lng: 37.620000, category: 'sport', description: 'Современный спорткомплекс' },
  { id: 7, name: 'Кафе "Уют"', lat: 55.752000, lng: 37.622000, category: 'food', description: 'Уютное кафе в центре' },
  { id: 8, name: 'Библиотека', lat: 55.758000, lng: 37.610000, category: 'education', description: 'Городская библиотека' },
];

const categoryIcons: Record<string, string> = {
  landmark: 'Landmark',
  park: 'Trees',
  museum: 'Building2',
  shopping: 'ShoppingBag',
  sport: 'Dumbbell',
  food: 'Coffee',
  education: 'BookOpen',
};

const categoryColors: Record<string, string> = {
  landmark: 'from-blue-500 to-cyan-500',
  park: 'from-green-500 to-emerald-500',
  museum: 'from-purple-500 to-violet-500',
  shopping: 'from-pink-500 to-rose-500',
  sport: 'from-orange-500 to-amber-500',
  food: 'from-red-500 to-orange-500',
  education: 'from-indigo-500 to-blue-500',
};

export default function MapView() {
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: 55.755826, lng: 37.617300 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 3));

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setCenter({ lat: location.lat, lng: location.lng });
  };

  const latLngToPixels = (lat: number, lng: number) => {
    const scale = Math.pow(2, zoom);
    const x = ((lng + 180) / 360) * 256 * scale;
    const y = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 256 * scale;
    return { x, y };
  };

  const centerPixels = latLngToPixels(center.lat, center.lng);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6">
        <Card className="backdrop-blur-md bg-white/90 shadow-2xl border-0">
          <div className="flex items-center gap-3 p-4">
            <Icon name="Search" className="text-primary" size={24} />
            <Input
              type="text"
              placeholder="Поиск мест, достопримечательностей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {searchQuery && filteredLocations.length > 0 && (
            <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    handleLocationClick(loc);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${categoryColors[loc.category]} flex items-center justify-center text-white`}>
                    <Icon name={categoryIcons[loc.category]} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{loc.name}</div>
                    <div className="text-sm text-gray-500">{loc.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
        <Button
          onClick={handleZoomIn}
          size="icon"
          className="w-12 h-12 rounded-full shadow-2xl bg-white hover:bg-gray-50 text-primary border-0"
        >
          <Icon name="Plus" size={24} />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="icon"
          className="w-12 h-12 rounded-full shadow-2xl bg-white hover:bg-gray-50 text-primary border-0"
        >
          <Icon name="Minus" size={24} />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full shadow-2xl bg-gradient-to-br from-primary to-secondary text-white border-0"
        >
          <Icon name="Navigation" size={24} />
        </Button>
      </div>

      <div
        ref={mapRef}
        className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
          }}
        >
          {locations.map((location) => {
            const locationPixels = latLngToPixels(location.lat, location.lng);
            const x = locationPixels.x - centerPixels.x + (mapRef.current?.clientWidth || 0) / 2;
            const y = locationPixels.y - centerPixels.y + (mapRef.current?.clientHeight || 0) / 2;

            return (
              <button
                key={location.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation(location);
                }}
                className="absolute -translate-x-1/2 -translate-y-full group animate-fade-in"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryColors[location.category]} shadow-2xl flex items-center justify-center text-white transform transition-all duration-300 group-hover:scale-125 group-hover:shadow-3xl`}>
                  <Icon name={categoryIcons[location.category]} size={24} />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white px-3 py-1 rounded-lg shadow-xl text-sm font-semibold whitespace-nowrap">
                    {location.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedLocation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-6 animate-fade-in">
          <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-0 p-6">
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <Icon name="X" size={20} />
            </button>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryColors[selectedLocation.category]} flex items-center justify-center text-white flex-shrink-0`}>
                <Icon name={categoryIcons[selectedLocation.category]} size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h3>
                <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-primary to-secondary text-white border-0">
                    <Icon name="Navigation" size={18} className="mr-2" />
                    Маршрут
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Icon name="Share2" size={18} className="mr-2" />
                    Поделиться
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
