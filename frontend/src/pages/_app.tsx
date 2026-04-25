import { getCookie } from "cookies-next";
import moment from "moment";
import "moment/locale/de";
import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/it";
import type { AppContext, AppProps } from "next/app";
import NextApp from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { IntlProvider } from "react-intl";
import Header from "../components/header/Header";
import { ConfigContext } from "../hooks/config.hook";
import { UserContext } from "../hooks/user.hook";
import { LOCALES } from "../i18n/locales";
import authService from "../services/auth.service";
import configService from "../services/config.service";
import userService from "../services/user.service";
import Config from "../types/config.type";
import { CurrentUser } from "../types/user.type";
import i18nUtil from "../utils/i18n.util";
import Footer from "../components/footer/Footer";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ModalProvider } from "../contexts/ModalContext";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui";
import { setGlobalToast } from "../utils/toast.util";
import { mergeMessagesForUseCase } from "../i18n/useCaseOverrides";
import {
  fetchPublicConfigList,
  resolveAppInitialLocale,
} from "../utils/initialLocale.app.util";
import "../styles/globals.css";

const excludeDefaultLayoutRoutes = ["/admin/config/[category]"];

type AppPageProps = AppProps["pageProps"] & {
  creatorLocale?: string | null;
  initialResolvedLocale?: string;
};

function SwissDataShare({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Set global toast functions
  useEffect(() => {
    setGlobalToast({ success, error, warning, info });
  }, [success, error, warning, info]);

  const { creatorLocale, initialResolvedLocale } =
    pageProps as AppPageProps;

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [route, setRoute] = useState<string>(router.pathname);
  const [configVariables, setConfigVariables] = useState<Config[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    setRoute(router.pathname);
  }, [router.pathname]);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch config variables
        const configs = await configService.list();
        setConfigVariables(configs);

        // Fetch user data
        try {
          const currentUser = await userService.getCurrentUser();
          setUser(currentUser);
        } catch {
          // User not authenticated, that's okay
          setUser(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(
      async () => await authService.refreshAccessToken(),
      2 * 60 * 1000, // 2 minutes
    );

    return () => clearInterval(interval);
  }, []);

  const [language, setLanguage] = useState<string>(
    () => initialResolvedLocale ?? LOCALES.ENGLISH.code,
  );

  useEffect(() => {
    const siteRow = configVariables.find(
      (c) => c.key === "general.defaultLocale",
    );
    const siteDefault = (
      siteRow?.value ??
      siteRow?.defaultValue ??
      LOCALES.ENGLISH.code
    ).toString();

    const resolved = i18nUtil.resolveDisplayLocale({
      cookieLang: getCookie("language")?.toString() ?? null,
      creatorLocale: creatorLocale ?? null,
      userLocale: user?.locale ?? null,
      siteDefaultLocale: siteDefault,
      acceptLanguageHeader: null,
      navigatorLanguage:
        typeof navigator !== "undefined" ? navigator.language : null,
    });

    moment.locale(resolved.split("-")[0]);
    if (resolved !== language) {
      setLanguage(resolved);
    }
  }, [configVariables, user, creatorLocale, initialResolvedLocale, language]);

  const selectedLocale = useMemo(
    () => i18nUtil.getLocaleByCode(language) ?? LOCALES.ENGLISH,
    [language],
  );

  const currentUseCase = useMemo(() => {
    const useCaseConfig = configVariables.find(
      (configVariable) => configVariable.key === "general.useCase",
    );
    return (useCaseConfig?.value ?? useCaseConfig?.defaultValue ?? "default")
      .toString()
      .trim()
      .toLowerCase();
  }, [configVariables]);

  const mergedMessages = useMemo(
    () => {
      const englishMessages = mergeMessagesForUseCase(
        LOCALES.ENGLISH.code,
        LOCALES.ENGLISH.messages,
        currentUseCase,
      );
      const localeMessages = mergeMessagesForUseCase(
        selectedLocale.code,
        selectedLocale.messages,
        currentUseCase,
      );
      return {
        ...englishMessages,
        ...localeMessages,
      };
    },
    [selectedLocale, currentUseCase],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-usecase", currentUseCase || "default");
  }, [currentUseCase]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>
      <IntlProvider
        messages={mergedMessages}
        locale={i18nUtil.normalizeSupportedUiLocale(language)}
        defaultLocale={LOCALES.ENGLISH.code}
      >
        <ThemeProvider>
          <ModalProvider>
            <ConfigContext.Provider
            value={useMemo(
              () => ({
                configVariables,
                refresh: async () => {
                  setConfigVariables(await configService.list());
                },
              }),
              [configVariables]
            )}
          >
            <UserContext.Provider
              value={useMemo(
                () => ({
                  user,
                  refreshUser: async () => {
                    const user = await userService.getCurrentUser();
                    setUser(user);
                    return user;
                  },
                }),
                [user]
              )}
            >
              {excludeDefaultLayoutRoutes.includes(route) ? (
                <Component {...pageProps} />
              ) : (
                <div className="flex flex-col min-h-screen">
                  <div className="flex-1">
                    <Header />
                    <main>
                      <Component {...pageProps} />
                    </main>
                  </div>
                  <Footer />
                </div>
              )}
              <ToastContainer toasts={toasts.map(t => ({ id: t.id, message: t.message, type: t.type, duration: t.duration, onClose: removeToast }))} onClose={removeToast} />
            </UserContext.Provider>
          </ConfigContext.Provider>
          </ModalProvider>
        </ThemeProvider>
      </IntlProvider>
    </>
  );
}

SwissDataShare.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  const pageProps = (appProps.pageProps ?? {}) as AppPageProps;

  let configs: Config[] | null = null;
  try {
    configs = await fetchPublicConfigList();
  } catch (e) {
    if (typeof window === "undefined") {
      console.error("[SwissDataShare.getInitialProps] config fetch failed:", e);
    }
  }

  let initialResolvedLocale: string;
  try {
    initialResolvedLocale = resolveAppInitialLocale(
      appContext.ctx,
      pageProps,
      configs,
    );
  } catch {
    initialResolvedLocale = LOCALES.ENGLISH.code;
  }

  return {
    ...appProps,
    pageProps: {
      ...pageProps,
      initialResolvedLocale,
    },
  };
};

export default SwissDataShare;
