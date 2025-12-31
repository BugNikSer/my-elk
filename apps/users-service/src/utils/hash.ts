import { createHash } from "crypto";

export const hashString = (input: string) => createHash("md5").update(input).digest('hex');
