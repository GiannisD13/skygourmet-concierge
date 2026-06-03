import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { geoMercator } from 'd3-geo';
import { useOrder } from '@/context/OrderContext';
import { airports as staticAirports, airportMeta, Airport } from '@/types/catering';
import { api } from '@/lib/api';

// --- Map projection (hard-coded; do NOT fitExtent against this dataset, its
// reversed polygon winding makes geoBounds report global bounds) ---
const W = 1000;
const H = 1050;
const projection = geoMercator().center([23.6, 38.7]).scale(5300).translate([W / 2, H / 2]);

// Greece GeoJSON is vendored at public/assets/greece.json (served from our own
// origin) rather than fetched from GitHub raw at runtime.
const GEOJSON_URL = '/assets/greece.json';

interface City {
  name: string;
  code: string;
  lon: number;
  lat: number;
  anchor: 'start' | 'end';
  dx: number;
  dy: number;
}

const CITIES: City[] = [
  { name: 'Thessaloniki', code: 'SKG', lon: 22.9444, lat: 40.6401, anchor: 'start', dx: 22, dy: -14 },
  { name: 'Athens', code: 'ATH', lon: 23.9445, lat: 37.9364, anchor: 'start', dx: 22, dy: 18 },
  { name: 'Mykonos', code: 'JMK', lon: 25.3289, lat: 37.4467, anchor: 'end', dx: -22, dy: -14 },
];

// Markers and route curves depend only on the fixed projection, so they're
// computed once at module load — only the land outline needs the fetch.
const MARKERS = CITIES.map((c, i) => {
  const p = projection([c.lon, c.lat]);
  return { ...c, x: p ? p[0] : 0, y: p ? p[1] : 0, delay: i + 1 };
});

const ROUTES: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < MARKERS.length - 1; i++) {
    const a = MARKERS[i];
    const b = MARKERS[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - 40; // arch the control point upward
    out.push(`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
  }
  return out;
})();

// --- GeoJSON ring-walker -------------------------------------------------
// The georgique dataset uses reversed (CW) outer-ring winding, which makes
// d3.geoPath render each feature as the world-complement of itself. We bypass
// that by projecting each [lon, lat] ourselves and emitting the path directly;
// SVG's nonzero fill rule is winding-agnostic, so this Just Works.
type Ring = [number, number][];
type Poly = Ring[];
interface GeoGeometry {
  type: string;
  coordinates: Poly | Poly[];
}
interface GeoFeature {
  type?: string;
  geometry?: GeoGeometry | null;
}
interface GeoCollection {
  type: string;
  features?: GeoFeature[];
}

function featureToPath(feature: GeoFeature): string {
  const geom = feature.geometry;
  if (!geom) return '';
  let polys: Poly[];
  if (geom.type === 'MultiPolygon') polys = geom.coordinates as Poly[];
  else if (geom.type === 'Polygon') polys = [geom.coordinates as Poly];
  else return '';

  let d = '';
  for (const poly of polys) {
    for (const ring of poly) {
      let first = true;
      for (const coord of ring) {
        const pt = projection(coord);
        if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) continue;
        d += `${first ? 'M' : 'L'}${pt[0].toFixed(1)} ${pt[1].toFixed(1)} `;
        first = false;
      }
      d += 'Z ';
    }
  }
  return d.trim();
}

// --- Accordion data ------------------------------------------------------
// `code` (IATA) maps each row onto a real airport for routing to /menu.
interface NetworkAirport {
  id: string;
  code: string;
  name: string;
  suffix: string;
  icao: string;
  status: string;
  desc: string;
}

const AIRPORTS: NetworkAirport[] = [
  {
    id: 'ath',
    code: 'ATH',
    name: 'Athens',
    suffix: 'Eleftherios Venizelos',
    icao: 'LGAV / ATH · N 37.94° E 23.94°',
    status: 'Active',
    desc: 'Primary kitchen · Twenty-four-hour provisioning · Ninety-minute lead time to wheels-up.',
  },
  {
    id: 'skg',
    code: 'SKG',
    name: 'Thessaloniki',
    suffix: 'Macedonia',
    icao: 'LGTS / SKG · N 40.64° E 22.95°',
    status: 'Active',
    desc: 'Macedonian provenance · Two-hour lead time · Private terminal & direct apron access.',
  },
  {
    id: 'jmk',
    code: 'JMK',
    name: 'Mykonos',
    suffix: 'Island',
    icao: 'LGMK / JMK · N 37.45° E 25.33°',
    status: 'Seasonal',
    desc: 'Seasonal service · April through October · Aegean seafood within the hour.',
  },
];

const AccordionItem = ({
  airport,
  open,
  onToggle,
  onSelect,
}: {
  airport: NetworkAirport;
  open: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Drive max-height off the body's real height for precise, no-overshoot
  // motion — and re-measure on resize while open in case content reflows.
  useEffect(() => {
    const body = bodyRef.current;
    const inner = innerRef.current;
    if (!body || !inner) return;

    const measure = () => {
      body.style.maxHeight = open ? `${inner.scrollHeight}px` : '0px';
    };
    measure();

    if (!open) return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  return (
    <article className={`acc-item${open ? ' open' : ''}`} data-airport={airport.id}>
      <button className="acc-head" type="button" aria-expanded={open} onClick={onToggle}>
        <span className="acc-name">
          {airport.name}
          <span className="acc-faint">{airport.suffix}</span>
        </span>
        <span className="acc-icon" aria-hidden="true" />
      </button>
      <div className="acc-body" ref={bodyRef} aria-hidden={!open}>
        <div className="acc-body-inner" ref={innerRef}>
          <div className="acc-meta">
            <span className="acc-icao">{airport.icao}</span>
            <span className="acc-status">
              <span className="acc-pulse" />
              {airport.status}
            </span>
          </div>
          <p className="acc-desc">{airport.desc}</p>
          {/* Quiet routing affordance — its own zone below a hairline, set apart
              from the dim description by cream text + a gold "this acts" arrow. */}
          <div className="acc-cta">
            <button className="acc-link" type="button" onClick={onSelect}>
              Select {airport.name}
              <span className="acc-link-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * Network section — a dark luxury map of Greece with pulsing gold markers and
 * dashed routes (left), beside a single-open editorial accordion of the same
 * airports (right). Sits directly under the hero; reuses the hero's tokens.
 */
const AltitudeNetwork = () => {
  const navigate = useNavigate();
  const { setSelectedAirport } = useOrder();
  const [landPaths, setLandPaths] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [apiAirports, setApiAirports] = useState<Airport[]>([]);

  // Fetch real airports so the row can route with the DB id (which /menu uses
  // for airport-specific bundles); the static list covers an API outage.
  useEffect(() => {
    let cancelled = false;
    api
      .get<Airport[]>('/api/v1/airports')
      .then((data) => {
        if (!cancelled) setApiAirports(data.map((a) => ({ ...a, ...(airportMeta[a.code] ?? {}) })));
      })
      .catch(() => {
        /* fall back to static airports in handleSelect */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror LocationSelector's flow: set the destination, then go to the menu.
  const handleSelect = (code: string) => {
    const airport = apiAirports.find((a) => a.code === code) ?? staticAirports.find((a) => a.code === code);
    if (!airport) return;
    setSelectedAirport(airport);
    navigate('/menu');
  };

  useEffect(() => {
    let cancelled = false;
    fetch(GEOJSON_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((geo: GeoCollection) => {
        if (cancelled) return;
        const features = geo.type === 'FeatureCollection' ? geo.features ?? [] : [geo as GeoFeature];
        setLandPaths(features.map(featureToPath).filter(Boolean));
      })
      .catch((err) => {
        if (!cancelled) console.warn('Greece map failed to load:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="altitude-network">
      <div className="routes-grid">
        <div className="map-col">
          <div className="map-wrap">
            <svg
              className="map-svg"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <g>
                {landPaths.map((d, i) => (
                  <path key={i} className="land" d={d} />
                ))}
              </g>
              <g>
                {ROUTES.map((d, i) => (
                  <path key={i} className="route-line" d={d} style={{ animationDelay: `${0.5 + i * 0.35}s` }} />
                ))}
              </g>
              <g>
                {MARKERS.map((m) => (
                  <g key={m.code} className={`marker delay-${m.delay}`} transform={`translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})`}>
                    <circle className="ring" cx={0} cy={0} r={3} />
                    <circle className="core" cx={0} cy={0} r={3} />
                    <line className="leader" x1={0} y1={0} x2={m.dx * 0.55} y2={m.dy * 0.55} />
                    <text className="label" x={m.dx} y={m.dy} textAnchor={m.anchor}>
                      {m.name}
                    </text>
                    <text className="label-sub" x={m.dx} y={m.dy + 14} textAnchor={m.anchor}>
                      {m.code}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>

        <div className="network-col">
          <div className="network-inner">
            <div className="network-label">Our Network</div>
            <div className="accordion">
              {AIRPORTS.map((a) => (
                <AccordionItem
                  key={a.id}
                  airport={a}
                  open={openId === a.id}
                  onToggle={() => setOpenId((prev) => (prev === a.id ? null : a.id))}
                  onSelect={() => handleSelect(a.code)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AltitudeNetwork;
