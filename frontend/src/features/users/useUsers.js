"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    return Promise.all([api("/users"), api("/roles")])
      .then(([userRows, roleRows]) => { setUsers(userRows); setRoles(roleRows); setError(null); })
      .catch((requestError) => setError(requestError))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return {
    users,
    roles,
    loading,
    error,
    createUser: (values) => api.post("/users", values).then((result) => { reload(); return result; }),
    updateUser: (id, values) => api.patch(`/users/${id}`, values).then((result) => { reload(); return result; }),
    resetPassword: (id) => api.post(`/users/${id}/reset-password`, {}).then((result) => { reload(); return result; }),
    deleteUser: (id) => api.delete(`/users/${id}`).then(() => reload()),
  };
}
