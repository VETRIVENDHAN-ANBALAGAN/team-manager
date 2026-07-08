import { Project, Task, TeamMember, FeedEvent, AttendanceLog, GrowthInsight, IMSFile, IMSReport, User, Client } from './types';

export const ADMIN_USER = {
  name: 'Admin User',
  role: 'Systems Administrator',
  email: 'vetrimgk@gmail.com',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANXhn4iOLLlSH6wbGPzkQWx3kZh17WYH8SKV9ps3FPzmm2LM6jad8AcQEYcMXSlR21Ft0Diylxnslc2hxCUAVkjXO-bK5glu-dQIi8YnLp2tzZGXU4szS7xAL9-_INzb6ei6i8qCbpv_HBx4BDoXmCKExMoLlFAcxcP_3WUeBZiMVEfnAaP-sZr3vCh9gqPYReUn3jUT08feJwMQHWUGpg_LMiHR0B8WNcey8fTcgW_JRZwmBWxwR3vOSwL5-_RWaKJFmFqxyNcmI',
};

export const BRAND_LOGO = 'https://lh3.googleusercontent.com/aida/AP1WRLvlZXeW-8zeIlt6FL2D4yB0zhl-1CZyx3cAeOlhf-AVmYWJ8vhPJgfKhuCcAZA09yH3L_r5SEGoEh4bdAqeYWn834xgZ157pX1zjfY0OYEith2Pqs4M1Mgsdz3fJTMP509Shmx0Z-28HN_loZWKndq3o_uBlWcRxjQ2q_CMFiR6k6GzBr7j1hRYR9Dk3Hp5PkGn5MApECS7qjxIfgR2QH9ak4DgyGij6G0Xu2tMKJNG9nGeGidNRbBtnoU';
export const GEOMETRIC_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd6A8gzEc27gOhTsRvAfGwK4l8cVxhva7iCalj05ooaWWkeLGF8-I2rSaYNqMNxK7pq9FCN8-LA_k8noFKwNXl1-aDNNvb49izIzkTzwL-KpgBLd_N3mB99RE8fIIFv1MHXwcsyezgy5M4IiU_KIjO6-K_0NpaceNugc98R6w7clJFwOJsEQES-LxJdtaFizSnt-rTgyi1HQnE8TioQqqhQl9zwZjjl9TqOUcNHdjDf8__tBmEfaOUV-gzKbTLR4_-7IYJtKkp_bs';

export const CLANS = [
  { id: 'vanguard', name: 'Alpha Vanguard', color: 'indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25', hoverBg: 'hover:bg-indigo-500/20', badgeBg: 'bg-indigo-500', description: 'Operations and deployment core' },
  { id: 'synapse', name: 'Beta Synapse', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25', hoverBg: 'hover:bg-amber-500/20', badgeBg: 'bg-amber-500', description: 'Data integration and analytics squad' },
  { id: 'sentinel', name: 'Omega Sentinel', color: 'emerald', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', hoverBg: 'hover:bg-emerald-500/20', badgeBg: 'bg-emerald-500', description: 'System auditing and security protocols' },
  { id: 'forge', name: 'Delta Forge', color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25', hoverBg: 'hover:bg-rose-500/20', badgeBg: 'bg-rose-500', description: 'UI/UX iteration and asset design' }
];

export const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'BrandMachii Retail Portal', 
    client: 'RetailCorp', 
    status: 'active', 
    efficiency: 92, 
    startDate: '2026-01-15',
    description: 'A modern, performant retail hub for managing high-volume order processing and visual catalogs.',
    clanId: 'forge',
    tasks: [
      { id: 'pt-1-1', title: 'Design checkout user flow with high-contrast UI', completed: true },
      { id: 'pt-1-2', title: 'Connect to inventory sync middleware', completed: false },
      { id: 'pt-1-3', title: 'Implement offline transaction queue', completed: false }
    ]
  },
  { 
    id: 'proj-2', 
    name: 'IMS Core Engine Upgrades', 
    client: 'Internal Tech', 
    status: 'active', 
    efficiency: 87, 
    startDate: '2026-02-10',
    description: 'Optimizing data structures and background synchronization pipelines for the central ERP systems.',
    clanId: 'vanguard',
    tasks: [
      { id: 'pt-2-1', title: 'Profile database read latency in development', completed: true },
      { id: 'pt-2-2', title: 'Upgrade main server to Node 22', completed: true },
      { id: 'pt-2-3', title: 'Benchmark memory usage during intensive file uploads', completed: false }
    ]
  },
  { 
    id: 'proj-3', 
    name: 'Q3 Inventory Audits', 
    client: 'Logistics Team', 
    status: 'completed', 
    efficiency: 95, 
    startDate: '2026-03-01',
    description: 'Compiling regulatory physical assets records and balancing general ledgers across regional hubs.',
    clanId: 'sentinel',
    tasks: [
      { id: 'pt-3-1', title: 'Draft physical verification standards', completed: true },
      { id: 'pt-3-2', title: 'Sync local counts from Region A and B', completed: true },
      { id: 'pt-3-3', title: 'Sign-off on logistics dispatch logs', completed: true }
    ]
  },
  { 
    id: 'proj-4', 
    name: 'Client X Wireframe Sprint', 
    client: 'Client X', 
    status: 'active', 
    efficiency: 90, 
    startDate: '2026-04-18',
    description: 'Short, interactive prototype cycle validating dark mode visual preferences and layouts.',
    clanId: 'forge',
    tasks: [
      { id: 'pt-4-1', title: 'Generate visual guidelines matching Elegant Dark theme', completed: true },
      { id: 'pt-4-2', title: 'Develop responsive landing page wireframe', completed: false }
    ]
  },
  { 
    id: 'proj-5', 
    name: 'Enterprise SAML Integration', 
    client: 'GlobalFin', 
    status: 'on-hold', 
    efficiency: 78, 
    startDate: '2026-05-02',
    description: 'Providing secure Single Sign-On and workspace federation under enterprise auditing guidelines.',
    clanId: 'synapse',
    tasks: [
      { id: 'pt-5-1', title: 'Set up test Active Directory workspace', completed: false },
      { id: 'pt-5-2', title: 'Configure metadata XML assertions', completed: false }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Server Capacity Warning',
    description: 'Node Alpha is approaching 95% storage capacity. Immediate archival or expansion is required to prevent node scaling failures.',
    priority: 'urgent',
    dueTime: 'Today, 5:00 PM',
    completed: false,
    clanId: 'vanguard'
  },
  {
    id: 'task-2',
    title: 'Review Q4 Logistics Plan',
    description: 'Pending operational director sign-off on local dispatch networks. Review shipping buffers and capacity margins before distribution.',
    priority: 'high',
    dueTime: 'Tomorrow',
    completed: false,
    clanId: 'sentinel'
  },
  {
    id: 'task-3',
    title: 'Vendor Contract Renewal',
    description: 'Contract terms with primary fulfillment vendor Acme Corp expire in 7 days. Ensure standard service SLAs are locked.',
    priority: 'high',
    dueTime: 'Oct 26',
    completed: false,
    clanId: 'synapse'
  },
  {
    id: 'task-4',
    title: 'Archive Completed Audits',
    description: 'Move completed Q1/Q2 inventory ledger files into cold secure cloud storage to clean primary asset dashboard.',
    priority: 'medium',
    dueTime: 'Oct 29',
    completed: true,
    clanId: 'sentinel'
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Sarah Jenkins',
    role: 'Senior Developer',
    status: 'online',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAze0rrf3fxprbxLk-T40O6L2u-4QYxIlxbbU5sTn0_kHrt1EDgDwAUq9QXk6I1cZYrTqARZ5JyZOFe_KMFwqF_y69f0osgguxwwhiJ-heRX7DQ4oX4ZuESwFhkZKS9TtMQaDKeeCyiGPKUrlel-PxXgUSjSHK7nlibdnMjfbJCCIeiZ5PXyOyWlHb88bkWKbM6gTSebXzDzVhg8BiyxiTTQ7gxikfxjEKJCpjzTiMYfXLz6onBANvf6qhBglHqJJUQ0tndA8fV_As',
    clockInTime: '08:55 AM',
    totalHoursToday: '--',
    clanId: 'vanguard'
  },
  {
    id: 'mem-2',
    name: 'Marcus Chen',
    role: 'Project Manager',
    status: 'away',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVc2DiMmOpKph1GaOSjm9Uk7Qz1BrjyuiNVHZnzEXWlWL4i8uhSfgxfuox32CYyQ081fM_3AvFkcfJCyddwYqkDvDE4gFvrthtxTCms06EJ5-6F3tWwfJsdzbliSh_ztKbCOp3VU6J3WHstdAtJS6zOCLKhy4xlfOSPBmCCd1VJBD4e-5iwsS9lPFSuhdeOT_1_I8TRFl3Twe5q9Ix_DyjVbpH9GRuqnnf_5pP_Hf_MllM74wKFrhbIvl_uYTn1m3fHz_MSvk5Qf8',
    clockInTime: '09:02 AM',
    totalHoursToday: '--',
    clanId: 'synapse'
  },
  {
    id: 'mem-3',
    name: 'Elena Rodriguez',
    role: 'UX Designer',
    status: 'on-leave',
    avatarUrl: '',
    initials: 'EL',
    totalHoursToday: '0h',
    clanId: 'forge'
  },
  {
    id: 'mem-4',
    name: 'David Kim',
    role: 'Logistics Coord.',
    status: 'online',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0JqzajTaw4nXux7SAw84opOQrW5_NnrDF9VE_YUpJTPsSyYK9FcZ-qy2Vhyox7vbRv5j3kk8AYzgJl0boq2LBsCev1eEk0m1WThjPAahi6xVRgYcoIVYcsuh5EIx2Z3bbiavyBr0WGpOJ3O5hez3wCGKLUF0TKzaVCgdnD_z5fL14ICZ6k1JBg-SAtWNG9J_rLYyh_FEiOhsSNDL60tZTDMVBEEnjxwPRiS4Tg3OWpg0oSJhVqy83I7DFCyVgPoQQLqcX_gUHFCo',
    clockInTime: '08:50 AM',
    totalHoursToday: '8h 15m',
    clanId: 'sentinel'
  },
  {
    id: 'mem-5',
    name: 'Eleanor Vance',
    role: 'Administrator',
    status: 'online',
    avatarUrl: '',
    initials: 'EV',
    clockInTime: '08:45 AM',
    totalHoursToday: '--',
    clanId: 'vanguard'
  }
];

export const INITIAL_FEED_EVENTS: FeedEvent[] = [
  {
    id: 'feed-1',
    memberId: 'mem-1',
    memberName: 'Sarah Jenkins',
    action: 'clock_in',
    detail: 'Sarah Jenkins clocked in.',
    time: 'Today, 08:55 AM · On Time',
    statusType: 'success'
  },
  {
    id: 'feed-2',
    memberId: 'mem-2',
    memberName: 'Marcus Chen',
    action: 'status_change',
    detail: 'Marcus Chen status changed to Away.',
    time: 'Today, 10:15 AM',
    statusType: 'warning'
  },
  {
    id: 'feed-3',
    memberId: 'mem-4',
    memberName: 'David Kim',
    action: 'clock_out',
    detail: 'David Kim clocked out.',
    time: 'Yesterday, 05:05 PM · 8h 10m total',
    statusType: 'error'
  },
  {
    id: 'feed-4',
    memberId: 'mem-2',
    memberName: 'Marcus Chen',
    action: 'clock_in',
    detail: 'Marcus Chen clocked in.',
    time: 'Yesterday, 09:02 AM · Late (2m)',
    statusType: 'success'
  }
];

export const INITIAL_ATTENDANCE_LOGS: AttendanceLog[] = [
  {
    id: 'log-1',
    memberId: 'mem-1',
    memberName: 'Sarah Jenkins',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAze0rrf3fxprbxLk-T40O6L2u-4QYxIlxbbU5sTn0_kHrt1EDgDwAUq9QXk6I1cZYrTqARZ5JyZOFe_KMFwqF_y69f0osgguxwwhiJ-heRX7DQ4oX4ZuESwFhkZKS9TtMQaDKeeCyiGPKUrlel-PxXgUSjSHK7nlibdnMjfbJCCIeiZ5PXyOyWlHb88bkWKbM6gTSebXzDzVhg8BiyxiTTQ7gxikfxjEKJCpjzTiMYfXLz6onBANvf6qhBglHqJJUQ0tndA8fV_As',
    date: 'Oct 24, 2023',
    checkInTime: '08:55 AM',
    status: 'On Time',
    totalHours: '--'
  },
  {
    id: 'log-2',
    memberId: 'mem-2',
    memberName: 'Marcus Chen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVc2DiMmOpKph1GaOSjm9Uk7Qz1BrjyuiNVHZnzEXWlWL4i8uhSfgxfuox32CYyQ081fM_3AvFkcfJCyddwYqkDvDE4gFvrthtxTCms06EJ5-6F3tWwfJsdzbliSh_ztKbCOp3VU6J3WHstdAtJS6zOCLKhy4xlfOSPBmCCd1VJBD4e-5iwsS9lPFSuhdeOT_1_I8TRFl3Twe5q9Ix_DyjVbpH9GRuqnnf_5pP_Hf_MllM74wKFrhbIvl_uYTn1m3fHz_MSvk5Qf8',
    date: 'Oct 24, 2023',
    checkInTime: '09:02 AM',
    status: 'Late',
    totalHours: '--'
  },
  {
    id: 'log-3',
    memberId: 'mem-3',
    memberName: 'Elena Rodriguez',
    initials: 'EL',
    date: 'Oct 24, 2023',
    checkInTime: 'N/A',
    status: 'On Leave',
    totalHours: '0h'
  },
  {
    id: 'log-4',
    memberId: 'mem-4',
    memberName: 'David Kim',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0JqzajTaw4nXux7SAw84opOQrW5_NnrDF9VE_YUpJTPsSyYK9FcZ-qy2Vhyox7vbRv5j3kk8AYzgJl0boq2LBsCev1eEk0m1WThjPAahi6xVRgYcoIVYcsuh5EIx2Z3bbiavyBr0WGpOJ3O5hez3wCGKLUF0TKzaVCgdnD_z5fL14ICZ6k1JBg-SAtWNG9J_rLYyh_FEiOhsSNDL60tZTDMVBEEnjxwPRiS4Tg3OWpg0oSJhVqy83I7DFCyVgPoQQLqcX_gUHFCo',
    date: 'Oct 23, 2023',
    checkInTime: '08:50 AM',
    status: 'On Time',
    totalHours: '8h 15m'
  }
];

export const INITIAL_GROWTH_INSIGHTS: GrowthInsight[] = [
  {
    id: 'insight-1',
    credits: '+10 cr',
    type: 'Completed Task',
    title: 'Wireframe iteration for Client X',
    description: 'Completed user experience prototypes and wireframe iterations for review ahead of schedule.',
    time: '2h ago',
    category: 'task'
  },
  {
    id: 'insight-2',
    credits: '+50 cr',
    type: 'Milestone Reached',
    title: 'Q3 Inventory Audit finalized',
    description: 'Successfully verified and synchronized all 1.2k inventory assets in compliance with guidelines.',
    time: '5h ago',
    category: 'milestone'
  },
  {
    id: 'insight-3',
    credits: '+5 cr',
    type: 'Quick Win',
    title: 'Resolved urgent support ticket #4492',
    description: 'Diagnosed database read latency issue and recovered live synchronization pipeline.',
    time: '1d ago',
    category: 'quick-win'
  },
  {
    id: 'insight-4',
    credits: '+15 cr',
    type: 'Asset Upload',
    title: 'Added 30 new high-res product photos',
    description: 'Uploaded high-fidelity packaging and model graphics for retail items to asset vault.',
    time: '2d ago',
    category: 'asset'
  },
  {
    id: 'insight-5',
    credits: 'Perfect',
    type: 'Team Alpha',
    title: 'Perfect Attendance Week',
    description: 'All members clocked in on time for 5 consecutive days without manual corrections.',
    time: '2d ago',
    category: 'attendance'
  }
];

export const INITIAL_FILES: IMSFile[] = [
  { id: 'f-1', name: 'product_catalog_oct2023.pdf', size: '4.8 MB', type: 'application/pdf', uploadedBy: 'David Kim', uploadedAt: 'Oct 22, 2023', category: 'report' },
  { id: 'f-2', name: 'wireframe_iteration_v3_final.fig', size: '22.4 MB', type: 'Figma File', uploadedBy: 'Sarah Jenkins', uploadedAt: 'Oct 24, 2023', category: 'image' },
  { id: 'f-3', name: 'acme_renewal_contract_draft.docx', size: '1.2 MB', type: 'Word Document', uploadedBy: 'Admin', uploadedAt: 'Oct 23, 2023', category: 'report' },
  { id: 'f-4', name: 'node_alpha_syslogs_archive.zip', size: '145.8 MB', type: 'Compressed Zip', uploadedBy: 'Admin', uploadedAt: 'Oct 24, 2023', category: 'archive' },
  { id: 'f-5', name: 'imspro_dark_theme_assets.config', size: '12 KB', type: 'JSON Configuration', uploadedBy: 'Sarah Jenkins', uploadedAt: 'Oct 20, 2023', category: 'config' }
];

export const INITIAL_REPORTS: IMSReport[] = [
  { id: 'rep-1', title: 'Q3 Inventory Compliance Audit', author: 'Elena Rodriguez', date: 'Oct 24, 2023', type: 'Inventory', status: 'Approved' },
  { id: 'rep-2', title: 'Weekly Punctuality & Leave Ledger', author: 'Admin', date: 'Oct 23, 2023', type: 'Performance', status: 'Approved' },
  { id: 'rep-3', title: 'Node Storage Capacity Metrics Log', author: 'Sarah Jenkins', date: 'Oct 24, 2023', type: 'Logistics', status: 'Review' },
  { id: 'rep-4', title: 'Acme Corp Vendor Contract Proposal', author: 'Marcus Chen', date: 'Oct 21, 2023', type: 'Financial', status: 'Draft' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@company.com',
    name: 'Eleanor Vance (Admin)',
    role: 'Admin'
  },
  {
    id: 'user-leader',
    email: 'leader@company.com',
    name: 'Sarah Jenkins (Clan Leader)',
    role: 'Clan Leader',
    clanId: 'vanguard'
  },
  {
    id: 'user-member',
    email: 'member@company.com',
    name: 'David Kim (Team Member)',
    role: 'Team Member',
    clanId: 'sentinel'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'RetailCorp',
    industry: 'Retail & E-commerce',
    status: 'active',
    projectCount: 1,
    onboardedAt: '2026-01-10',
    contactPerson: 'John Doe',
    contactEmail: 'john@retailcorp.com',
    notes: 'Primary retail client for portal upgrades. Prefers bi-weekly status updates.'
  },
  {
    id: 'cli-2',
    name: 'GlobalFin',
    industry: 'Banking & Finance',
    status: 'active',
    projectCount: 1,
    onboardedAt: '2026-03-15',
    contactPerson: 'Jane Smith',
    contactEmail: 'jane@globalfin.com',
    notes: 'Currently undergoing enterprise SAML security integration.'
  },
  {
    id: 'cli-3',
    name: 'Client X',
    industry: 'Technology Ventures',
    status: 'onboarding',
    projectCount: 1,
    onboardedAt: '2026-06-20',
    contactPerson: 'Alex Rivera',
    contactEmail: 'alex@clientx.io',
    notes: 'Fast-paced wireframe sprint client. High attention on UI aesthetics.'
  },
  {
    id: 'cli-4',
    name: 'Logistics Team',
    industry: 'Supply Chain & Logistics',
    status: 'active',
    projectCount: 1,
    onboardedAt: '2025-11-01',
    contactPerson: 'Marcus Chen',
    contactEmail: 'marcus@company.com',
    notes: 'Internal logistics department client.'
  }
];

