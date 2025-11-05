"use client";

import React from "react";
import { UserTable } from "./user-table";
import { userSchema, type User } from "./user-schema";
import usersData from "./users-data.json";
import { z } from "zod";

export default function UserManager() {
  // Parse and validate users data
  const users: User[] = z.array(userSchema).parse(usersData);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-6 py-4 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý người dùng, phân quyền và theo dõi hoạt động
              </p>
            </div>
            <UserTable data={users} />
          </div>
        </div>
      </div>
    </div>
  );
}
