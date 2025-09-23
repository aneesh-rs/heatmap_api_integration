import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { createInvitation } from "../services/invitations";
import { User } from "../types";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FaCircleExclamation } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface MemberItemProps extends User {
  isActive?: boolean;
  onRoleChange?: (newRole: string) => void;
}

const MemberItem: React.FC<MemberItemProps> = ({
  role,
  name,
  isActive = false,
  onRoleChange,
}) => {
  return (
    <div className="flex gap-10 justify-between items-start w-full">
      <div
        className={`flex overflow-hidden gap-2 items-center py-1.5 pr-3 pl-1.5 text-sm font-semibold leading-none bg-white border border-solid rounded-[30px] text-zinc-800 ${
          isActive ? "border-[#40454A]" : "border-[#E0E3E6]"
        }`}
      >
        <div className="flex overflow-hidden relative flex-col self-stretch my-auto w-5 aspect-square rounded-[40px]">
          <img
            src={`https://placehold.co/400x400/indigo/white?text=${name
              ?.charAt(0)
              .toUpperCase()}`}
            alt={`${name}'s avatar`}
            className="object-cover absolute inset-0 size-full"
          />
        </div>
        <span className="self-stretch my-auto text-zinc-800">{name}</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1a9cfd05507f87c13d08204ad9dc71c0529481e1?placeholderIfAbsent=true&apiKey=d16ff818163542fcb3b7968bb8567de2"
          alt="Remove member"
          className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
        />
      </div>
      <div className="flex items-start text-sm font-medium leading-loose whitespace-nowrap text-zinc-700">
        <div className="flex gap-1 justify-center items-center px-2.5 py-1.5 bg-white rounded-md">
          <select
            value={role}
            onChange={(e) => onRoleChange?.(e.target.value)}
            className="text-zinc-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const InviteSection: React.FC = () => {
  const { user } = useAuth();
  const handleCopyLink = async () => {
    try {
      if (!user) {
        toast.error("Please login first");
        return;
      }
      const res = await createInvitation({
        inviterId: user.id,
        role: user.role,
      });
      if (res.success && res.data) {
        await navigator.clipboard.writeText(res.data.invitationLink);
        toast.success("Invite link copied to clipboard!");
      } else {
        toast.error(res.error || "Failed to generate invite link");
      }
    } catch (e) {
      toast.error("Failed to generate invite link");
    }
  };

  return (
    <div className="flex gap-3 justify-between items-center px-4 py-3 w-full text-sm leading-none bg-violet-50 rounded-xl max-w-[472px] max-md:max-w-full">
      <div className="self-stretch my-auto text-zinc-700">
        <h3 className="font-bold text-zinc-700">Invite member with a link</h3>
        <p className="mt-1 text-zinc-700">Always as a "Viewer" role.</p>
      </div>
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex gap-2 cursor-pointer hover:bg-indigo-500/80 duration-300 justify-center items-center px-4 py-3 bg-indigo-500 rounded-lg text-white font-medium"
        aria-label="Copy invitation link"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/6101ec4fa0fdc8e37e45c75cec196f154aff5726?placeholderIfAbsent=true&apiKey=d16ff818163542fcb3b7968bb8567de2"
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
          aria-hidden="true"
        />
        <span className="my-auto">Copy Link</span>
      </button>
    </div>
  );
};

interface TabOption {
  id: string;
  label: string;
}

interface TabSelectorProps {
  options: TabOption[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  options,
  selectedTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-1 items-start self-stretch p-1 text-sm font-medium text-gray-500 whitespace-nowrap rounded-xl bg-neutral-100">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          onClick={() => onTabChange(option.id)}
          className={`gap-2.5 self-stretch px-2 py-1 rounded-md ${
            selectedTab === option.id
              ? "bg-white border border-solid border-[#EEF0F1] text-zinc-700"
              : "text-gray-500"
          }`}
          aria-selected={selectedTab === option.id}
          role="tab"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ViewExistingMember = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("Admin");

  const tabOptions = [
    { id: "Admin", label: t("AdvancedSettings.admins") },
    { id: "Analyst", label: t("AdvancedSettings.analysts") },
    { id: "User", label: t("AdvancedSettings.users") },
  ];

  const [members, setMembers] = useState<User[]>([]);

  const { user } = useAuth();

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDone = () => {
    console.log("Done clicked");
  };
  const fetchAllUserData = async () => {
    // TODO: Implement GET /users endpoint in backend
    // For now, we'll show empty state
    setMembers([]);
  };

  const handleRoleChange = async (id: string, newRole: "Admin" | "User") => {
    // TODO: Implement user role update via API
    console.log(id, newRole);

    toast.error("User role update not yet implemented via API");
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.id !== user?.id)
      .filter((m) => m.role === selectedTab);
  }, [members, user, selectedTab]);

  useEffect(() => {
    fetchAllUserData();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`absolute  top-0 right-[25rem] z-50 flex items-center justify-center`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <section
            className="overflow-hidden h-max bg-white rounded-2xl max-w-sm"
            aria-labelledby="advanced-settings-title"
          >
            <header className="px-6 py-4 w-full border-b border-solid border-b-[#E0E3E6] text-zinc-700 max-md:px-5 max-md:max-w-full">
              <h2
                id="advanced-settings-title"
                className="text-lg font-bold leading-loose text-zinc-700"
              >
                {t("AdvancedSettings.title")}
              </h2>
              <p className="text-sm leading-loose text-zinc-700">
                {t("AdvancedSettings.subtitle")}
              </p>
            </header>

            <div className="flex flex-col justify-center p-6 w-full max-md:px-5 max-md:max-w-full">
              <div className="w-full max-md:max-w-full">
                <InviteSection />

                <div className="mt-5 w-full max-md:max-w-full">
                  <div className="flex gap-10 justify-between items-center w-full text-sm font-medium leading-none max-md:max-w-full">
                    <label
                      id="shared-with-label"
                      className="self-stretch my-auto text-zinc-700"
                    >
                      {t("AdvancedSettings.sharedWith")}:
                    </label>
                    <TabSelector
                      options={tabOptions}
                      selectedTab={selectedTab}
                      onTabChange={handleTabChange}
                    />
                  </div>

                  <div
                    className="mt-4 w-full max-md:max-w-full h-40 overflow-y-scroll  "
                    aria-labelledby="shared-with-label"
                  >
                    {filteredMembers.map((member, index) => (
                      <div key={index} className={index !== 0 ? "mt-2" : ""}>
                        <MemberItem
                          {...member}
                          onRoleChange={(newRole) => {
                            if (newRole === "Admin" || newRole === "User") {
                              handleRoleChange(member.id, newRole);
                            }
                          }}
                        />
                      </div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="flex flex-col items-center justify-center px-4 py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-zinc-500">
                        <FaCircleExclamation />
                        <p className="text-sm font-medium">
                          {t("AdvancedSettings.noMembersFound")}
                        </p>
                        <p className="text-xs mt-1 text-gray-400">
                          {t("AdvancedSettings.trySwitchingTabs")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <footer className="flex flex-wrap gap-10 justify-between items-start px-6 py-4 w-full text-sm font-medium leading-none whitespace-nowrap border-t border-solid border-t-[#E0E3E6] max-md:px-5 max-md:max-w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="gap-2 self-stretch px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#E0E3E6] text-zinc-700"
              >
                {t("AdvancedSettings.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="gap-2 self-stretch px-3.5 py-2.5 text-indigo-500 bg-white rounded-lg border border-solid border-[#4A68FF]"
              >
                {t("AdvancedSettings.done")}
              </button>
            </footer>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewExistingMember;
