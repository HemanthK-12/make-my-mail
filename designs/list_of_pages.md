## Frontend Pages Structure

### **Authentication Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Landing Page** | `/` | Marketing page with features, pricing, CTA | → Login or Sign Up |
| **Login Page** | `/auth/login` | Google OAuth button, privacy policy | → Dashboard |
| **OAuth Callback** | `/auth/callback` | Handle Google redirect, token storage | → Onboarding or Dashboard |
| **Onboarding** | `/onboarding` | First-time setup, permissions, preferences | → Dashboard |

### **Core Application Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Dashboard** | `/dashboard` | Main view with sender groups, stats summary | → All other pages |
| **Sender View** | `/senders` | GROUP BY sender with email counts, actions | → Sender Details |
| **Sender Details** | `/senders/[email]` | All emails from specific sender, analytics | → Individual Email |
| **Email Thread** | `/email/[id]` | Single email/conversation view | → Reply/Actions |
| **Search Results** | `/search?q=` | Advanced search with filters | → Email Thread |

### **Action Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Mass Actions** | `/actions/bulk` | Preview & confirm bulk operations | → Success/Dashboard |
| **Unsubscribe Center** | `/unsubscribe` | List of all subscriptions, one-click unsub | → Confirmation |
| **Compose** | `/compose` | New email with AI assistance | → Dashboard |
| **Templates** | `/templates` | Email templates library | → Compose |

### **Analytics Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Analytics Dashboard** | `/analytics` | Email metrics, time spent, patterns | → Detailed Reports |
| **Sender Analytics** | `/analytics/senders` | Top senders, frequency, trust scores | → Sender Details |
| **Productivity Report** | `/analytics/productivity` | Response times, inbox zero tracking | → Tips/Actions |
| **Cost Tracker** | `/analytics/costs` | Subscription costs from receipts | → Unsubscribe Center |

### **Settings & Management**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Settings** | `/settings` | Account, preferences, integrations | → Sub-settings |
| **Privacy Settings** | `/settings/privacy` | Tracker blocking, encryption options | → Settings |
| **Automation Rules** | `/settings/automation` | Create/edit email rules & filters | → Rule Editor |
| **Backup Manager** | `/settings/backup` | Export emails, restore points | → Export Modal |
| **Team Management** | `/settings/team` | Add members, permissions (Pro) | → Invite Modal |

### **Utility Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Trash/Archive** | `/trash` | 30-day recovery view | → Restore/Dashboard |
| **Scheduled** | `/scheduled` | Pending scheduled emails | → Edit/Cancel |
| **Integrations** | `/integrations` | Connect Calendar, CRM, etc. | → OAuth flows |
| **Help Center** | `/help` | FAQs, tutorials, support | → Contact Support |

### **Mobile-Specific Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **Mobile Dashboard** | `/m/dashboard` | Simplified swipe interface | → Quick Actions |
| **Quick Actions** | `/m/actions` | Common actions (delete, archive) | → Dashboard |
| **Offline Queue** | `/m/offline` | Pending changes when offline | → Sync Status |

### **Error/Status Pages**
| Page | Route | Function | Leads To |
|------|-------|----------|----------|
| **404 Page** | `/404` | Page not found | → Dashboard |
| **Error Page** | `/error` | Something went wrong | → Dashboard |
| **Maintenance** | `/maintenance` | During updates | → Refresh |
| **Sync Status** | `/status` | Email sync progress | → Dashboard |

### **Page Flow Examples**

**New User Flow:**