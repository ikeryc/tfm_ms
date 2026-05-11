declare module 'react-simple-maps' {
  import type { ReactNode, CSSProperties, SVGProps } from 'react';

  export interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  }

  export interface Position {
    coordinates: [number, number];
    zoom: number;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    onMoveStart?: (position: Position) => void;
    onMove?: (position: Position & { dragging: boolean }) => void;
    onMoveEnd?: (position: Position) => void;
    translateExtent?: [[number, number], [number, number]];
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: object[] }) => ReactNode;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: object;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: { default?: CSSProperties; hover?: CSSProperties; pressed?: CSSProperties };
  }

  export interface MarkerProps {
    coordinates: [number, number];
    onClick?: () => void;
    style?: CSSProperties;
    children?: ReactNode;
  }

  export interface AnnotationProps {
    subject: [number, number];
    dx?: number;
    dy?: number;
    children?: ReactNode;
  }

  export interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    children?: ReactNode;
  }

  export interface MapContextValue {
    projection: (coords: [number, number]) => [number, number] | null;
    [key: string]: unknown;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Annotation: React.FC<AnnotationProps>;
  export const Line: React.FC<LineProps>;
  export const Sphere: React.FC<SVGProps<SVGPathElement>>;
  export const Graticule: React.FC<SVGProps<SVGPathElement>>;
  export const MapContext: React.Context<MapContextValue>;
  export const MapProvider: React.FC<{ children?: ReactNode }>;
  export function useMapContext(): MapContextValue;
  export function useGeographies(props: { geography: string | object }): { geographies: object[] };
}
