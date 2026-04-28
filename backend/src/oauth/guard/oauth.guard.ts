import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class OAuthGuard implements CanActivate {
  private readonly logger = new Logger(OAuthGuard.name);

  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider;
    const stateFromQuery = request.query.state;
    const stateFromCookie = request.cookies?.[`oauth_${provider}_state`];
    const allowed = stateFromQuery === stateFromCookie;

    if (!allowed) {
      this.logger.warn(
        `OAuth state mismatch for provider=${provider} path=${request.path} hasStateQuery=${!!stateFromQuery} hasStateCookie=${!!stateFromCookie}`,
      );
    }

    return allowed;
  }
}
