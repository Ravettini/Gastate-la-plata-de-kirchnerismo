import { useCallback, useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { GameCase } from '../../data/enterrarlaTodaCases'
import type { LatLng } from '../../utils/enterrarlaGeo'

function MapClickLayer(props: {
  enabled: boolean
  onPick: (lat: number, lng: number) => void
}) {
  const { enabled, onPick } = props
  useMapEvents({
    click(e) {
      if (!enabled) return
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const userIcon = L.divIcon({
  className: 'enterrarla-marker-user',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#F6C445;border:3px solid #0F1115;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

const targetIcon = L.divIcon({
  className: 'enterrarla-marker-target',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#22C55E;border:3px solid #0F1115;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export function GuessMap(props: {
  mapCenter: GameCase['mapCenter']
  target: GameCase['targetLocation']
  guess: LatLng | null
  revealed: boolean
  interactionEnabled: boolean
  onPick: (lat: number, lng: number) => void
  mapKey: number
}) {
  const { mapCenter, target, guess, revealed, interactionEnabled, onPick, mapKey } = props

  const centerTuple = useMemo(
    () => [mapCenter.lat, mapCenter.lng] as [number, number],
    [mapCenter.lat, mapCenter.lng],
  )

  const onPickStable = useCallback(
    (lat: number, lng: number) => {
      onPick(lat, lng)
    },
    [onPick],
  )

  const linePositions: [number, number][] | null =
    revealed && guess ? [
      [guess.lat, guess.lng],
      [target.lat, target.lng],
    ] : null

  return (
    <div className="w-full min-h-[320px] lg:min-h-[420px] h-[min(52vh,520px)] lg:h-[min(60vh,560px)] rounded-[18px] overflow-hidden border border-[#2A2F3A] shadow-lg">
      <MapContainer
        key={mapKey}
        center={centerTuple}
        zoom={mapCenter.zoom}
        className="h-full w-full z-0"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickLayer enabled={interactionEnabled} onPick={onPickStable} />
        {guess ? <Marker position={[guess.lat, guess.lng]} icon={userIcon} /> : null}
        {revealed ? (
          <>
            <Marker position={[target.lat, target.lng]} icon={targetIcon} />
            {linePositions ? (
              <Polyline
                positions={linePositions}
                pathOptions={{ color: '#EF4444', weight: 3, opacity: 0.85 }}
              />
            ) : null}
          </>
        ) : null}
      </MapContainer>
    </div>
  )
}
