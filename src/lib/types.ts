export type ReadingProgress = {
  id: string;
  book_id: string;
  user_id: string;
  reader_name: string;
  current_page: number;
  updated_at: string;
  progress_color: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  cover_path: string;
  created_at: string;
  reading_progress: ReadingProgress[];
};

export type PersonalBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  cover_path: string | null;
  created_at: string;
  updated_at: string;
};
