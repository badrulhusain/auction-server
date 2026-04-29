import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
    );

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) throw new UnauthorizedException();

        const { data: { user }, error } = await this.supabase.auth.getUser(token);
        if (error || !user) throw new UnauthorizedException();

        req.user = {
            userId: user.id,
            role: user.app_metadata?.role as 'ADMIN' | 'TEAM',
            auction_id: user.app_metadata?.auction_id as string | undefined,
        };
        return true;
    }
}
