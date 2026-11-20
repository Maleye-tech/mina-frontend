import { qs, request } from "../lib/api";
import { mapRole } from "./authService";
import type { AdminUser, Paginated } from "../types/api";
import type { FlatPaginated } from "../types/library";
import type { User } from "../types";

export type ManagedRole = "ambassador" | "professional";
export type EditableRole = "student" | "ambassador" | "professional" | "admin";

export type UserListParams = {
  search?: string;
  role?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
};

function mapAdminUser(user: AdminUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRole(user.role),
    roleLabel: user.role_label,
    status: user.is_active && user.email_verified ? "active" : "pending",
    emailVerified: user.email_verified,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}

export const usersService = {
  async list(params: UserListParams = {}): Promise<Paginated<User>> {
    const res = await request<FlatPaginated<AdminUser>>(
      `/v1/users${qs({
        search: params.search,
        role: params.role,
        is_active: params.is_active === undefined ? undefined : String(params.is_active),
        per_page: params.per_page,
        page: params.page,
      })}`,
    );
    return {
      data: res.data.map(mapAdminUser),
      links: { first: null, last: null, prev: res.prev_page_url, next: res.next_page_url },
      meta: {
        current_page: res.current_page,
        last_page: res.last_page,
        per_page: res.per_page,
        total: res.total,
      },
    };
  },

  async get(id: number): Promise<User> {
    const res = await request<{ user: AdminUser }>(`/v1/users/${id}`);
    return mapAdminUser(res.user);
  },

  async create(input: {
    name: string;
    email: string;
    role: ManagedRole;
  }): Promise<{ message: string; user: User }> {
    const res = await request<{ message: string; user: AdminUser }>("/v1/users", {
      method: "POST",
      body: input,
    });
    return { message: res.message, user: mapAdminUser(res.user) };
  },

  async update(
    id: number,
    input: {
      name?: string;
      email?: string;
      role?: EditableRole;
      is_active?: boolean;
    },
  ): Promise<{ message: string; user: User }> {
    const res = await request<{ message: string; user: AdminUser }>(`/v1/users/${id}`, {
      method: "PATCH",
      body: input,
    });
    return { message: res.message, user: mapAdminUser(res.user) };
  },

  async remove(id: number): Promise<string> {
    const res = await request<{ message: string }>(`/v1/users/${id}`, { method: "DELETE" });
    return res.message;
  },
};

export function frontRoleToApiRole(role: User["role"]): EditableRole {
  return role === "super_admin" ? "admin" : (role as EditableRole);
}
