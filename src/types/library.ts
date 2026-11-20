export type Subject = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
};

export type Level = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
};

export type LibraryRef = { id: number; name: string };

export type ContentKind = "course" | "summary_sheet" | "recap";

export type LibraryContent = {
  id: number;
  title: string;
  description: string | null;
  type: ContentKind;
  type_label: string;
  subject: LibraryRef;
  level: LibraryRef;
  sort_order: number;
  is_published: boolean;
  favorited: boolean;
  created_at: string;
};

export type LibraryContentDetail = LibraryContent & { body: string };

export type CompressionStatus = "pending" | "processing" | "done" | "failed" | "skipped";

export type Podcast = {
  id: number;
  title: string;
  description: string | null;
  subject: LibraryRef;
  level: LibraryRef;
  duration_seconds: number;
  mime_type: string;
  size_bytes: number;
  compression_status: CompressionStatus;
  compression_status_label: string;
  is_published: boolean;
  favorited: boolean;
  audio_url: string;
  created_at: string;
};

export type FlatPaginated<T> = {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};

export type ContentListParams = {
  search?: string;
  subject_id?: number;
  level_id?: number;
  type?: ContentKind;
  favorite?: boolean;
  per_page?: number;
  page?: number;
};

export type PodcastListParams = Omit<ContentListParams, "type">;

export type OfflineManifestContent = {
  id: number;
  title: string;
  description: string | null;
  type: ContentKind;
  type_label: string;
  subject_id: number;
  level_id: number;
  body: string;
  sort_order: number;
};

export type OfflineManifestPodcast = {
  id: number;
  title: string;
  description: string | null;
  subject_id: number;
  level_id: number;
  duration_seconds: number;
  size_bytes: number;
  audio_url: string;
};

export type OfflineManifest = {
  generated_at: string;
  signed_url_ttl_minutes: number;
  subjects: Subject[];
  levels: Level[];
  contents: OfflineManifestContent[];
  podcasts: OfflineManifestPodcast[];
  favorites: {
    contents: { id: number }[];
    podcasts: { id: number }[];
  };
};
