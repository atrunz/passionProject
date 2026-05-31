import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventGenre } from "@prisma/client";
import { GenerateEventCopyDto } from "./dto/generate-event-copy.dto";

export type EventCopySuggestion = {
  title: string;
  description: string;
  genre: EventGenre;
  promoLine: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async generateEventCopy(dto: GenerateEventCopyDto): Promise<EventCopySuggestion> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      return this.generateFallbackCopy(dto);
    }

    try {
      return await this.generateOpenAICopy(dto, apiKey);
    } catch {
      return this.generateFallbackCopy(dto);
    }
  }

  private async generateOpenAICopy(dto: GenerateEventCopyDto, apiKey: string) {
    const model = this.config.get<string>("OPENAI_MODEL", "gpt-5.4-mini");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You write concise, concrete event listing copy for local shows. Return only valid JSON."
          },
          {
            role: "user",
            content: `Create event copy for LocalShow.
Idea: ${dto.idea}
Genre hint: ${dto.genre ?? "unknown"}
Location: ${dto.locationName ?? "unknown"}
City: ${dto.city ?? "unknown"}

Return JSON with title, description, genre, promoLine.
Genre must be one of: ${Object.values(EventGenre).join(", ")}.
Description should be 2 sentences, specific, and not sound like an ad agency.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    const body = (await response.json()) as OpenAIResponse;
    const text = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;

    if (!text) {
      throw new Error("OpenAI response did not include text");
    }

    return this.normalizeSuggestion(JSON.parse(text) as Partial<EventCopySuggestion>, dto);
  }

  private generateFallbackCopy(dto: GenerateEventCopyDto): EventCopySuggestion {
    const genre = dto.genre ?? this.inferGenre(dto.idea);
    const location = dto.locationName ? ` at ${dto.locationName}` : "";
    const city = dto.city ? ` in ${dto.city}` : "";
    const title = this.titleCase(dto.idea).slice(0, 80) || "Local Show Night";

    return {
      title,
      genre,
      description: `${title}${location}${city} brings a focused local lineup together for an easy night out. Expect a tight bill, straightforward ticketing, and a room built around the people who actually show up.`,
      promoLine: `Catch ${title}${city}.`
    };
  }

  private normalizeSuggestion(
    suggestion: Partial<EventCopySuggestion>,
    dto: GenerateEventCopyDto
  ): EventCopySuggestion {
    const genre = this.isGenre(suggestion.genre) ? suggestion.genre : dto.genre ?? this.inferGenre(dto.idea);

    return {
      title: this.cleanText(suggestion.title, this.generateFallbackCopy(dto).title, 90),
      description: this.cleanText(
        suggestion.description,
        this.generateFallbackCopy(dto).description,
        700
      ),
      genre,
      promoLine: this.cleanText(suggestion.promoLine, this.generateFallbackCopy(dto).promoLine, 160)
    };
  }

  private cleanText(value: string | undefined, fallback: string, maxLength: number) {
    const text = value?.trim();
    return text ? text.slice(0, maxLength) : fallback;
  }

  private inferGenre(idea: string): EventGenre {
    const normalized = idea.toLowerCase();

    if (normalized.includes("comedy") || normalized.includes("standup")) {
      return EventGenre.COMEDY;
    }

    if (normalized.includes("punk")) {
      return EventGenre.PUNK;
    }

    if (normalized.includes("dj") || normalized.includes("electronic")) {
      return EventGenre.ELECTRONIC;
    }

    if (normalized.includes("rap") || normalized.includes("hip hop")) {
      return EventGenre.HIP_HOP;
    }

    if (normalized.includes("folk")) {
      return EventGenre.FOLK;
    }

    if (normalized.includes("jazz")) {
      return EventGenre.JAZZ;
    }

    if (normalized.includes("rock")) {
      return EventGenre.ROCK;
    }

    return EventGenre.INDIE;
  }

  private isGenre(value: unknown): value is EventGenre {
    return typeof value === "string" && Object.values(EventGenre).includes(value as EventGenre);
  }

  private titleCase(value: string) {
    return value
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
}
