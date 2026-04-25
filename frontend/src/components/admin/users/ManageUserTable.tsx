import { TbCheck, TbEdit, TbTrash } from "react-icons/tb";
import User from "../../../types/user.type";
import showUpdateUserModal from "./showUpdateUserModal";
import { FormattedMessage } from "react-intl";
import { Table, Badge } from "../../../components/ui";
import { useModals } from "../../../contexts/ModalContext";

const ManageUserTable = ({
  users,
  getUsers,
  deleteUser,
  isLoading,
  showBillingStatus,
}: {
  users: User[];
  getUsers: () => void;
  deleteUser: (user: User) => void;
  isLoading: boolean;
  showBillingStatus: boolean;
}) => {
  const modals = useModals();

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell header>
              <FormattedMessage id="admin.users.table.username" />
            </Table.Cell>
            <Table.Cell header>
              <FormattedMessage id="admin.users.table.email" />
            </Table.Cell>
            {showBillingStatus && (
              <Table.Cell header>
                <FormattedMessage id="admin.users.table.subscription" />
              </Table.Cell>
            )}
            <Table.Cell header>
              <FormattedMessage id="admin.users.table.admin" />
            </Table.Cell>
            <Table.Cell header>{null}</Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading
            ? skeletonRows
            : users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      {user.username}{" "}
                      {user.isLdap && (
                        <Badge variant="secondary">LDAP</Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  {showBillingStatus && (
                    <Table.Cell>
                      {user.billingExempt ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          <FormattedMessage id="admin.users.table.subscription.exempt" />
                        </span>
                      ) : user.billingCompliant ? (
                        <span className="text-green-600 dark:text-green-400">
                          <FormattedMessage
                            id="admin.users.table.subscription.valid"
                          />
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">
                          <FormattedMessage
                            id="admin.users.table.subscription.invalid"
                          />
                        </span>
                      )}
                      {user.billingSubscriptionStatus && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.billingSubscriptionStatus}
                        </p>
                      )}
                    </Table.Cell>
                  )}
                  <Table.Cell>
                    {user.isAdmin && <TbCheck className="text-green-600 dark:text-green-400" size={18} />}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          showUpdateUserModal(modals, user, getUsers)
                        }
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        aria-label="Edit user"
                      >
                        <TbEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete user"
                      >
                        <TbTrash size={18} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
        </Table.Body>
      </Table>
    </div>
  );
};

const skeletonRows = [...Array(10)].map((v, i) => (
  <Table.Row key={i}>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-6" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </Table.Cell>
  </Table.Row>
));

export default ManageUserTable;
