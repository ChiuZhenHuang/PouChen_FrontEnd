export interface Metadata {
  material: string;
  weight: string;
}

export interface MeshItem {
  id: string;
  name: string;
  category: string;
  color: string;
  basePrice: number;
  multiplier: number;
  metadata: Metadata;
}
