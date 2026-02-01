"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Edit2, Save, X, Loader2, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
  _count: {
    recipes: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });
  const [errors, setErrors] = useState<{ name?: string; image?: string; submit?: string }>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || "",
        image: data.image || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setErrors({ submit: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!profile) return;
    setEditing(true);
    setFormData({
      name: profile.name || "",
      image: profile.image || "",
    });
    setErrors({});
    setSuccess(false);
  };

  const handleCancel = () => {
    if (!profile) return;
    setEditing(false);
    setFormData({
      name: profile.name || "",
      image: profile.image || "",
    });
    setErrors({});
    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors: { name?: string; image?: string } = {};

    if (formData.name && formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (formData.image && formData.image.length > 500) {
      newErrors.image = "Image URL must be less than 500 characters";
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      setSuccess(false);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim() || null,
          image: formData.image.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
      setSuccess(true);
      toast.success("Profile updated successfully");

      // Refresh session to get updated user data
      if (session) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setErrors({ submit: message });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your profile information and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={profile.image || undefined}
                    alt={profile.name || "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0) || profile.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <div className="absolute bottom-0 right-0 rounded-full bg-primary p-2 shadow-md">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              {!editing && (
                <h2 className="text-xl font-semibold mb-1">
                  {profile.name || "No name set"}
                </h2>
              )}
              <Badge
                variant={profile.role === "SUPER_ADMIN" ? "default" : "secondary"}
                className="mt-2"
              >
                {profile.role === "SUPER_ADMIN" ? "Super Admin" : "User"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details here
                </CardDescription>
              </div>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                Profile updated successfully!
              </div>
            )}

            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {errors.submit}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Display Name
              </label>
              {editing ? (
                <>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your display name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </>
              ) : (
                <div className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {profile.name || "No name set"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Profile Image URL
              </label>
              {editing ? (
                <>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className={errors.image ? "border-red-500" : ""}
                  />
                  {errors.image && (
                    <p className="text-sm text-red-600">{errors.image}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your profile image. Leave empty to remove
                    current image.
                  </p>
                </>
              ) : (
                <div className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {profile.image || "No image URL set"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                {profile.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. It&apos;s managed by your authentication
                provider.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your account activity and contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {profile._count.recipes}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Total Recipes
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {new Date(profile.createdAt).getFullYear()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Member Since
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {profile.role === "SUPER_ADMIN" ? "Admin" : "User"}
              </div>
              <div className="text-sm text-muted-foreground mt-2">Role</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
