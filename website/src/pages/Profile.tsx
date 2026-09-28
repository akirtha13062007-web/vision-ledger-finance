import { useEffect, useState } from "react";
import {
  Camera,
  Check,
  Edit3,
  Mail,
  MapPin,
  Shield,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [profile, setProfile] = useState({
    name: user?.name ?? "User",
    email: user?.email ?? "",
    location: "",
    occupation: "",
  });

  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    const nextProfile = {
      name: user?.name ?? "User",
      email: user?.email ?? "",
      location: user?.location ?? "",
      occupation: user?.occupation ?? "",
    };

    setProfile(nextProfile);
    setFormData(nextProfile);
  }, [user]);

  const showMessage = (text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  };

  const openEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    if (!user || !token) {
      setSaveError("You must be logged in to update your profile.");
      return;
    }

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setSaveError("Name cannot be empty.");
      return;
    }

    try {
      setSaveError("");
      const response = await fetch("http://localhost:5000/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          location: formData.location.trim() || null,
          occupation: formData.occupation.trim() || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Unable to save profile.";

        try {
          const errorResult = await response.json();
          errorMessage = errorResult?.message || errorMessage;
        } catch {
          errorMessage = `Profile update failed (${response.status}). Please try again.`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      const nextLocation = result?.data?.location ?? (formData.location.trim() || null);
      const nextOccupation = result?.data?.occupation ?? (formData.occupation.trim() || null);

      const updatedUser = {
        ...user,
        name: result?.data?.name || trimmedName,
        email: result?.data?.email || user.email,
        location: nextLocation,
        occupation: nextOccupation,
      };

      updateUser(updatedUser);

      setProfile({
        ...formData,
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location ?? "",
        occupation: updatedUser.occupation ?? "",
      });
      setFormData({
        ...formData,
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location ?? "",
        occupation: updatedUser.occupation ?? "",
      });
      setIsEditing(false);
      showMessage("Profile updated successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save profile.";
      setSaveError(message);
    }
  };

  const cancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal information and account details
          </p>
        </div>

        {/* Profile hero */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-600 shadow-md dark:border-slate-900 dark:bg-emerald-500/10 dark:text-emerald-400">
                    AK
                  </div>

                  <button
                    onClick={() => showMessage("Profile photo upload coming soon")}
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 dark:border-slate-900"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {profile.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {profile.occupation}
                  </p>
                </div>
              </div>

              <button
                onClick={openEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Personal information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your basic account information
              </p>
            </div>

            <div className="space-y-5">
              <InfoRow
                icon={User}
                label="Full Name"
                value={profile.name}
              />

              <InfoRow
                icon={Mail}
                label="Email Address"
                value={profile.email}
              />

              <InfoRow
                icon={MapPin}
                label="Location"
                value={profile.location || "Not provided"}
              />

              <InfoRow
                icon={Shield}
                label="Occupation"
                value={profile.occupation}
              />
            </div>
          </div>

          {/* Account overview */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Account Overview
              </h3>

              <div className="mt-5 space-y-4">
                <StatRow label="Member since" value="January 2026" />
                <StatRow label="Transactions" value="128" />
                <StatRow label="Budgets created" value="6" />
                <StatRow label="Reports generated" value="12" />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Shield size={19} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Your data is protected
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Your financial information is private and will be securely
                    stored when the backend is connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {isEditing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={cancelEdit}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Update your personal information
                  </p>
                </div>

                <button
                  onClick={cancelEdit}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                />

                <InputField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) =>
                    setFormData({ ...formData, email: value })
                  }
                  readOnly={true}
                />

                <InputField
                  label="Location"
                  value={formData.location}
                  onChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                />

                {saveError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {saveError}
                  </div>
                )}

                <InputField
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(value) =>
                    setFormData({ ...formData, occupation: value })
                  }
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <Check size={17} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {message && (
          <div className="fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-900">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:cursor-not-allowed disabled:text-slate-500"
      />
    </div>
  );
}