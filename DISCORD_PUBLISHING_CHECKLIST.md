# Discord Activity Library Publishing Checklist

## You Have

- [x] Discord SDK integration (`@discord/embedded-app-sdk`)
- [x] OAuth token exchange
- [x] User authentication
- [x] Working multiplayer game

## Missing / Needs Verification

### 1. Privacy Policy

- [ ] Create and host a publicly accessible Privacy Policy
- [ ] Link it in Discord Developer Portal

### 2. Terms of Service

- [ ] Create and host a publicly accessible Terms of Service
- [ ] Link it in Discord Developer Portal

### 3. Identity Verification via Stripe

- [ ] Complete identity verification through Stripe
- [ ] Need valid government ID

### 4. Support Server

- [ ] Create a Discord support server where users can get help
- [ ] Link it in Developer Portal

### 5. App Profile Assets (Developer Portal → Discovery tab)

- [ ] **App Icon** - Replace vite.svg placeholder with proper game icon
- [ ] **Cover Image** - Required for App Directory listing
- [ ] **App Description** - Expand the basic description for the Directory

### 6. Mobile Optimization (2025 requirement)

- [ ] Safe Area handling for notches/home bars
- [ ] Touch event listeners
- [ ] Mobile-responsive UI

### 7. Age Rating Compliance

- [ ] Content must be appropriate for 13+ audiences
- [ ] No age-restricted content

## Developer Portal Verification Checklist

Go to **Discord Developer Portal → Your App → App Verification** and ensure all items are green:

1. [ ] Connected Privacy Policy URL
2. [ ] Connected Terms of Service URL
3. [ ] Identity verification (Stripe)
4. [ ] Support server set up
5. [ ] App description filled out

## Enabling Discovery

After verification, enable **Discovery** in the Discovery tab:

- [ ] All required profile fields completed
- [ ] Cover images uploaded
- [ ] Detailed description

## Resources

- [How Do I Get My App Verified?](https://support-dev.discord.com/hc/en-us/articles/23926564536471-How-Do-I-Get-My-App-Verified)
- [What are Verified and Unverified Activities?](https://support-dev.discord.com/hc/en-us/articles/26576097154199-What-are-Verified-and-Unverified-Activities)
- [How Can Users Discover My Activity?](https://support-dev.discord.com/hc/en-us/articles/21204493235991-How-Can-Users-Discover-and-Play-My-Activity)
- [App Directory Content Requirements Policy](https://support-dev.discord.com/hc/en-us/articles/9489299950487-App-Directory-App-Content-Requirements-Policy)
