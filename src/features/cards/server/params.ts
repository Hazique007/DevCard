
import { parseAsString, parseAsStringEnum, createLoader } from "nuqs/server";

export const cardsSearchParams ={
  search: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  cursor: parseAsString.withDefault(""),
}


export const cardsParamsLoader = createLoader(cardsSearchParams);