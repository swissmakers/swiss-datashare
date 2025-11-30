import Link from "next/link";
import { FormattedMessage } from "react-intl";
import Meta from "../components/Meta";
import { Button, Container } from "../components/ui";

const ErrorNotFound = () => {
  return (
    <>
      <Meta title="Not found" />
      <Container>
        <div className="py-20 text-center">
          <div className="text-[120px] sm:text-[220px] font-black leading-none mb-5 text-gray-200 dark:text-gray-800">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text dark:text-text-dark mb-10">
            <FormattedMessage id="404.description" />
          </h1>
          <Button as={Link} href="/" variant="outline">
            <FormattedMessage id="404.button.home" />
          </Button>
        </div>
      </Container>
    </>
  );
};

export default ErrorNotFound;
