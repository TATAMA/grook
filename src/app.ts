import {
  JSONParseError,
  middleware,
  SignatureValidationFailed,
} from "@line/bot-sdk";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import type { AppConfig } from "./config.js";
import {
  handleWebhookEvent,
  type HandlerContext,
  type LineTextEvent,
} from "./line/handler.js";
import type { LineReplyClient } from "./line/client.js";
import type { ReportPreferences } from "./preferences/index.js";
import type { LastMentionStore } from "./store/last-mention.js";
import type { XProvider } from "./x/types.js";

export interface AppDeps {
  config: AppConfig;
  store: LastMentionStore;
  xProvider: XProvider;
  lineClient: LineReplyClient;
  preferences: ReportPreferences;
  now?: () => Date;
}

export function createApp(deps: AppDeps): express.Express {
  const app = express();
  const now = deps.now ?? (() => new Date());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, name: "grook" });
  });

  app.post(
    "/webhook",
    middleware({ channelSecret: deps.config.lineChannelSecret }),
    async (req: Request, res: Response, next) => {
      try {
        const body = req.body as {
          events?: LineTextEvent[];
          destination?: string;
        };
        const events = Array.isArray(body.events) ? body.events : [];
        const ctx: HandlerContext = {
          config: deps.config,
          store: deps.store,
          xProvider: deps.xProvider,
          lineClient: deps.lineClient,
          preferences: deps.preferences,
          now,
          botUserId: body.destination,
        };
        await Promise.all(events.map((event) => handleWebhookEvent(event, ctx)));
        res.status(200).json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  );

  const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err instanceof SignatureValidationFailed) {
      res.status(401).json({ error: "invalid signature" });
      return;
    }
    if (err instanceof JSONParseError) {
      res.status(400).json({ error: "invalid json" });
      return;
    }
    console.error("unhandled error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "internal error" });
  };
  app.use(errorHandler);

  return app;
}
