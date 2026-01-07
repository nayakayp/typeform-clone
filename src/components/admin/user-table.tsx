"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Shield, ShieldOff, UserCog } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  currentUserId: string;
  isSuper: boolean;
}

export function UserTable({ users, currentUserId, isSuper }: UserTableProps) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "unsuspend" | "promote" | "demote" | null>(null);

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Record<string, string> }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated successfully");
      setSelectedUser(null);
      setActionType(null);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  const handleAction = () => {
    if (!selectedUser || !actionType) return;

    const data: Record<string, string> = {};
    switch (actionType) {
      case "suspend":
        data.status = "suspended";
        break;
      case "unsuspend":
        data.status = "active";
        break;
      case "promote":
        data.role = "admin";
        break;
      case "demote":
        data.role = "user";
        break;
    }

    updateUserMutation.mutate({ userId: selectedUser.id, data });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "outline" : "destructive";
  };

  const getActionDialogContent = () => {
    if (!selectedUser || !actionType) return { title: "", description: "" };

    switch (actionType) {
      case "suspend":
        return {
          title: "Suspend User",
          description: `Are you sure you want to suspend ${selectedUser.name || selectedUser.email}? They will not be able to access the platform.`,
        };
      case "unsuspend":
        return {
          title: "Unsuspend User",
          description: `Are you sure you want to unsuspend ${selectedUser.name || selectedUser.email}? They will regain access to the platform.`,
        };
      case "promote":
        return {
          title: "Promote to Admin",
          description: `Are you sure you want to promote ${selectedUser.name || selectedUser.email} to admin? They will have access to the admin panel.`,
        };
      case "demote":
        return {
          title: "Demote to User",
          description: `Are you sure you want to demote ${selectedUser.name || selectedUser.email} to regular user? They will lose admin access.`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const dialogContent = getActionDialogContent();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || "No name"}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {user.id !== currentUserId && user.role !== "super_admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("suspend");
                          }}
                        >
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("unsuspend");
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Unsuspend
                        </DropdownMenuItem>
                      )}
                      {isSuper && (
                        <>
                          <DropdownMenuSeparator />
                          {user.role === "user" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType("promote");
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType("demote");
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Demote to User
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!selectedUser && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
