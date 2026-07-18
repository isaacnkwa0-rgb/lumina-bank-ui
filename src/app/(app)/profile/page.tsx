"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, Shield, ChevronRight,
  LogOut, Lock, Smartphone, HelpCircle, BadgeCheck,
  Star, type LucideIcon, FileCheck, Edit3, X, MapPin,
  Calendar, Globe, Briefcase, Trash2, Monitor, Tablet,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { kycApi, usersApi, type Device } from "@/lib/api";

const NOTIF_KEY = "lumina_notif_settings";
function loadNotifSettings() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "null"); } catch { return null; }
}

function GenderAvatarLarge({ gender }: { gender?: string }) {
  if (gender === "MALE") return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4.5" fill="white" />
      <path d="M3.5 22c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5" fill="white" />
    </svg>
  );
  if (gender === "FEMALE") return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4.5" fill="white" />
      <path d="M8 4.5C8 2.5 9.8 1 12 1s4 1.5 4 3.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M4.5 22c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" fill="white" />
    </svg>
  );
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4.5" fill="white" />
      <path d="M3.5 22c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5" fill="white" />
    </svg>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "MOBILE") return <Smartphone size={15} className="text-[#DB0011]" />;
  if (type === "TABLET") return <Tablet size={15} className="text-amber-600" />;
  return <Monitor size={15} className="text-blue-600" />;
}

function IconCell({ icon: Icon, bg, color }: { icon: LucideIcon; bg: string; color: string }) {
  return (
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={17} className={color} />
    </div>
  );
}

function MenuRow({ icon, bg, color, label, badge, onClick }: {
  icon: LucideIcon; bg: string; color: string; label: string; badge?: string; onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors"
    >
      <IconCell icon={icon} bg={bg} color={color} />
      <span className="flex-1 text-sm text-[#333333] text-left">{label}</span>
      {badge && <span className="text-xs text-[#767676] bg-[#F0F0F0] px-2 py-0.5 rounded-full mr-1">{badge}</span>}
      <ChevronRight size={16} className="text-[#C0C0C0] flex-shrink-0" />
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${checked ? "bg-[#DB0011]" : "bg-[#D0D0D0]"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-[#E8E8E8] shadow-sm overflow-hidden mx-4 ${className}`}>{children}</div>;
}
function CardHeader({ label }: { label: string }) {
  return <div className="px-4 pt-4 pb-2"><p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">{label}</p></div>;
}
function Divider() { return <div className="h-px bg-[#F0F0F0] mx-4" />; }

function InfoRow({ icon: Icon, label, value, onEdit }: {
  icon: LucideIcon; label: string; value: string; onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-[#F8F8F8] border border-[#EEEEEE] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#767676]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-[#AAAAAA] uppercase tracking-wide">{label}</p>
        <p className="text-sm text-[#333333] font-medium mt-0.5 truncate">{value}</p>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="text-[#DB0011] hover:text-[#900] transition-colors p-1">
          <Edit3 size={13} />
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [notifSettings, setNotifSettings] = useState({ transactions: true, security: true, marketing: false, statements: true });
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);

  // Edit form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [dob, setDob]             = useState("");
  const [nationality, setNationality] = useState("");
  const [occupation, setOccupation]   = useState("");
  const [street, setStreet]       = useState("");
  const [city, setCity]           = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry]     = useState("");

  function populateForm() {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setDob(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");
    setNationality(user.nationality ?? "");
    const addr = (user as { address?: { street?: string; city?: string; postalCode?: string; country?: string } | null }).address;
    setStreet(addr?.street ?? "");
    setCity(addr?.city ?? "");
    setPostalCode(addr?.postalCode ?? "");
    setCountry(addr?.country ?? "");
    const prof = (user as { profile?: { occupation?: string } | null }).profile;
    setOccupation(prof?.occupation ?? "");
  }

  useEffect(() => {
    const saved = loadNotifSettings();
    if (saved) setNotifSettings((p) => ({ ...p, ...saved }));
    kycApi.status().then((r) => setKycStatus(r.data.data.status)).catch(() => {});
    usersApi.getDevices().then((r) => setDevices(r.data.data)).catch(() => {});
    usersApi.getNotifPrefs().then((r) => {
      const prefs = r.data.data as Record<string, boolean>;
      setNotifSettings((p) => ({ ...p, ...prefs }));
    }).catch(() => {});
  }, []);

  function openEdit() { populateForm(); setSaveError(""); setSaveSuccess(false); setShowEdit(true); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(""); setSaving(true);
    try {
      await usersApi.updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        dateOfBirth: dob || undefined,
        nationality: nationality || undefined,
        occupation: occupation || undefined,
        address: { street, city, postalCode, country },
      });
      setSaveSuccess(true);
      setTimeout(() => { setShowEdit(false); setSaveSuccess(false); }, 1200);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDevice(id: string) {
    setRemovingDevice(id);
    try {
      await usersApi.removeDevice(id);
      setDevices((d) => d.filter((x) => x.id !== id));
    } catch {}
    setRemovingDevice(null);
  }

  function toggleNotif(key: keyof typeof notifSettings) {
    const next = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(next);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch {}
    usersApi.updateNotifPrefs(next).catch(() => {});
  }

  const addr = (user as { address?: { street?: string; city?: string; postalCode?: string; country?: string } | null } | null)?.address;
  const addressStr = addr ? [addr.street, addr.city, addr.postalCode, addr.country].filter(Boolean).join(", ") : "Not set";

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-8">
      <div className="bg-gradient-to-br from-[#DB0011] via-[#C4000F] to-[#8B000A] px-4 pt-8 pb-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-24 w-24 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center shadow-lg">
            <GenderAvatarLarge gender={user?.gender} />
          </div>
          {user && (
            <div className="text-center">
              <p className="text-white text-xl font-bold tracking-tight">{user.firstName} {user.lastName}</p>
              <p className="text-white/70 text-sm mt-0.5">{user.email}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 bg-white/15 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <Star size={10} className="fill-white" />
              {(user as { tier?: string } | null)?.tier ?? "Standard"}
            </span>
            {kycStatus === "VERIFIED" && (
              <span className="flex items-center gap-1 bg-green-500/20 border border-green-300/30 text-green-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                <BadgeCheck size={11} /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="-mt-10 space-y-3">
        {/* Personal info */}
        <Card>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">Personal information</p>
            <button onClick={openEdit} className="flex items-center gap-1 text-xs font-semibold text-[#DB0011] hover:text-[#900] transition-colors">
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="px-4 pb-4 space-y-3.5">
            <InfoRow icon={User}    label="Full name"    value={user ? `${user.firstName} ${user.lastName}` : "—"} />
            <Divider />
            <InfoRow icon={Mail}    label="Email address" value={user?.email ?? "—"} />
            <Divider />
            <InfoRow icon={Phone}   label="Phone number"  value={(user as { phone?: string } | null)?.phone ?? "Not set"} />
            <Divider />
            <InfoRow icon={Calendar} label="Date of birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-GB") : "Not set"} />
            <Divider />
            <InfoRow icon={Globe}   label="Nationality"   value={user?.nationality ?? "Not set"} />
            <Divider />
            <InfoRow icon={MapPin}  label="Address"       value={addressStr} />
            <Divider />
            <InfoRow icon={Briefcase} label="Occupation"  value={(user as { profile?: { occupation?: string } | null } | null)?.profile?.occupation ?? "Not set"} />
          </div>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader label="Security" />
          <MenuRow icon={Lock}       bg="bg-red-100"   color="text-[#DB0011]"   label="Change password"
            onClick={() => router.push("/profile/change-password")} />
          <Divider />
          <MenuRow icon={Shield}     bg="bg-amber-100" color="text-amber-600"   label="Two-factor authentication"
            badge={(user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ? "On" : "Off"}
            onClick={() => router.push("/profile/2fa")} />
          <Divider />
          <MenuRow icon={FileCheck}  bg="bg-green-100" color="text-green-600"   label="Identity verification (KYC)"
            badge={kycStatus === "VERIFIED" ? "Verified" : kycStatus === "PENDING" ? "Pending" : "Required"}
            onClick={() => router.push("/kyc")} />
        </Card>

        {/* Trusted devices */}
        <Card>
          <CardHeader label="Trusted devices" />
          {devices.length === 0 ? (
            <div className="px-4 pb-4">
              <p className="text-xs text-[#AAAAAA]">No trusted devices recorded yet.</p>
            </div>
          ) : (
            devices.map((d, i) => (
              <div key={d.id}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    <DeviceIcon type={d.deviceType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#333] truncate">{d.deviceName || d.deviceType}</p>
                    <p className="text-[11px] text-[#AAAAAA]">
                      {[d.os, d.browser].filter(Boolean).join(" · ")}
                      {d.ipAddress && ` · ${d.ipAddress}`}
                    </p>
                    <p className="text-[11px] text-[#AAAAAA]">Last seen {new Date(d.lastSeenAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(d.id)}
                    disabled={removingDevice === d.id}
                    className="p-1.5 text-[#BBBBBB] hover:text-[#DB0011] transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {i < devices.length - 1 && <Divider />}
              </div>
            ))
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader label="Notifications" />
          <div className="px-4 pb-3 space-y-0">
            {([
              { key: "transactions", label: "Transaction alerts",   hint: "Debits and credits on your accounts" },
              { key: "security",     label: "Security alerts",      hint: "Sign-ins and password changes" },
              { key: "marketing",    label: "Offers & promotions",  hint: "Deals and product updates" },
              { key: "statements",   label: "Monthly statements",   hint: "Your end-of-month summary" },
            ] as { key: keyof typeof notifSettings; label: string; hint: string }[]).map(({ key, label, hint }, i, arr) => (
              <div key={key}>
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-[#333333]">{label}</p>
                    <p className="text-xs text-[#AAAAAA] mt-0.5">{hint}</p>
                  </div>
                  <Toggle checked={notifSettings[key]} onChange={() => toggleNotif(key)} />
                </div>
                {i < arr.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader label="Support" />
          <MenuRow icon={HelpCircle} bg="bg-[#F0F0F0]" color="text-[#767676]" label="Help & support"
            onClick={() => router.push("/support")} />
        </Card>

        {/* Sign out */}
        <div className="mx-4">
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-[#DB0011] text-[#DB0011] text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <p className="text-center text-[10px] text-[#CCCCCC] pt-1">Lumina Bank · v1.0.0 · © 2026</p>
      </div>

      {/* Edit Profile Sheet */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="text-base font-bold text-[#333]">Edit profile</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-[#999] hover:text-[#333]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto px-5 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "First name", val: firstName, set: setFirstName },
                  { label: "Last name",  val: lastName,  set: setLastName  },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
                    <input value={val} onChange={(e) => set(e.target.value)} type="text"
                      className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]" />
                  </div>
                ))}
              </div>

              {[
                { label: "Phone number", val: phone,       set: setPhone,       type: "tel",  placeholder: "+44 7700 900000" },
                { label: "Occupation",   val: occupation,  set: setOccupation,  type: "text", placeholder: "e.g. Software Engineer" },
                { label: "Nationality (2-letter code)", val: nationality, set: setNationality, type: "text", placeholder: "GB" },
              ].map(({ label, val, set, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
                  <input value={val} onChange={(e) => set(e.target.value)} type={type} placeholder={placeholder}
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">Date of birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]" />
              </div>

              <p className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest pt-1">Home address</p>
              {[
                { label: "Street address", val: street,     set: setStreet,     placeholder: "123 High Street" },
                { label: "City / Town",    val: city,       set: setCity,       placeholder: "London" },
                { label: "Postcode",       val: postalCode, set: setPostalCode, placeholder: "SW1A 1AA" },
                { label: "Country",        val: country,    set: setCountry,    placeholder: "United Kingdom" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-[#555] uppercase tracking-wide mb-1.5">{label}</label>
                  <input value={val} onChange={(e) => set(e.target.value)} type="text" placeholder={placeholder}
                    className="w-full px-3 py-2.5 border-2 border-[#E3E3E3] rounded-xl text-sm focus:outline-none focus:border-[#DB0011]" />
                </div>
              ))}

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-[#DB0011]">{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-green-700 font-semibold">✓ Profile updated successfully</p>
                </div>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-3.5 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
