import { Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { TbUser, TbSettings, TbDoorExit, TbLink, TbArrowLoopLeft } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
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
  mobileType?: "avatar" | "shares";
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("nav")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const authenticatedLinks: NavLink[] = [
    {
      link: "/upload",
      label: t("navbar.upload"),
    },
    {
      component: <NavbarShareMenu />,
      mobileType: "shares",
    },
    {
      component: <ActionAvatar />,
      mobileType: "avatar",
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

  const NavLink = ({ link, label, component, onClick, isMobile = false }: NavLink & { onClick?: () => void; isMobile?: boolean }) => {
    if (component) {
      if (isMobile) {
        // For mobile, render components inline with proper styling
        return <div className="px-3 py-2">{component}</div>;
      }
      return <div className="pl-2 py-3.5">{component}</div>;
    }

    if (!link) return null;

    const isActive = currentRoute === link;

    return (
      <Link
        href={link}
        onClick={onClick}
        className={clsx(
          "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        {label}
      </Link>
    );
  };

  // Mobile-friendly inline menu items
  const MobileActionAvatar = () => {
    const { user } = useUser();
    return (
      <div className="space-y-1">
        <Link
          href="/account"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <TbUser className="mr-3 h-5 w-5" />
          <FormattedMessage id="navbar.avatar.account" />
        </Link>
        {user?.isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <TbSettings className="mr-3 h-5 w-5" />
            <FormattedMessage id="navbar.avatar.admin" />
          </Link>
        )}
        <button
          onClick={async () => {
            setMobileMenuOpen(false);
            await authService.signOut();
          }}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
        >
          <TbDoorExit className="mr-3 h-5 w-5" />
          <FormattedMessage id="navbar.avatar.signout" />
        </button>
      </div>
    );
  };

  const MobileNavbarShareMenu = () => {
    return (
      <div className="space-y-1">
        <Link
          href="/account/shares"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <TbLink className="mr-3 h-5 w-5" />
          <FormattedMessage id="navbar.links.shares" />
        </Link>
        <Link
          href="/account/reverseShares"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <TbArrowLoopLeft className="mr-3 h-5 w-5" />
          <FormattedMessage id="navbar.links.reverse" />
        </Link>
      </div>
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

        {/* Mobile Navigation Backdrop */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition-opacity ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="sm:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-40 top-[60px]"
            onClick={() => setMobileMenuOpen(false)}
          />
        </Transition>
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-60px)] overflow-y-auto">
              {links.map((link, i) => {
                // Replace components with mobile-friendly inline versions
                if (link.component) {
                  if (link.mobileType === "avatar") {
                    return <MobileActionAvatar key={i} />;
                  }
                  if (link.mobileType === "shares") {
                    return <MobileNavbarShareMenu key={i} />;
                  }
                  return (
                    <div key={i} className="px-3 py-2">
                      {link.component}
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={i}
                    {...link}
                    isMobile={true}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                );
              })}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
};

export default Header;
