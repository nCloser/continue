import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  ModelProvider,
} from "../../index.js";
import { stripImages } from "../images.js";
import { BaseLLM } from "../index.js";
import { streamResponse } from "../stream.js";

class Dify extends BaseLLM {
  static providerName: ModelProvider = "dify";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "http://localhost/v1",
    model: "default-model",
  };

  private conversationId: string | null = null;

  constructor(options: LLMOptions) {
    super(options);
    this.apiBase = options.apiBase ?? Dify.defaultOptions.apiBase;
    if (options.model === "AUTODETECT") {
      return;
    }
  }

  private _convertArgs(
    options: CompletionOptions,
    prompt: string | ChatMessage[],
  ) {
    const finalOptions: any = {
      inputs: {}, // 根据 API 文档，inputs 是一个空对象
      response_mode: "streaming", // 设置响应模式为流式
      // conversation_id: options.conversationId ?? "", // 会话ID
      // user: "default-user", // 用户ID
    };

    if (typeof prompt === "string") {
      finalOptions.query = prompt; // 修改为 query 以符合 API 文档
    } else {
      finalOptions.messages = prompt.map(this._convertMessage);
    }

    if (this.conversationId) {
      finalOptions.conversation_id = this.conversationId;
    }

    return finalOptions;
  }

  private _convertMessage(message: ChatMessage) {
    if (typeof message.content === "string") {
      return message;
    }

    return {
      role: message.role,
      content: stripImages(message.content),
      images: message.content
        .filter((part) => part.type === "imageUrl")
        .map((part) => part.imageUrl?.url.split(",").at(-1)),
    };
  }

  private getEndpoint(endpoint: string): URL {
    let base = this.apiBase;
    if (process.env.IS_BINARY) {
      base = base?.replace("localhost", "127.0.0.1");
    }

    return new URL(endpoint, base);
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    const response = await this.fetch(this.getEndpoint("chat-messages"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(this._convertArgs(options, prompt)),
    });

    let buffer = "";
    for await (const value of streamResponse(response)) {
      buffer += value;
      const chunks = buffer.split("\n");
      buffer = chunks.pop() ?? "";

      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (chunk.trim() !== "") {
          try {
            // 去掉 data: 前缀
            if (chunk.startsWith("data:")) {
              chunk = chunk.slice(5).trim();
            }
            // 跳过无效消息
            if (chunk.startsWith("event: ping")) {
              continue;
            }
            const j = JSON.parse(chunk);
            if (
              j.event === "message" &&
              j.conversation_id &&
              !this.conversationId
            ) {
              this.conversationId = j.conversation_id;
            }
            if (j.event === "message" && j.answer) {
              yield j.answer.replace(/\\n/g, "\n");
            } else if (j.error) {
              throw new Error(j.error);
            }
          } catch (e) {
            throw new Error(`Error parsing Dify response: ${e} ${chunk}`);
          }
        }
      }
    }
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    const response = await this.fetch(this.getEndpoint("chat-messages"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(this._convertArgs(options, messages)),
    });

    let buffer = "";
    for await (const value of streamResponse(response)) {
      buffer += value;
      const chunks = buffer.split("\n");
      buffer = chunks.pop() ?? "";

      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (chunk.trim() !== "") {
          try {
            // 去掉 data: 前缀
            if (chunk.startsWith("data:")) {
              chunk = chunk.slice(5).trim();
            }
            // 跳过无效消息
            if (chunk.startsWith("event: ping")) {
              continue;
            }
            const j = JSON.parse(chunk);
            if (
              j.event === "message" &&
              j.conversation_id &&
              !this.conversationId
            ) {
              this.conversationId = j.conversation_id;
            }
            if (j.event === "message" && j.answer) {
              yield {
                role: "assistant",
                content: j.answer.replace(/\\n/g, "\n"),
              };
            } else if (j.error) {
              throw new Error(j.error);
            }
          } catch (e) {
            throw new Error(`Error parsing Dify response: ${e} ${chunk}`);
          }
        }
      }
    }
  }
}

export default Dify;
