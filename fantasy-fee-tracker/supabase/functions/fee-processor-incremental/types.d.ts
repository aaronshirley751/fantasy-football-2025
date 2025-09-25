// Deno types for edge functions
declare namespace Deno {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Fantasy Football Fee Tracker Types
interface TransactionStats {
  roster_id: number;
  free_transactions_per_season: number;
  free_remaining: number;
  mulligan_used: boolean;
  total_transactions: number;
  paid_transactions: number;
}

interface FeeData {
  roster_id: number;
  type: string;
  amount: number;
  description: string;
  owner_name?: string;
}