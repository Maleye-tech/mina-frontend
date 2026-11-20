import { listOf, qs, request } from "../lib/api";
import type { Paginated } from "../types/api";
import type {
  FlashcardCard,
  FlashcardDeck,
  FlashcardDeckDetail,
  FlashcardState,
} from "../types/assessment";

export type DeckParams = {
  subject_id?: number;
  level_id?: number;
  per_page?: number;
  page?: number;
};

export const flashcardsService = {
  listDecks(params: DeckParams = {}): Promise<Paginated<FlashcardDeck>> {
    return request<Paginated<FlashcardDeck>>(
      `/v1/flashcards/decks${qs({
        subject_id: params.subject_id,
        level_id: params.level_id,
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
  },

  async getDeck(id: number): Promise<FlashcardDeckDetail> {
    const res = await request<{ deck: FlashcardDeckDetail }>(`/v1/flashcards/decks/${id}`);
    return res.deck;
  },

  async reviewsToday(
    params: { deck_id?: number; new_limit?: number } = {},
  ): Promise<FlashcardCard[]> {
    const res = await request<FlashcardCard[] | { data: FlashcardCard[] }>(
      `/v1/flashcards/reviews/today${qs({ deck_id: params.deck_id, new_limit: params.new_limit })}`,
    );
    return listOf(res);
  },

  review(cardId: number, quality: number): Promise<{ message: string; state: FlashcardState }> {
    return request<{ message: string; state: FlashcardState }>(`/v1/flashcards/${cardId}/reviews`, {
      method: "POST",
      body: { quality },
    });
  },
};
