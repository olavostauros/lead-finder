import { normalize } from "./text";

export interface Category {
  label: string;
  tags: [key: string, value: string][];
}

export const CATEGORIES: Category[] = [
  { label: "Padaria", tags: [["shop", "bakery"]] },
  { label: "Academia", tags: [["leisure", "fitness_centre"]] },
  { label: "Dentista", tags: [["amenity", "dentist"], ["healthcare", "dentist"]] },
  { label: "Farmácia", tags: [["amenity", "pharmacy"]] },
  { label: "Restaurante", tags: [["amenity", "restaurant"]] },
  { label: "Lanchonete", tags: [["amenity", "fast_food"]] },
  { label: "Bar", tags: [["amenity", "bar"], ["amenity", "pub"]] },
  { label: "Café", tags: [["amenity", "cafe"]] },
  { label: "Salão de beleza", tags: [["shop", "hairdresser"], ["shop", "beauty"]] },
  { label: "Mercado", tags: [["shop", "supermarket"], ["shop", "convenience"]] },
  { label: "Pet shop", tags: [["shop", "pet"]] },
  { label: "Oficina mecânica", tags: [["shop", "car_repair"]] },
  { label: "Clínica médica", tags: [["amenity", "clinic"], ["amenity", "doctors"]] },
  { label: "Hotel", tags: [["tourism", "hotel"], ["tourism", "guest_house"]] },
  { label: "Imobiliária", tags: [["office", "estate_agent"]] },
  { label: "Contabilidade", tags: [["office", "accountant"]] },
  { label: "Advocacia", tags: [["office", "lawyer"]] },
];

export function findCategory(term: string): Category | undefined {
  const key = normalize(term);
  return CATEGORIES.find((c) => normalize(c.label) === key);
}
