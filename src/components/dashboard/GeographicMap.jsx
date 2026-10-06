import React, { useState, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { geoBounds } from 'd3-geo';

import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'react-tooltip/dist/react-tooltip.css';
import 'leaflet/dist/leaflet.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const geocodeCache = {};

// Helper to auto-zoom leaflet map when bounds change
const MapController = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  return null;
};

const GeographicMap = ({ data = [] }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [cityMarkers, setCityMarkers] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const totalGlobalViews = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.total, 0);
  }, [data]);

  const maxViews = useMemo(() => {
    return Math.max(...data.map(d => d.total), 1);
  }, [data]);

  const colorScale = scaleLinear()
    .domain([0, maxViews])
    .range(["#dbeafe", "#1e3a8a"]); 

  const getCountryData = (geoName) => {
    const nameMap = {
      "United States of America": "United States",
      "Russia": "Russian Federation",
      "Dem. Rep. Congo": "Democratic Republic of the Congo",
      "Central African Rep.": "Central African Republic",
      "Eq. Guinea": "Equatorial Guinea",
      "Bosnia and Herz.": "Bosnia and Herzegovina",
      "Dominican Rep.": "Dominican Republic",
      "N. Cyprus": "Cyprus",
      "S. Sudan": "South Sudan"
    };
    const searchName = nameMap[geoName] || geoName;
    let match = data.find(d => d.country.toLowerCase() === searchName.toLowerCase() || d.country.toLowerCase() === geoName.toLowerCase());
    if (!match) {
       match = data.find(d => d.country.toLowerCase().includes(geoName.toLowerCase()) || geoName.toLowerCase().includes(d.country.toLowerCase()));
    }
    return match;
  };

  const geocodeCity = async (city, country) => {
    const query = `${city}, ${country}`;
    if (geocodeCache[query]) return geocodeCache[query];
    try {
      // Use Photon API (Komoot) as a robust free alternative to Nominatim
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(city + ', ' + country)}&limit=1`);
      const json = await res.json();
      if (json && json.features && json.features.length > 0) {
        // Photon returns [lon, lat], Leaflet expects [lat, lon]
        const lon = json.features[0].geometry.coordinates[0];
        const lat = json.features[0].geometry.coordinates[1];
        const coords = [lat, lon];
        
        geocodeCache[query] = coords;
        return coords;
      }
    } catch (e) {}
    return null;
  };

  const handleCountryClick = async (geo, countryData) => {
    // get bounding box from the clicked geography shape
    const b = geoBounds(geo);
    // Leaflet wants [[south, west], [north, east]]
    const leafletBounds = [
      [b[0][1], b[0][0]], 
      [b[1][1], b[1][0]]
    ];
    setMapBounds(leafletBounds);

    const cData = countryData || { country: geo.properties.name, total: 0, cities: [] };
    setSelectedCountry(cData);
    setCityMarkers([]);

    if (cData.cities && cData.cities.length > 0) {
      setIsGeocoding(true);
      const topCities = [...cData.cities].sort((a,b) => b.count - a.count).slice(0, 50); // Limit to 50
      
      const fetchMarkers = async () => {
          for (const city of topCities) {
             if (city.city !== 'Unknown') {
                 const coords = await geocodeCity(city.city, cData.country);
                 if (coords) {
                    setCityMarkers(prev => {
                       // Prevent duplicates if clicked multiple times quickly
                       if (prev.some(p => p.city === city.city)) return prev;
                       return [...prev, { ...city, coordinates: coords }];
                    });
                 }
                 // Small polite delay to prevent being blocked by the API provider
                 await new Promise(resolve => setTimeout(resolve, 150));
             }
          }
          setIsGeocoding(false);
      };
      
      fetchMarkers();
    }
  };

  const handleReset = () => {
    setSelectedCountry(null);
    setMapBounds(null);
    setCityMarkers([]);
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-low shadow-sm rounded-sm p-4 md:p-6 w-full flex flex-col xl:flex-row gap-6 mt-8 xl:h-[500px]">
      
      <style>{`
        .custom-leaflet-tooltip {
          background-color: #1e293b;
          color: #f8fafc;
          border: none;
          font-family: inherit;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 4px;
        }
        .custom-leaflet-tooltip::before { border-top-color: #1e293b; }
      `}</style>

      {/* Left side: Map (2/3) */}
      <div className="w-full xl:w-2/3 flex flex-col h-[350px] xl:h-auto">
        <h4 className="text-base md:text-lg font-bold text-primary mb-2 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary-container rounded-full"></span>
            {selectedCountry ? `${selectedCountry.country} Reach` : 'Global Reach'}
          </span>
          <span className="text-[10px] md:text-xs text-on-surface-variant font-bold uppercase tracking-widest border border-outline-variant/30 px-3 py-1 rounded-sm bg-surface-container-low flex items-center gap-2">
            {isGeocoding && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
            Total Views: <strong className="text-secondary ml-1">{selectedCountry ? selectedCountry.total : totalGlobalViews}</strong>
          </span>
        </h4>
        
        <div className="flex-1 bg-surface-container-low rounded-sm overflow-hidden relative shadow-inner">
          
          {!selectedCountry ? (
            // GLOBAL VIEW: React Simple Maps
            <>
            <ComposableMap 
              projectionConfig={{ scale: 140 }} 
              width={800} 
              height={400} 
              className="w-full h-full outline-none"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryData = getCountryData(geo.properties.name);
                    const views = countryData ? countryData.total : 0;
                    const percentage = totalGlobalViews > 0 ? ((views / totalGlobalViews) * 100).toFixed(1) : 0;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={views > 0 ? colorScale(views) : "#f1f5f9"}
                        stroke="#cbd5e1"
                        strokeWidth={0.5}
                        className="outline-none hover:stroke-primary hover:stroke-[1.5px] cursor-pointer transition-colors"
                        data-tooltip-id="global-map-tooltip"
                        data-tooltip-content={`${geo.properties.name} — ${views} Views (${percentage}%)`}
                        onClick={() => handleCountryClick(geo, countryData)}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: views > 0 ? "#1d4ed8" : "#cbd5e1" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            <ReactTooltip id="global-map-tooltip" place="top" style={{ backgroundColor: '#1e293b', color: '#f8fafc', fontSize: '11px', fontWeight: 'bold', zIndex: 100, padding: '6px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            </>
          ) : (
            // COUNTRY VIEW: Leaflet
            <MapContainer 
              center={[20, 0]} 
              zoom={2} 
              scrollWheelZoom={true}
              className="w-full h-full z-0"
              style={{ zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapBounds && <MapController bounds={mapBounds} />}
              
              {cityMarkers.map((marker, i) => {
                  const total = selectedCountry.total || 1;
                  const percentage = ((marker.count / total) * 100).toFixed(1);
                  const radius = Math.max(6, Math.min(25, (marker.count / total) * 25));
                  
                  return (
                      <CircleMarker 
                          key={i} 
                          center={marker.coordinates} 
                          pathOptions={{ color: '#ffffff', fillColor: '#ef4444', fillOpacity: 0.8, weight: 1.5 }} 
                          radius={radius}
                      >
                          <LeafletTooltip direction="top" className="custom-leaflet-tooltip" opacity={1} permanent={false}>
                               <strong>{marker.city}</strong><br/>{marker.count} Views ({percentage}%)
                          </LeafletTooltip>
                      </CircleMarker>
                  );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Right side: City breakdown (1/3) */}
      <div className="w-full xl:w-1/3 flex flex-col bg-surface-container-low rounded-sm p-4 md:p-6 overflow-hidden border border-outline-variant/20 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-3 shrink-0">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">
               {selectedCountry ? 'location_city' : 'public'}
            </span>
            {selectedCountry ? selectedCountry.country : 'Top Countries'}
          </h4>
          {selectedCountry && (
            <button 
               onClick={handleReset}
               className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 bg-surface-container-highest px-2 py-1 rounded-sm shadow-sm"
            >
              Back to Global <span className="material-symbols-outlined text-[12px]">public</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-4">
          {(() => {
            if (selectedCountry) {
              // CITY VIEW
              let citiesToShow = [...(selectedCountry.cities || [])].sort((a, b) => b.count - a.count);
              if (citiesToShow.length === 0) {
                return (
                  <div className="text-center text-xs text-on-surface-variant mt-10 flex flex-col items-center gap-2 opacity-60">
                     <span className="material-symbols-outlined text-3xl">location_off</span>
                     No city data available for this region.
                  </div>
                );
              }
              const maxCityCount = Math.max(...citiesToShow.map(c => c.count), 1);
              return citiesToShow.map((cityObj, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 relative group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-700 truncate pr-2 flex items-center gap-1">
                      {cityObj.city === 'Unknown' ? 'Unknown City' : cityObj.city}
                    </span>
                    <span className="text-xs font-bold text-primary">{cityObj.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary-container transition-all duration-500 rounded-full group-hover:bg-secondary"
                      style={{ width: `${(cityObj.count / maxCityCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ));
            } else {
              // COUNTRY VIEW (GLOBAL)
              let countriesToShow = [...data].sort((a, b) => b.total - a.total).slice(0, 50);
              if (countriesToShow.length === 0) {
                return (
                  <div className="text-center text-xs text-on-surface-variant mt-10 flex flex-col items-center gap-2 opacity-60">
                     <span className="material-symbols-outlined text-3xl">public_off</span>
                     No country data available.
                  </div>
                );
              }
              const maxCountryCount = Math.max(...countriesToShow.map(c => c.total), 1);
              return countriesToShow.map((cObj, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 relative group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-700 truncate pr-2 flex items-center gap-1 group-hover:text-primary transition-colors">
                      {cObj.country}
                    </span>
                    <span className="text-xs font-bold text-primary">{cObj.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-container transition-all duration-500 rounded-full group-hover:bg-primary"
                      style={{ width: `${(cObj.total / maxCountryCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ));
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default GeographicMap;
