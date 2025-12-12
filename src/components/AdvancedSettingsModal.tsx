import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { createInvitation } from '../services/invitations';
import { User } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaCircleExclamation } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { getUsers, deleteUser } from '../services/users';

interface MemberItemProps extends User {
  isActive?: boolean;
  onRoleChange?: (newRole: string) => void;
  onDelete?: (id: string) => void;
}

const MemberItem: React.FC<MemberItemProps> = ({
  id,
  role,
  name,
  firstSurname,
  secondSurname,
  email,
  photoURL,
  isActive = false,
  onRoleChange,
  onDelete,
}) => {
  const { t } = useTranslation();

  // Build full name
  const fullName = [name, firstSurname, secondSurname]
    .filter(Boolean)
    .join(' ');

  // Get initials for placeholder
  const initials = name?.charAt(0).toUpperCase() || 'U';

  // Get avatar URL or use placeholder
  const avatarUrl =
    photoURL || `https://placehold.co/400x400/indigo/white?text=${initials}`;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className='flex gap-10 justify-between items-start w-full'>
      <div
        className={`flex overflow-hidden gap-2 items-center py-1.5 pr-3 pl-1.5 text-sm font-semibold leading-none bg-white border border-solid rounded-[30px] text-zinc-800 ${
          isActive ? 'border-[#40454A]' : 'border-[#E0E3E6]'
        }`}
      >
        <div className='flex overflow-hidden relative flex-col self-stretch my-auto w-5 aspect-square rounded-[40px]'>
          <img
            src={avatarUrl}
            alt={`${fullName}'s avatar`}
            className='object-cover absolute inset-0 size-full'
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (
                e.target as HTMLImageElement
              ).src = `https://placehold.co/400x400/indigo/white?text=${initials}`;
            }}
          />
        </div>
        <div className='flex flex-col'>
          <span className='self-stretch my-auto text-zinc-800'>{fullName}</span>
          <span className='text-xs text-zinc-500'>{email}</span>
        </div>
        {onDelete && (
          <button
            type='button'
            onClick={handleDelete}
            className='flex items-center justify-center w-5 h-5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors'
            aria-label={`Delete ${fullName}`}
            title={t('AdvancedSettings.deleteUser') || 'Delete user'}
          >
            <FaTimes className='w-3.5 h-3.5' />
          </button>
        )}
      </div>
      <div className='flex items-start text-sm font-medium leading-loose whitespace-nowrap text-zinc-700'>
        <div className='flex gap-1 justify-center items-center px-2.5 py-1.5 bg-white rounded-md'>
          <select
            value={role}
            onChange={(e) => onRoleChange?.(e.target.value)}
            className='text-zinc-700 bg-transparent outline-none cursor-pointer'
          >
            <option value='Admin'>Admin</option>
            <option value='User'>User</option>
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
        toast.error('Please login first');
        return;
      }
      const res = await createInvitation({
        inviterId: user.id,
        role: user.role,
      });
      if (res.success && res.data) {
        await navigator.clipboard.writeText(res.data.invitationLink);
        toast.success('Invite link copied to clipboard!');
      } else {
        toast.error(res.error || 'Failed to generate invite link');
      }
    } catch {
      toast.error('Failed to generate invite link');
    }
  };

  return (
    <div className='flex gap-3 justify-between items-center px-4 py-3 w-full text-sm leading-none bg-violet-50 rounded-xl max-w-[472px] max-md:max-w-full'>
      <div className='self-stretch my-auto text-zinc-700'>
        <h3 className='font-bold text-zinc-700'>Invite member with a link</h3>
        <p className='mt-1 text-zinc-700'>Always as a "Viewer" role.</p>
      </div>
      <button
        type='button'
        onClick={handleCopyLink}
        className='flex gap-2 cursor-pointer hover:bg-indigo-500/80 duration-300 justify-center items-center px-4 py-3 bg-indigo-500 rounded-lg text-white font-medium'
        aria-label='Copy invitation link'
      >
        <img
          src='https://cdn.builder.io/api/v1/image/assets/TEMP/6101ec4fa0fdc8e37e45c75cec196f154aff5726?placeholderIfAbsent=true&apiKey=d16ff818163542fcb3b7968bb8567de2'
          alt=''
          className='object-contain shrink-0 self-stretch my-auto w-5 aspect-square'
          aria-hidden='true'
        />
        <span className='my-auto'>Copy Link</span>
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
    <div className='flex gap-1 items-start self-stretch p-1 text-sm font-medium text-gray-500 whitespace-nowrap rounded-xl bg-neutral-100'>
      {options.map((option) => (
        <button
          type='button'
          key={option.id}
          onClick={() => onTabChange(option.id)}
          className={`gap-2.5 self-stretch px-2 py-1 rounded-md ${
            selectedTab === option.id
              ? 'bg-white border border-solid border-[#EEF0F1] text-zinc-700'
              : 'text-gray-500'
          }`}
          aria-selected={selectedTab === option.id}
          role='tab'
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
  const [selectedTab, setSelectedTab] = useState('Admin');

  const tabOptions = [
    { id: 'Admin', label: t('AdvancedSettings.admins') },
    { id: 'Analyst', label: t('AdvancedSettings.analysts') },
    { id: 'User', label: t('AdvancedSettings.users') },
  ];

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDone = () => {
    onClose();
  };

  const fetchAllUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers();
      if (result.success && result.data) {
        setMembers(result.data);
      } else {
        setError(result.error || 'Failed to fetch users');
        toast.error(result.error || 'Failed to fetch users');
      }
    } catch {
      const errorMessage = 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: 'Admin' | 'User') => {
    // TODO: Implement user role update via API
    toast.error('User role update not yet implemented via API');
  };

  const handleDelete = async (userId: string) => {
    const memberToDelete = members.find((m) => m.id === userId);
    const fullName = memberToDelete
      ? [
          memberToDelete.name,
          memberToDelete.firstSurname,
          memberToDelete.secondSurname,
        ]
          .filter(Boolean)
          .join(' ')
      : 'this user';

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${fullName}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const result = await deleteUser(userId);
      if (result.success) {
        // Remove user from local list
        setMembers((prev) => prev.filter((m) => m.id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.id !== user?.id)
      .filter((m) => m.role === selectedTab);
  }, [members, user, selectedTab]);

  useEffect(() => {
    if (isOpen) {
      fetchAllUserData();
    }
  }, [isOpen]);

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
            className='overflow-hidden h-max bg-white rounded-2xl max-w-sm'
            aria-labelledby='advanced-settings-title'
          >
            <header className='px-6 py-4 w-full border-b border-solid border-b-[#E0E3E6] text-zinc-700 max-md:px-5 max-md:max-w-full'>
              <h2
                id='advanced-settings-title'
                className='text-lg font-bold leading-loose text-zinc-700'
              >
                {t('AdvancedSettings.title')}
              </h2>
              <p className='text-sm leading-loose text-zinc-700'>
                {t('AdvancedSettings.subtitle')}
              </p>
            </header>

            <div className='flex flex-col justify-center p-6 w-full max-md:px-5 max-md:max-w-full'>
              <div className='w-full max-md:max-w-full'>
                <InviteSection />

                <div className='mt-5 w-full max-md:max-w-full'>
                  <div className='flex gap-10 justify-between items-center w-full text-sm font-medium leading-none max-md:max-w-full'>
                    <label
                      id='shared-with-label'
                      className='self-stretch my-auto text-zinc-700'
                    >
                      {t('AdvancedSettings.sharedWith')}:
                    </label>
                    <TabSelector
                      options={tabOptions}
                      selectedTab={selectedTab}
                      onTabChange={handleTabChange}
                    />
                  </div>

                  <div
                    className='mt-4 w-full max-md:max-w-full h-40 overflow-y-scroll  '
                    aria-labelledby='shared-with-label'
                  >
                    {loading && (
                      <div className='flex items-center justify-center px-4 py-6 text-zinc-500'>
                        <p className='text-sm'>Loading users...</p>
                      </div>
                    )}
                    {error && !loading && (
                      <div className='flex flex-col items-center justify-center px-4 py-6 bg-red-50 rounded-lg border border-dashed border-red-300 text-center text-red-500'>
                        <FaCircleExclamation className='mb-2' />
                        <p className='text-sm font-medium'>{error}</p>
                        <button
                          type='button'
                          onClick={fetchAllUserData}
                          className='mt-2 text-xs underline hover:no-underline'
                        >
                          Try again
                        </button>
                      </div>
                    )}
                    {!loading &&
                      !error &&
                      filteredMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className={index !== 0 ? 'mt-2' : ''}
                        >
                          <MemberItem
                            {...member}
                            onRoleChange={(newRole) => {
                              if (newRole === 'Admin' || newRole === 'User') {
                                handleRoleChange(member.id, newRole);
                              }
                            }}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))}
                    {!loading && !error && filteredMembers.length === 0 && (
                      <div className='flex flex-col items-center justify-center px-4 py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-zinc-500'>
                        <FaCircleExclamation />
                        <p className='text-sm font-medium'>
                          {t('AdvancedSettings.noMembersFound')}
                        </p>
                        <p className='text-xs mt-1 text-gray-400'>
                          {t('AdvancedSettings.trySwitchingTabs')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <footer className='flex flex-wrap gap-10 justify-between items-start px-6 py-4 w-full text-sm font-medium leading-none whitespace-nowrap border-t border-solid border-t-[#E0E3E6] max-md:px-5 max-md:max-w-full'>
              <button
                type='button'
                onClick={handleCancel}
                className='gap-2 self-stretch px-3.5 py-2.5 bg-white rounded-lg border border-solid border-[#E0E3E6] text-zinc-700'
              >
                {t('AdvancedSettings.cancel')}
              </button>
              <button
                type='button'
                onClick={handleDone}
                className='gap-2 self-stretch px-3.5 py-2.5 text-indigo-500 bg-white rounded-lg border border-solid border-[#4A68FF]'
              >
                {t('AdvancedSettings.done')}
              </button>
            </footer>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewExistingMember;
