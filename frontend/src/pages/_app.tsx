import { getCookie } from "cookies-next";
import moment from "moment";
import "moment/min/locales";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
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
import "../styles/globals.css";

const excludeDefaultLayoutRoutes = ["/admin/config/[category]"];

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Set global toast functions
  useEffect(() => {
    setGlobalToast({ success, error, warning, info });
  }, [success, error, warning, info]);

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

  // Get language from cookie or browser
  const language = useRef(
    getCookie("language")?.toString() ||
      (typeof window !== "undefined"
        ? navigator.language.split("-")[0]
        : "en"),
  );
  moment.locale(language.current);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>
      <IntlProvider
        messages={i18nUtil.getLocaleByCode(language.current)?.messages}
        locale={language.current}
        defaultLocale={LOCALES.ENGLISH.code}
      >
        <ThemeProvider>
          <ModalProvider>
            <ConfigContext.Provider
            value={{
              configVariables,
              refresh: async () => {
                setConfigVariables(await configService.list());
              },
            }}
          >
            <UserContext.Provider
              value={{
                user,
                refreshUser: async () => {
                  const user = await userService.getCurrentUser();
                  setUser(user);
                  return user;
                },
              }}
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

export default App;
