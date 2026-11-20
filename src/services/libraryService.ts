import { qs, request } from "../lib/api";
import type {
  ContentKind,
  ContentListParams,
  FlatPaginated,
  Level,
  LibraryContent,
  LibraryContentDetail,
  OfflineManifest,
  Podcast,
  PodcastListParams,
  Subject,
} from "../types/library";

export type FavoriteResult = { message: string; favorited: boolean };
export type CreatePodcastResult = { message: string; podcast: Podcast };

export type ContentInput = {
  title: string;
  description?: string;
  type: ContentKind;
  subject_id: number;
  level_id: number;
  body: string;
  is_published: boolean;
};

export type ContentResult = { message: string; content: LibraryContentDetail };

function listParams(params: ContentListParams): string {
  return qs({
    search: params.search,
    subject_id: params.subject_id,
    level_id: params.level_id,
    type: params.type,
    favorite: params.favorite ? 1 : undefined,
    per_page: params.per_page,
    page: params.page,
  });
}

export const libraryService = {
  async subjects(): Promise<Subject[]> {
    const res = await request<{ subjects: Subject[] }>("/v1/library/subjects");
    return res.subjects;
  },

  async levels(): Promise<Level[]> {
    const res = await request<{ levels: Level[] }>("/v1/library/levels");
    return res.levels;
  },

  listContents(params: ContentListParams = {}): Promise<FlatPaginated<LibraryContent>> {
    return request<FlatPaginated<LibraryContent>>(`/v1/library/contents${listParams(params)}`);
  },

  async getContent(id: number): Promise<LibraryContentDetail> {
    const res = await request<{ content: LibraryContentDetail }>(`/v1/library/contents/${id}`);
    return res.content;
  },

  createContent(input: ContentInput): Promise<ContentResult> {
    return request<ContentResult>("/v1/library/contents", { method: "POST", body: input });
  },

  updateContent(id: number, input: ContentInput): Promise<ContentResult> {
    return request<ContentResult>(`/v1/library/contents/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  favoriteContent(id: number): Promise<FavoriteResult> {
    return request<FavoriteResult>(`/v1/library/contents/${id}/favorite`, { method: "POST" });
  },

  unfavoriteContent(id: number): Promise<FavoriteResult> {
    return request<FavoriteResult>(`/v1/library/contents/${id}/favorite`, { method: "DELETE" });
  },

  listPodcasts(params: PodcastListParams = {}): Promise<FlatPaginated<Podcast>> {
    return request<FlatPaginated<Podcast>>(`/v1/library/podcasts${listParams(params)}`);
  },

  async getPodcast(id: number): Promise<Podcast> {
    const res = await request<{ podcast: Podcast }>(`/v1/library/podcasts/${id}`);
    return res.podcast;
  },

  favoritePodcast(id: number): Promise<FavoriteResult> {
    return request<FavoriteResult>(`/v1/library/podcasts/${id}/favorite`, { method: "POST" });
  },

  unfavoritePodcast(id: number): Promise<FavoriteResult> {
    return request<FavoriteResult>(`/v1/library/podcasts/${id}/favorite`, { method: "DELETE" });
  },

  createPodcast(data: FormData): Promise<CreatePodcastResult> {
    return request<CreatePodcastResult>("/v1/library/podcasts", { method: "POST", body: data });
  },

  offlineManifest(): Promise<OfflineManifest> {
    return request<OfflineManifest>("/v1/library/offline-manifest");
  },
};
