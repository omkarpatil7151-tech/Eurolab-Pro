import type { BathInput, BathListQuery, BathListResult, BathRecord } from "@/types/bath";

export interface BathRepository {
  list(query: BathListQuery): Promise<BathListResult>;
  create(input: BathInput): Promise<BathRecord>;
  update(id: number, input: BathInput): Promise<BathRecord>;
  delete(id: number): Promise<void>;
}

function getDesktopApi() {
  if (!window.eurolab) {
    throw new Error("Eurolab desktop API is unavailable.");
  }

  return window.eurolab;
}

export const bathRepository: BathRepository = {
  list(query) {
    return getDesktopApi().baths.list(query);
  },
  create(input) {
    return getDesktopApi().baths.create(input);
  },
  update(id, input) {
    return getDesktopApi().baths.update(id, input);
  },
  delete(id) {
    return getDesktopApi().baths.delete(id);
  }
};
