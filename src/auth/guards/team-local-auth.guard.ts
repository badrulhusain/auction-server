import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TeamLocalAuthGuard extends AuthGuard('team-local') { }
