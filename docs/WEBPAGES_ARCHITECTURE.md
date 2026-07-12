# WebPages Architecture

Version: 1.0
Status: Living Architecture Document

---

# Vision

WebPages is a multi-tenant SaaS platform that enables businesses to create, manage, and continuously evolve professional websites through a unified visual builder.

The platform combines a Website Builder, SaaS management, and WordPress/WooCommerce integration into a single ecosystem while hiding technical complexity from end users.

The goal is not simply to build websites.

The goal is to provide an enjoyable subscription service where professional websites can be created, managed, improved, and expanded over time.

---

# Core Philosophy

WebPages follows one simple philosophy:

> Make website creation feel simple without sacrificing flexibility.

Users should think about:

- Websites
- Pages
- Content
- Design

They should not need to think about:

- React
- WordPress
- WooCommerce
- Routing
- JSON structures
- APIs

The platform should hide complexity while remaining powerful.

---

# Platform Overview

The platform consists of three major layers.

```
Internet
        │
        ▼
 Public WebPages Website
        │
 ┌──────┴─────────┐
 ▼                ▼
Login          Register
        │
        ▼
 SaaS Platform
        │
        ▼
Customer Websites
```

---

# Platform Components

## Public Website

Purpose:

- Marketing
- Pricing
- Documentation
- Login
- Registration

The public website represents the WebPages platform.

---

## SaaS Platform

Purpose:

- User management
- Website management
- Subscription management
- Website Builder
- Global settings
- Customer dashboard
- Super Admin dashboard

The SaaS platform is responsible for managing customer websites.

---

## Customer Websites

Every customer owns one or more completely isolated websites.

Each website contains its own:

- Builder layouts
- Pages
- Menus
- Global styles
- Header
- Footer
- Domains
- Future subscription settings

Every website behaves as an independent website while sharing the same builder architecture.

---

# User Types

## Visitor

Can browse the public WebPages website.

Cannot access customer resources.

---

## Customer

May own one or more websites.

Can:

- Create websites
- Edit owned websites
- Configure website settings
- Preview websites
- Manage domains

Cannot access websites owned by other users.

---

## Super Admin

Can:

- Manage the platform
- Manage users
- Manage subscriptions
- View all websites
- Edit any website
- Configure platform settings

The Super Admin may also own normal customer websites.

---

# Website Model

Every website follows exactly the same internal model.

The Root Website is not a different architecture.

Business websites are not a different architecture.

E-Commerce websites are not a different architecture.

Future Blog websites are not a different architecture.

Differences between website types should be expressed through configuration and enabled capabilities rather than separate implementations.

---

# One Builder Principle

There is only one Website Builder.

The builder should never fork into multiple builders such as:

- Business Builder
- Store Builder
- Blog Builder

Instead:

- Features may appear or disappear.
- Dashboard sections may change.
- Available elements may change.

The underlying builder architecture remains identical.

---

# Website Isolation

Website isolation is the foundation of WebPages.

Every website owns its own data.

Typical website resources include:

- Layouts
- Pages
- Menus
- Global styles
- Header
- Footer
- Shell configuration

One website must never accidentally modify another website.

Isolation always has higher priority than convenience.

---

# Dashboard Philosophy

The dashboard should grow through evolution rather than duplication.

Whenever new functionality is added:

Prefer:

- extending existing pages
- extending existing settings
- extending existing cards
- extending existing forms

Avoid:

- duplicate dashboards
- duplicate settings pages
- duplicate workflows

Users should always feel they are using one coherent application.

---

# Component Reuse

Before creating:

- new pages
- new settings sections
- new cards
- new dialogs
- new forms

always check whether an existing component can be extended.

Consistency is more important than creating new UI.

---

# Runtime Data

Runtime website data should remain independent from application source code.

Runtime data includes examples such as:

- website configuration
- domains
- builder content
- future subscriptions
- customer-generated data

Runtime data should never prevent application deployment or Git updates.

The application source and customer data should evolve independently.

---

# Domain Management

Every website may have:

- Primary Domain
- Additional Domains

Host routing resolves incoming requests to the correct website.

Duplicate domains are not allowed.

Future versions may include:

- DNS verification
- SSL monitoring
- Cloudflare integration

---

# WordPress & WooCommerce

WordPress and WooCommerce act as service engines rather than the user experience.

Responsibilities include:

- Products
- Orders
- Customers
- Inventory
- Blog content

The WebPages Builder and SaaS Dashboard remain the primary customer experience.

Whenever possible, users should interact with WebPages rather than directly with WordPress.

---

# Product Evolution

WebPages grows through evolution.

Avoid large rewrites.

When adding features:

- Extend existing systems.
- Preserve architecture.
- Reuse existing components.
- Avoid creating parallel implementations.
- Prefer configuration over duplication.

Every improvement should strengthen the existing platform.

---

# Long-Term Vision

Future systems should integrate naturally into the existing architecture.

Examples include:

- AI Translation
- Booking
- Membership
- CRM
- Email Marketing
- Analytics
- Marketplace
- Automation

Future products should become capabilities of WebPages rather than independent applications.

---

# Guiding Principles

When making architectural decisions, prefer solutions that:

- Reduce complexity
- Reduce duplication
- Reduce clicks
- Reduce configuration
- Increase consistency
- Improve maintainability
- Improve customer experience

Architecture exists to simplify the user experience.

---

# Foundation Status

Current foundation includes:

- Multi-tenant SaaS platform
- Website ownership
- Website isolation
- Visual Website Builder
- Website Preview
- Global Styles
- Website Settings
- Domain Management
- Super Admin Dashboard
- Customer Dashboard
- Backup & Restore
- Layout Library
- Page Templates
- Host-based Website Resolution
- WordPress/WooCommerce integration
- Public Website
- SaaS Dashboard

The foundation should remain stable while future capabilities continue to evolve.

---

# Final Principle

Every new feature should answer one question:

"Does this make creating and managing a website simpler for the customer?"

If the answer is no, reconsider the solution.

The best architecture is the one customers never notice.