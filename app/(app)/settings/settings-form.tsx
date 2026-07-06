"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building, User, Shield, CreditCard, Trash2, Upload } from "lucide-react";

interface OrgData { id: string; name: string; slug: string; plan: string; timezone: string; logo_path?: string; }
interface MemberData { org_id: string; user_id: string; role: string; joined_at: string; }

export function SettingsForm({ user, org, members, role }: { user: any; org: OrgData; members: MemberData[]; role: string }) {
  const [orgName, setOrgName] = useState(org.name);
  const [timezone, setTimezone] = useState(org.timezone);
  const [savingOrg, setSavingOrg] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [savingMember, setSavingMember] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const isAdmin = role === "admin";

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    const { error } = await supabase.from("orgs").update({ name: orgName, timezone }).eq("id", org.id);
    if (error) toast.error("Failed");
    else { toast.success("Organization updated"); router.refresh(); } setSavingOrg(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMember(true);

    try {
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, orgId: org.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to invite");
      } else {
        toast.success(data.message || `Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        router.refresh();
      }
    } catch {
      toast.error("Network error — could not send invite");
    }

    setSavingMember(false);
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await supabase.from("org_members").delete().eq("user_id", userId).eq("org_id", org.id);
    if (error) toast.error("Failed");
    else { toast.success("Member removed"); router.refresh(); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${org.id}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload logo");
        return;
      }

      const { error: updateError } = await supabase
        .from("orgs")
        .update({ logo_path: path })
        .eq("id", org.id);

      if (updateError) {
        toast.error("Failed to save logo path");
      } else {
        toast.success("Logo updated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to upload logo");
    }
    setUploadingLogo(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const sections = [
    {
      title: "Organization", icon: Building,
      content: (
        <div className="space-y-4">
          <div className="space-y-2"><Label>Organization Name</Label><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={!isAdmin} className="h-11 rounded-lg" /></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={org.slug} disabled className="h-11 rounded-lg text-muted-foreground" /></div>
          <div className="space-y-2"><Label>Timezone</Label><Input value={timezone} onChange={(e) => setTimezone(e.target.value)} disabled={!isAdmin} className="h-11 rounded-lg" /></div>
          {isAdmin && (
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                {org.logo_path && (
                  <span className="text-xs text-muted-foreground">Logo uploaded</span>
                )}
              </div>
            </div>
          )}
          {isAdmin && <Button onClick={handleSaveOrg} disabled={savingOrg} className="rounded-full h-10">{savingOrg ? "Saving..." : "Save Changes"}</Button>}
        </div>
      )
    },
    {
      title: "Team Members", icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary-muted text-primary text-xs font-semibold">{member.user_id.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-medium text-foreground">{member.user_id}</p><Badge variant="secondary" className="rounded-lg text-xs mt-0.5">{member.role}</Badge></div>
                </div>
                {isAdmin && member.user_id !== user.id && <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.user_id)} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>}
              </div>
            ))}
          </div>
          {isAdmin && (
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" required className="flex-1 h-11 rounded-lg" />
              <Select value={inviteRole} onValueChange={(v) => v && setInviteRole(v)}><SelectTrigger className="w-[110px] h-11 rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select>
              <Button type="submit" disabled={savingMember} className="rounded-full h-11">Invite</Button>
            </form>
          )}
        </div>
      )
    },
    {
      title: "Profile", icon: User,
      content: (
        <div className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input value={user.email} disabled className="h-11 rounded-lg text-muted-foreground" /></div>
          <div className="space-y-2"><Label>Role</Label><Input value={role} disabled className="h-11 rounded-lg text-muted-foreground" /></div>
          <div className="pt-2 border-t border-border">
            <form onSubmit={handleChangePassword} className="space-y-3">
              <Label>Change Password</Label>
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg"
                minLength={6}
                required
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-lg"
                minLength={6}
                required
              />
              <Button type="submit" disabled={savingPassword} className="rounded-full h-10">
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      )
    },
    {
      title: "Billing", icon: CreditCard,
      content: (
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/30 px-5 py-4"><p className="text-sm text-muted-foreground">Current Plan</p><p className="mt-1 text-lg font-bold text-foreground capitalize">{org.plan}</p></div>
          <Button variant="outline" className="w-full rounded-full h-11 border-border"><CreditCard className="mr-2 h-4 w-4" /> Upgrade Plan</Button>
          <p className="text-xs text-center text-muted-foreground">Payment processing coming soon</p>
        </div>
      )
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{section.title}</h3>
          </div>
          {section.content}
        </div>
      ))}
    </div>
  );
}
