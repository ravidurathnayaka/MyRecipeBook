import { requireAdmin } from "@/lib/auth-helpers";
import prisma from "@/lib/db";
import { Shield, Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  await requireAdmin();

  // Single transaction for faster loading - all counts in one round trip
  const [totalUsers, totalRecipes, pendingRecipes, approvedRecipes, rejectedRecipes, superAdminCount] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.recipe.count({ where: { status: "PENDING" } }),
      prisma.recipe.count({ where: { status: "APPROVED" } }),
      prisma.recipe.count({ where: { status: "REJECTED" } }),
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: `${superAdminCount} super admins`,
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
    },
    {
      title: "Total Recipes",
      value: totalRecipes,
      description: "All recipes in the system",
      icon: FileText,
      href: "/admin/recipes",
      color: "text-green-600",
    },
    {
      title: "Pending Recipes",
      value: pendingRecipes,
      description: "Awaiting moderation",
      icon: Clock,
      href: "/admin/recipes?status=PENDING",
      color: "text-yellow-600",
    },
    {
      title: "Approved Recipes",
      value: approvedRecipes,
      description: "Published recipes",
      icon: CheckCircle,
      href: "/admin/recipes?status=APPROVED",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage users, recipes, and system settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span className="font-medium">Manage Users</span>
              </div>
            </Link>
            <Link
              href="/admin/recipes"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Moderate Recipes</span>
              </div>
            </Link>
            <Link
              href="/admin/recipes?status=PENDING"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Review Pending</span>
              </div>
              {pendingRecipes > 0 && (
                <Badge variant="secondary">{pendingRecipes}</Badge>
              )}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-semibold">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Super Admins
              </span>
              <span className="font-semibold">{superAdminCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Recipes
              </span>
              <span className="font-semibold">{totalRecipes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Approved</span>
              <Badge variant="default" className="bg-emerald-600">
                {approvedRecipes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="secondary">{pendingRecipes}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rejected</span>
              <Badge variant="destructive">{rejectedRecipes}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
