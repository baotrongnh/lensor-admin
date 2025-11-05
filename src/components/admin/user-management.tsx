"use client";

import { useState } from "react";
import { UserTable } from "./user-table";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
  lastLogin: string;
  createdAt: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@lensor.vn",
    fullName: "Nguyễn Văn Admin",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    username: "moderator1",
    email: "mod1@lensor.vn",
    fullName: "Trần Thị Moderator",
    role: "Moderator",
    status: "active",
    lastLogin: "2024-01-15 13:45",
    createdAt: "2024-01-05",
  },
  {
    id: 3,
    username: "user001",
    email: "user001@lensor.vn",
    fullName: "Lê Văn User",
    role: "User",
    status: "active",
    lastLogin: "2024-01-15 12:20",
    createdAt: "2024-01-10",
  },
  {
    id: 4,
    username: "user002",
    email: "user002@lensor.vn",
    fullName: "Phạm Thị User",
    role: "User",
    status: "inactive",
    lastLogin: "2024-01-10 09:15",
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    username: "user003",
    email: "user003@lensor.vn",
    fullName: "Hoàng Văn User",
    role: "User",
    status: "active",
    lastLogin: "2024-01-15 11:30",
    createdAt: "2024-01-14",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
    // Implement edit functionality
  };

  const handleDelete = (user: User) => {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const handleAdd = () => {
    console.log("Add new user");
    // Implement add functionality
  };

  const handleView = (user: User) => {
    console.log("View user:", user);
    // Implement view functionality
  };

  return (
    <div className="p-6">
      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onView={handleView}
      />
    </div>
  );
}
