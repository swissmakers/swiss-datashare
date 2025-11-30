import {
  Anchor,
  Button,
  Center,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import Logo from "../../components/Logo";
import Meta from "../../components/Meta";

const Intro = () => {
  return (
    <>
      <Meta title="Intro" />
      <Container size="xs">
        <Stack>
          <Center>
            <Logo height={80} width={80} />
          </Center>
          <Center>
            <Title order={2}>Welcome to Swiss DataShare</Title>
          </Center>
          <Text>
            Swiss DataShare is actively maintained and developed by{" "}
            <Anchor
              target="_blank"
              href="https://github.com/swissmakers/swiss-datashare"
            >
              Swissmakers GmbH
            </Anchor>
            . We are committed to providing a reliable, secure, and feature-rich file sharing solution.
          </Text>
          <Text>Enough talked, have fun with Swiss DataShare!</Text>
          <Text mt="lg">How to you want to continue?</Text>
          <Stack>
            <Button href="/admin/config/general" component={Link}>
              Customize configuration
            </Button>
            <Button href="/" component={Link} variant="light">
              Explore Swiss DataShare
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Intro;
