import { Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import Logo from "../Logo";
import ActionAvatar from "./ActionAvatar";
import NavbarShareMenu from "./NavbarShareMenu";
import clsx from "clsx";

const HEADER_HEIGHT = 60;

type NavLink = {
  link?: string;
  label?: string;
  component?: ReactNode;
  action?: () => Promise<void>;
};

const Header = () => {
  const { user } = useUser();
  const router = useRouter();
  const config = useConfig();
  const t = useTranslate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("");

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname]);

  const authenticatedLinks: NavLink[] = [
    {
      link: "/upload",
      label: t("navbar.upload"),
    },
    {
      component: <NavbarShareMenu />,
    },
    {
      component: <ActionAvatar />,
    },
  ];

  let unauthenticatedLinks: NavLink[] = [
    {
      link: "/auth/signIn",
      label: t("navbar.signin"),
    },
  ];

  if (config.get("share.allowUnauthenticatedShares")) {
    unauthenticatedLinks.unshift({
      link: "/upload",
      label: t("navbar.upload"),
    });
  }

  if (config.get("general.showHomePage"))
    unauthenticatedLinks.unshift({
      link: "/",
      label: t("navbar.home"),
    });

  if (config.get("share.allowRegistration"))
    unauthenticatedLinks.push({
      link: "/auth/signUp",
      label: t("navbar.signup"),
    });

  const links = user ? authenticatedLinks : unauthenticatedLinks;

  const NavLink = ({ link, label, component, onClick }: NavLink & { onClick?: () => void }) => {
    if (component) {
      return <div className="pl-2 py-3.5">{component}</div>;
    }

    if (!link) return null;

    const isActive = currentRoute === link;

    return (
      <Link
        href={link}
        onClick={onClick}
        className={clsx(
          "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="relative z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mb-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: `${HEADER_HEIGHT}px` }}>
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="flex items-center space-x-2">
            <Logo height={35} width={35} />
            <span className="text-lg font-semibold text-text dark:text-text-dark">
              {config.get("general.appName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-1">
            {links.map((link, i) => (
              <NavLink key={i} {...link} />
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link, i) => (
                <NavLink
                  key={i}
                  {...link}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
};

export default Header;
