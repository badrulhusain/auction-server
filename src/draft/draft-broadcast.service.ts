import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DraftBroadcastService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
    }

    async broadcastState(sessionId: string, state: unknown) {
        await this.supabase.channel(`session:${sessionId}`).send({
            type: 'broadcast',
            event: 'draft_state',
            payload: state,
        });
    }

    async broadcastSummary(sessionId: string, summary: unknown) {
        await this.supabase.channel(`session:${sessionId}`).send({
            type: 'broadcast',
            event: 'draft_summary',
            payload: summary,
        });
    }
}
