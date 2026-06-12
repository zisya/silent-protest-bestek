export interface Protest {
  id: string;
  text: string;
  solution?: string;
  likes: number;
  createdAt?: number | { seconds: number; nanoseconds: number } | null;
}
