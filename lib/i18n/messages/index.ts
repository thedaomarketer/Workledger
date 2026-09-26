import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { en, fr, es };
