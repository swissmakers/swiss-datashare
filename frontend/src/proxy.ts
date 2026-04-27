import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

// This proxy redirects based on different conditions:
// - Authentication state
// - Setup status
// - Admin privileges
//
// Auth note: do not 307 authenticated users away from `/auth/*`. Next.js client
// navigations load `/_next/data/.../auth/signIn.json`; redirecting those to
// `/upload` caused hung tabs / “stuck on sign-in” while cookies were valid.
// Post-login navigation stays in SignInForm + signIn page effects.

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};

export async function proxy(request: NextRequest) {
  const routes = {
    unauthenticated: new Routes(["/auth/*", "/"]),
    public: new Routes([
      "/share/*",
      "/s/*",
      "/upload/*",
      "/error",
      "/imprint",
      "/privacy",
    ]),
    admin: new Routes(["/admin/*"]),
    account: new Routes(["/account*"]),
    disabled: new Routes([]),
  };

  // Get config from backend
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  const appConfig = (await (
    await fetch(`${apiUrl}/api/configs`)
  ).json()) as Array<{
    key: string;
    value: string | null;
    defaultValue: string;
    type: string;
  }>;

  const getConfig = (key: string) => {
    const variable = appConfig.find((entry) => entry.key === key);
    if (!variable) return null;

    const value = variable.value ?? variable.defaultValue;
    const locale =
      request.cookies.get("language")?.value ||
      request.headers.get("accept-language")?.split(",")[0] ||
      "en-US";
    const normalizedLocale = locale.split(";")[0];
    const baseLanguage = normalizedLocale.split("-")[0];

    let resolvedValue = value;
    if (
      [
        "legal.imprintText",
        "legal.imprintUrl",
        "legal.privacyPolicyText",
        "legal.privacyPolicyUrl",
      ].includes(key)
    ) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          const map = parsed as Record<string, string>;
          resolvedValue =
            map[normalizedLocale] ??
            map[baseLanguage] ??
            map["en-US"] ??
            map.en ??
            "";
        }
      } catch {
        resolvedValue = value;
      }
    }

    if (variable.type === "number" || variable.type === "filesize")
      return parseInt(resolvedValue, 10);
    if (variable.type === "boolean") return resolvedValue === "true";
    return resolvedValue;
  };

  const route = request.nextUrl.pathname;
  let user: { isAdmin: boolean } | null = null;
  const accessToken = request.cookies.get("access_token")?.value;

  try {
    const claims = jwtDecode<{ exp: number; isAdmin: boolean }>(
      accessToken as string,
    );
    if (claims.exp * 1000 > Date.now()) {
      user = claims;
    }
  } catch {
    user = null;
  }

  if (!getConfig("share.allowRegistration")) {
    routes.disabled.routes.push("/auth/signUp");
  }

  if (getConfig("share.allowUnauthenticatedShares")) {
    routes.public.routes = ["*"];
  }

  if (!getConfig("smtp.enabled")) {
    routes.disabled.routes.push("/auth/resetPassword*");
  }

  if (!getConfig("legal.enabled")) {
    routes.disabled.routes.push("/imprint", "/privacy");
  } else {
    if (!getConfig("legal.imprintText") && !getConfig("legal.imprintUrl")) {
      routes.disabled.routes.push("/imprint");
    }
    if (
      !getConfig("legal.privacyPolicyText") &&
      !getConfig("legal.privacyPolicyUrl")
    ) {
      routes.disabled.routes.push("/privacy");
    }
  }

  // prettier-ignore
  const rules = [
    // Disabled routes
    {
      condition: routes.disabled.contains(route),
      path: "/",
    },
    // Authenticated: skip marketing home only (not /auth/* — see file header).
    {
      condition:
        user &&
        routes.unauthenticated.contains(route) &&
        !route.startsWith("/auth/") &&
        !getConfig("share.allowUnauthenticatedShares"),
      path: "/upload",
    },
    // Unauthenticated state
    {
      condition: !user && !routes.public.contains(route) && !routes.unauthenticated.contains(route),
      path: "/auth/signIn",
    },
    {
      condition: !user && routes.account.contains(route),
      path: "/auth/signIn",
    },
    // Admin privileges
    {
      condition: routes.admin.contains(route) && !user?.isAdmin,
      path: "/upload",
    },
    // Home page
    {
      condition: (!getConfig("general.showHomePage") || user) && route == "/",
      path: "/upload",
    },
    // Imprint redirect
    {
      condition: route == "/imprint" && !getConfig("legal.imprintText") && getConfig("legal.imprintUrl"),
      path: getConfig("legal.imprintUrl"),
    },
    // Privacy redirect
    {
      condition: route == "/privacy" && !getConfig("legal.privacyPolicyText") && getConfig("legal.privacyPolicyUrl"),
      path: getConfig("legal.privacyPolicyUrl"),
    },
  ];
  for (const rule of rules) {
    if (rule.condition) {
      let { path } = rule;
      if (typeof path !== "string") continue;

      if (path == "/auth/signIn") {
        path = path + "?redirect=" + encodeURIComponent(route);
      }
      return NextResponse.redirect(new URL(path, request.url));
    }
  }

  const res = NextResponse.next();
  if (!request.cookies.get("language")?.value) {
    const defaultLoc = getConfig("general.defaultLocale");
    const raw =
      defaultLoc != null && String(defaultLoc).trim() !== ""
        ? String(defaultLoc)
        : "en-US";
    res.cookies.set("language", normalizeUiLocaleForMiddleware(raw), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

function normalizeUiLocaleForMiddleware(raw: string): string {
  const t = raw.trim().toLowerCase();
  const supported = ["en-US", "de-DE", "fr-FR", "es-ES", "it-IT"] as const;
  const exact = supported.find((c) => c.toLowerCase() === t);
  if (exact) return exact;
  const base = t.split("-")[0];
  const map: Record<string, string> = {
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
  };
  return map[base] ?? "en-US";
}

// Helper class to check if a route matches a list of routes
class Routes {
  constructor(public routes: string[]) {}

  contains(_route: string) {
    for (const route of this.routes) {
      if (new RegExp("^" + route.replace(/\*/g, ".*") + "$").test(_route))
        return true;
    }
    return false;
  }
}
