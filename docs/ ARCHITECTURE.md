# WebPages SaaS Platform Architecture

**Version:** Foundation v1.0

---

# Overview

WebPages is a multi-tenant SaaS website builder.

The platform consists of three major layers:

1. Public WebPages Website
2. SaaS Platform
3. Customer Websites

Every customer website is isolated while sharing the same builder architecture.

---

# Platform Structure

```
Internet
        │
        ▼
 Public WebPages Website (/)
        │
 ┌──────┴─────────┐
 ▼                ▼
Login          Register
        │
        ▼
 SaaS Dashboard (/app)
        │
        ▼
 My Websites
        │
        ▼
 Website Builder
```

---

# Platform Routes

Public

```
/
```

Authentication

```
/login
/register
```

Customer Dashboard

```
/app
/app/websites
```

Super Admin

```
/admin
/admin/users
/admin/websites
```

Root Website Builder

```
/dashboard
```

Website Builder

```
/app/websites/<slug>/builder
```

Website Preview

```
/app/websites/<slug>/preview
```

Website Settings

```
/app/websites/<slug>/settings
```

---

# User Types

## Visitor

Can browse the public WebPages website.

---

## Customer

Owns one or more websites.

Can:

- Create websites
- Edit own websites
- Configure settings
- Configure domains
- Preview websites

Cannot access other users' websites.

---

## Super Admin

Can:

- Manage users
- View all websites
- Edit any website
- Manage the platform
- Edit the Root Website

Super Admin may also own personal websites.

---

# Website Isolation

Every website has independent builder data.

Storage:

```
data/websites/<websiteId>/
```

Files:

```
builder-layouts.json
builder-pages.json
builder-shell.json
```

Every website has independent:

- layouts
- pages
- menus
- global styles
- header
- footer
- shell settings

---

# Public Website

The WebPages marketing website currently lives at:

```
/
```

Purpose:

- marketing
- pricing
- documentation
- login
- registration

Current editing:

```
/dashboard
```

Future goal:

The Root Website will eventually become a normal Super Admin-owned website using the same builder as every customer website.

---

# Domain Management

Each website may have:

- Primary Domain
- Additional Domains

Host routing resolves domains to the correct website.

Duplicate domains are not allowed.

Future versions will include:

- DNS verification
- SSL monitoring
- Cloudflare integration

---

# Design Philosophy

WebPages follows one fundamental rule:

> One Builder. One Website Model.

Every customer website should behave identically.

Special cases should be avoided whenever possible.

---

# Guiding Principles

- Website isolation first.
- Keep architecture simple.
- Prefer evolution over rewrites.
- Fix regressions before adding features.
- Every improvement should benefit future websites.

---

# Foundation Milestone

Completed:

- SaaS Authentication
- Website Ownership
- Website Builder Isolation
- Website Preview
- Website Settings
- Domain Management MVP
- Super Admin Dashboard
- Customer Dashboard
- Host-based Website Resolution
- Public/SaaS Layout Separation