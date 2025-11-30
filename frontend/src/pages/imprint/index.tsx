import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import { FormattedMessage } from "react-intl";
import useConfig from "../../hooks/config.hook";
import Markdown from "markdown-to-jsx";
import { Container } from "../../components/ui";
import { useTheme } from "../../contexts/ThemeContext";

const Imprint = () => {
  const t = useTranslate();
  const { resolvedTheme } = useTheme();
  const config = useConfig();
  
  return (
    <>
      <Meta title={t("imprint.title")} />
      <Container>
        <div className="py-10">
          <h1 className="text-4xl font-bold mb-8 text-text dark:text-text-dark">
            <FormattedMessage id="imprint.title" />
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <Markdown
              options={{
                forceBlock: true,
                overrides: {
                  pre: {
                    props: {
                      className: resolvedTheme === "dark"
                        ? "bg-gray-800 p-3 rounded-lg"
                        : "bg-gray-100 p-3 rounded-lg",
                      style: {
                        whiteSpace: "pre-wrap",
                      },
                    },
                  },
                  table: {
                    props: {
                      className: "md",
                    },
                  },
                  a: {
                    props: {
                      target: "_blank",
                      rel: "noreferrer",
                      className: "text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300",
                    },
                  },
                },
              }}
            >
              {config.get("legal.imprintText")}
            </Markdown>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Imprint;
