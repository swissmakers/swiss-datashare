import Link from "next/link";
import Logo from "../../components/Logo";
import Meta from "../../components/Meta";
import { Container, Button } from "../../components/ui";

const Intro = () => {
  return (
    <>
      <Meta title="Intro" />
      <Container size="sm">
        <div className="flex flex-col items-center space-y-6 py-10">
          <Logo height={80} width={80} />
          <h2 className="text-3xl font-bold text-center text-text dark:text-text-dark">
            Welcome to Swiss DataShare
          </h2>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Swiss DataShare is actively maintained and developed by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/swissmakers/swiss-datashare"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Swissmakers GmbH
            </a>
            . We are committed to providing a reliable, secure, and feature-rich file sharing solution.
          </p>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Enough talked, have fun with Swiss DataShare!
          </p>
          <p className="text-center font-medium text-text dark:text-text-dark mt-6">
            How do you want to continue?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button as={Link} href="/admin/config/general" fullWidth>
              Customize configuration
            </Button>
            <Button as={Link} href="/" variant="outline" fullWidth>
              Explore Swiss DataShare
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Intro;
