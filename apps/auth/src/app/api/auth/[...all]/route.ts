import { toNextJsHandler } from "better-auth/next-js";
import { platformAuth } from "@/lib/platform-auth";

const { GET, POST } = toNextJsHandler(platformAuth.handler);

export { GET, POST };
