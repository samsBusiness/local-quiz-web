"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

interface WhitelistEntry {
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "QM";
}

export default function QuizMastersPage() {
  const { user } = useAuth();
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "QM" as "SUPER_ADMIN" | "QM",
  });

  // Redirect if not super_admin
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/global", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status === 200) {
        setWhitelist(result.data.global.qmWhitelist);
      }
    } catch (error) {
      console.error("Failed to fetch whitelist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const updatedWhitelist = [...whitelist, formData];
      
      const res = await fetch("/api/global", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qmWhitelist: updatedWhitelist,
        }),
      });

      const result = await res.json();
      if (result.status === 200) {
        setWhitelist(updatedWhitelist);
        setShowAddModal(false);
        setFormData({ name: "", email: "", role: "QM" });
      }
    } catch (error) {
      console.error("Failed to add quiz master:", error);
    }
  };

  const handleDelete = async (emailToDelete: string) => {
    try {
      const token = localStorage.getItem("token");
      const updatedWhitelist = whitelist.filter(
        (entry) => entry.email !== emailToDelete
      );

      const res = await fetch("/api/global", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qmWhitelist: updatedWhitelist,
        }),
      });

      const result = await res.json();
      if (result.status === 200) {
        setWhitelist(updatedWhitelist);
      }
    } catch (error) {
      console.error("Failed to delete quiz master:", error);
    }
  };

  if (!user) return null;
  if (user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Masters</h1>
          <p className="text-muted-foreground">
            Manage quiz masters and super admins
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Quiz Master
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : whitelist.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-2" />
                    No quiz masters found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              whitelist.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.role === "SUPER_ADMIN" ? "default" : "secondary"
                      }
                    >
                      {entry.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.email)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Quiz Master</DialogTitle>
            <DialogDescription>
              Add a new quiz master or super admin to the whitelist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "SUPER_ADMIN" | "QM") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QM">Quiz Master</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
