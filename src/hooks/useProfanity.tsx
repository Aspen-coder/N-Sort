import { useMemo, useState } from "react";
import { ProfanityFilter, profanityFilter as defaultFilter } from "../utils/profanity";

export function useProfanity(customFilter?: ProfanityFilter) {
  const filter = useMemo(() => customFilter ?? defaultFilter, [customFilter]);
  const [isDirty, setDirty] = useState(false);

  function check(text: string) {
    setDirty(true);
    return filter.isProfane(text);
  }

  function censor(text: string) {
    return filter.censor(text);
  }

  return { filter, check, censor, isDirty };
}