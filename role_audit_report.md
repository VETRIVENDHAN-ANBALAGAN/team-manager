# Role-Based Access Control (RBAC) Audit Report

This audit details the current state of role-based security in the **IMS Pro** system and outlines a comprehensive plan for restricting views and actions based on user roles (`Admin`, `Clan Leader`, `Team Member`) to maintain a secure, distinctive, and clean working environment.

---

## 1. Current RBAC Mapping (As-Is)

Currently, the frontend uses the `currentUser.role` state to toggle visual sections, but lacks strict route-level or action-level enforcement.

| Section / Action | Admin | Clan Leader | Team Member | Current Status / Gap |
| :--- | :---: | :---: | :---: | :--- |
| **Global Dashboard Stats** | ✅ Full | ⚠️ Filtered by Clan | ⚠️ Filtered by Clan | Partial visual isolation; no hard restriction. |
| **Create / Delete Tasks** | ✅ Yes | ✅ Yes | ✅ Yes | **Critical Gap**: Team Members can delete any task. |
| **Manage Projects** | ✅ Full | ⚠️ Clan Locked | ⚠️ Clan Locked | UI is filtered by clan, but can be bypassed. |
| **Create / Delete Files** | ✅ Yes | ✅ Yes | ✅ Yes | **Critical Gap**: Team Members can delete system files. |
| **Team Management (Add/Clock)** | ✅ Yes | ✅ Yes | ✅ Yes | **Critical Gap**: Any user can add members or clock other users. |
| **Factory Database Reset** | ✅ Yes | ✅ Yes | ✅ Yes | **Critical Gap**: Regular users can trigger database drops. |

---

## 2. Identified Security Gaps & Risks

- **Database Dropping Privilege**: Any authenticated Team Member can click "Restore Default Mockups" in the Settings View. This triggers a `POST /api/reset` to the backend, wiping the MongoDB database.
- **Impersonation in Shifts**: The `TeamView` allows any operator to click the Clock In/Out buttons for other team members, leading to integrity issues in attendance logs.
- **Unrestricted File & Client Modification**: Files uploaded to the Secure Files Vault can be deleted by anyone, and the Clients Ledger can be modified by Team Members.

---

## 3. State-of-the-Art RBAC Blueprint (To-Be)

To establish a professional and secure working environment, we recommend implementing the following visibility and action restrictions:

### 🛡️ Admin (System Administrator)
*Full system clearance to audit, configure, and maintain the platform.*
- **Visible Pages**: All (Dashboard, Projects, Clients, Team, Files, Reports, Settings).
- **Actions Allowed**:
  - Global create/read/update/delete on all resources.
  - Perform Database Factory Resets (`/api/reset`).
  - View all clans and reassign leaders/members.

### 🎖️ Clan Leader
*Authorized to manage their assigned Clan's workloads and track performance.*
- **Visible Pages**: Dashboard, Projects, Team (Clan-restricted), Files, Reports, Settings.
  - *Restricted Page*: **Clients Ledger** (hidden to protect client contact data).
- **Actions Allowed**:
  - View all projects/tasks but can only **edit/create** those assigned to their own `clanId`.
  - Add or update team members belonging to their own Clan.
  - **Restricted Actions**: Cannot execute factory resets or delete files uploaded by Admins.

### 👤 Team Member (Regular Operator)
*Least-privilege operational access focused entirely on execution.*
- **Visible Pages**: Dashboard (Clan-restricted), Projects (Clan-restricted), Files (Read-only), Settings (Read-only).
  - *Restricted Pages*: **Clients Ledger**, **Reports Page**, **Team Management Page**.
- **Actions Allowed**:
  - View their assigned projects and subtasks.
  - Toggle completion of tasks assigned to their Clan.
  - Clock In / Clock Out **only for themselves** (others are disabled/hidden).
  - **Restricted Actions**: Cannot add team members, create/delete projects, upload/delete files, or access database reset controls.

---

## 4. Proposed UI Adjustments Matrix

### Proposed Code Restrictions

1. **Sidebar Navigation**:
   - Hide the `Clients Ledger` tab if `role === 'Team Member' || role === 'Clan Leader'`.
   - Hide the `Team Members` and `Insight Reports` tabs if `role === 'Team Member'`.
2. **Settings Page**:
   - Remove the "Database Management" section (Factory Reset) if `role !== 'Admin'`.
3. **Team View**:
   - Disable/hide the "Add Member" button and only allow the active logged-in user to trigger clock actions on their own row.
4. **Secure Files**:
   - Hide the "Upload File" and "Delete" actions if `role === 'Team Member'`.
5. **Backend Verification**:
   - Enforce these rules at the API layer in `server/index.ts` by validating the user's role from the JWT payload before processing writes.
