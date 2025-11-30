import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment } from "react";
import { TbArrowLoopLeft, TbLink } from "react-icons/tb";
import { LinkIcon } from "@heroicons/react/24/outline";
import { FormattedMessage } from "react-intl";
import clsx from "clsx";

const NavbarShareMenu = () => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors">
        <LinkIcon className="h-6 w-6" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/shares"
                  className={clsx(
                    "flex items-center px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <TbLink className="mr-3 h-4 w-4" />
                  <FormattedMessage id="navbar.links.shares" />
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/reverseShares"
                  className={clsx(
                    "flex items-center px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <TbArrowLoopLeft className="mr-3 h-4 w-4" />
                  <FormattedMessage id="navbar.links.reverse" />
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NavbarShareMenu;
