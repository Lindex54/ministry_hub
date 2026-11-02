"use client";

import { useMemo, useState } from "react";
import { Ellipsis, KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsers } from "../useUsers";
import { CreateUserDialog, EditUserDialog, TemporaryPasswordDialog } from "./UserDialogs";

export function UsersPage() {
  const { users, roles, error, createUser, updateUser, resetPassword, deleteUser } = useUsers();
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const columns = useMemo(() => [
    {
      id: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{row.original.username}</p>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "default" : "outline"}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last login",
      cell: ({ row }) => row.original.lastLoginAt
        ? new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.lastLoginAt))
        : "Never",
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}><Ellipsis /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Manage user</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <EditUserDialog
                user={user}
                roles={roles}
                onSave={updateUser}
                trigger={<DropdownMenuItem onSelect={(event) => event.preventDefault()}><Pencil />Edit</DropdownMenuItem>}
              />
              <DropdownMenuItem onSelect={() => {
                resetPassword(user.id)
                  .then((result) => setTemporaryPassword({ userName: user.name, password: result.temporaryPassword }))
                  .catch((requestError) => toast.error(requestError.message ?? "Could not reset this password."));
              }}>
                <KeyRound />Reset password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  deleteUser(user.id)
                    .then(() => toast.success(`${user.name} removed.`))
                    .catch((requestError) => toast.error(requestError.message ?? "Could not remove this user."));
                }}
              >
                <Trash2 />Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [roles, updateUser, resetPassword, deleteUser]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Users & Roles"
        actions={<CreateUserDialog roles={roles} onCreate={createUser} onCreated={(result) => setTemporaryPassword({ userName: result.user.name, password: result.temporaryPassword })} />}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription>{error.message ?? "Check that the backend server is running."}</AlertDescription>
        </Alert>
      ) : (
        <DataTable columns={columns} data={users} searchPlaceholder="Search by name, username, email..." enableSelection={false} />
      )}
      {temporaryPassword ? (
        <TemporaryPasswordDialog
          open={Boolean(temporaryPassword)}
          onOpenChange={(open) => { if (!open) setTemporaryPassword(null); }}
          userName={temporaryPassword.userName}
          password={temporaryPassword.password}
        />
      ) : null}
    </div>
  );
}
