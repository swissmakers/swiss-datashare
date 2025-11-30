import {
  ColorScheme,
  ColorSchemeProvider,
  Container,
  MantineProvider,
  Stack,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { getCookie, setCookie } from "cookies-next";
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
import GlobalStyle from "../styles/global.style";
import globalStyle from "../styles/mantine.style";
import Config from "../types/config.type";
import { CurrentUser } from "../types/user.type";
import i18nUtil from "../utils/i18n.util";
import userPreferences from "../utils/userPreferences.util";
import Footer from "../components/footer/Footer";

const excludeDefaultLayoutRoutes = ["/admin/config/[category]"];

function App({ Component, pageProps }: AppProps) {
  const systemTheme = useColorScheme("light");
  const router = useRouter();

  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemTheme);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [route, setRoute] = useState<string>(router.pathname);
  const [configVariables, setConfigVariables] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const colorScheme =
      userPreferences.get("colorScheme") == "system"
        ? systemTheme
        : userPreferences.get("colorScheme");

    toggleColorScheme(colorScheme);
  }, [systemTheme]);

  const toggleColorScheme = (value: ColorScheme) => {
    setColorScheme(value ?? "light");
    setCookie("mantine-color-scheme", value ?? "light", {
      sameSite: "lax",
    });
  };

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
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme, ...globalStyle }}
        >
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <GlobalStyle />
            <Notifications />
            <ModalsProvider>
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
                    <>
                      <Stack
                        justify="space-between"
                        sx={{ minHeight: "100vh" }}
                      >
                        <div>
                          <Header />
                          <Container>
                            <Component {...pageProps} />
                          </Container>
                        </div>
                        <Footer />
                      </Stack>
                    </>
                  )}
                </UserContext.Provider>
              </ConfigContext.Provider>
            </ModalsProvider>
          </ColorSchemeProvider>
        </MantineProvider>
      </IntlProvider>
    </>
  );
}


export default App;
