import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStreetSearchStore } from '../store/useStreetSearchStore';

// Custom street search marker icon
const createStreetMarkerIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #ef4444;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'street-search-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Helper function to extract street info from display_name
const extractStreetInfo = (displayName: string) => {
  const parts = displayName.split(', ');

  // Try to extract house number from the first part
  const firstPart = parts[0] || '';
  const houseNumberMatch = firstPart.match(/(\d+)/);
  const houseNumber = houseNumberMatch ? houseNumberMatch[1] : null;

  // Extract street name (usually the first or second part)
  let streetName = '';
  if (parts.length > 1) {
    // If first part has a number, street name is likely the second part
    if (houseNumber) {
      streetName = parts[1] || parts[0].replace(/\d+\s*,?\s*/, '').trim();
    } else {
      streetName = parts[0];
    }
  } else {
    streetName = firstPart;
  }

  return {
    streetName: streetName.trim(),
    houseNumber,
    fullAddress: displayName,
  };
};

export default function StreetSearchMarker() {
  const map = useMap();
  const { selectedStreet } = useStreetSearchStore();

  useEffect(() => {
    let marker: L.Marker | null = null;

    if (selectedStreet) {
      const lat = parseFloat(selectedStreet.lat);
      const lng = parseFloat(selectedStreet.lon);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Create marker
        marker = L.marker([lat, lng], {
          icon: createStreetMarkerIcon(),
        }).addTo(map);

        // Extract street information
        const streetInfo = extractStreetInfo(selectedStreet.display_name);

        // Add popup with street information
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${streetInfo.streetName || selectedStreet.name || 'Location'}
            </h3>
            ${
              streetInfo.houseNumber
                ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">
                <strong>Number:</strong> ${streetInfo.houseNumber}
              </p>`
                : ''
            }
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">
              <strong>Type:</strong> ${
                selectedStreet.type || selectedStreet.class
              }
            </p>
            <p style="margin: 0; font-size: 10px; color: #888; line-height: 1.3;">
              ${selectedStreet.display_name}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent).openPopup();

        // Pan to the location with appropriate zoom
        const currentZoom = map.getZoom();
        const targetZoom = Math.max(currentZoom, 16);

        map.setView([lat, lng], targetZoom, {
          animate: true,
          duration: 0.5,
        });
      }
    }

    // Cleanup function
    return () => {
      if (marker) {
        map.removeLayer(marker);
      }
    };
  }, [selectedStreet, map]);

  return null;
}
