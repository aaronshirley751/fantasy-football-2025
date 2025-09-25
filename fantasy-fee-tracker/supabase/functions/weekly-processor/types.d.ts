// Deno types for edge functions
declare namespace Deno {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Fantasy Football Fee Tracker Types
interface FeeData {
  roster_id: number;
  type: string;
  amount: number;
  description: string;
  owner_name?: string;
}