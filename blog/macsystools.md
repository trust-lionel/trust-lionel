---
layout: post
title: "MacSysTools"
description: "A native macOS system administration app built with SwiftUI + Xcode for macOS Tahoe — eliminating the need to remember Terminal command syntax."
tags: [macOS, SwiftUI, Xcode, macOS-Tahoe, system-administration, developer-tools, networking]
---

<!--
  SEO Meta: MacSysTools | macOS System Administration App | SwiftUI | Xcode | macOS Tahoe
  Keywords: MacSysTools, macOS Tahoe, SwiftUI, Xcode, system administration, macOS tools,
            Flush DNS Cache, macOS terminal commands, Lionel Mosley, ahr-ki-tekt, trust-lionel.com,
            Intel MacBook Pro, native macOS app, Liquid Glass, macOS 26
-->

<div align="center">
<a href="/">← Previous</a> &nbsp;·&nbsp; <a href="/">🏠 Home</a> &nbsp;·&nbsp; <a href="/blog/vibe-coding.html">Next →</a>
</div>

---

# MacSysTools

**Published:** March 05, 2026 &nbsp;·&nbsp; **Author:** [Lionel Mosley](https://github.com/trust-lionel) &nbsp;·&nbsp; **Platform:** macOS Tahoe 26.x · Intel MacBook Pro

**Tags:**
![macOS](https://img.shields.io/badge/macOS-F0F0F0?style=flat-square&logo=apple&logoColor=1A1A1A)&nbsp;
![SwiftUI](https://img.shields.io/badge/SwiftUI-E8F4FF?style=flat-square&logo=swift&logoColor=F05138)&nbsp;
![Xcode](https://img.shields.io/badge/Xcode-E8F0FB?style=flat-square&logo=xcode&logoColor=1472F0)&nbsp;
![macOS Tahoe](https://img.shields.io/badge/macOS%20Tahoe-F0F0F0?style=flat-square&logo=apple&logoColor=1A1A1A)&nbsp;
![System Administration](https://img.shields.io/badge/System%20Administration-F0FFF4?style=flat-square&logo=gnometerminal&logoColor=00C853)&nbsp;
![Developer Tools](https://img.shields.io/badge/Developer%20Tools-FFF8E8?style=flat-square&logo=visualstudiocode&logoColor=FF8C00)&nbsp;
![Networking](https://img.shields.io/badge/Networking-F0F4FF?style=flat-square&logo=cisco&logoColor=1BA0D7)

---

> *I enjoy working with different computing platforms. When using my MacBook Pro — switching between PowerShell and Terminal — I often forget commands like Flush DNS Cache. Rather than reaching for my notes every time, I opened Xcode and built the solution.*

---

## What is MacSysTools?

MacSysTools is a native macOS system administration application built specifically for **macOS Tahoe (26.x)** running on an Intel MacBook Pro.

It provides a clean, professional graphical interface for common macOS Terminal commands — eliminating the need to remember complex command syntax or open Terminal manually. Every tool is one click away, with live output streaming, native sudo elevation, and a UI that feels indistinguishable from a first-party Apple application.

**The core philosophy:** encode the knowledge of *what command to run and when*, not just how. The app handles version detection, privilege elevation, output parsing, and error display — the user selects a tool and clicks Run.

**Repository:** [github.com/trust-lionel/macsystools](https://github.com/trust-lionel/macsystools)

---

## Why SwiftUI + Xcode Instead of Electron

The project started as a brainstorm around Electron. After evaluating both options, SwiftUI + Xcode won for three decisive reasons:

**Liquid Glass.** macOS Tahoe introduced the most significant visual redesign since Big Sur, built around a new material called Liquid Glass. SwiftUI gets this automatically and correctly — Electron required undocumented private APIs that could break with any macOS point release.

**Native performance.** The MacSysTools app bundle is approximately 8MB. An equivalent Electron app would be roughly 150MB due to the bundled Chromium runtime.

**Finder, Spotlight, and Dock integration.** A SwiftUI app built with Xcode produces a proper `.app` bundle the OS recognizes natively — it appears in Spotlight search, pins to the Dock, and launches in under a second. No additional packaging or configuration required.

---

## Development Environment

| Component | Version |
|---|---|
| Mac | MacBook Pro Intel (x86_64) |
| macOS | Tahoe 26.x |
| Xcode | 26.4.1 (17E202) |
| Swift | 6.3.1 |
| Interface | SwiftUI |
| Deployment Target | macOS 26.0 |
| Bundle ID | com.lionelmosley.MacSysTools |

---

## Design Principles

**Apple Human Interface Guidelines (HIG).** Every design decision follows Apple's HIG — 13px base font size using `-apple-system`, native `NavigationSplitView` for the sidebar layout, SF Symbols for all icons, grouped form controls, and correct cursor behavior on interactive elements.

**Liquid Glass sidebar.** The `NavigationSplitView` with `.listStyle(.sidebar)` automatically applies Tahoe's Liquid Glass material to the sidebar — the desktop wallpaper refracts through it exactly like Finder, Mail, and System Settings.

**Native sudo elevation.** Commands requiring administrator privileges use `osascript` with `with administrator privileges` — this triggers the native macOS authentication dialog. Passwords are never handled, stored, or logged by the app.

**Live output streaming.** The `ShellRunner` class uses `Process()` with `Pipe()` and `readabilityHandler` to stream stdout line-by-line into the UI as commands execute — no waiting for completion before seeing results.

---

## Project File Structure

**GitHub:** [github.com/trust-lionel/macsystools](https://github.com/trust-lionel/macsystools)

```
MacSysTools/
├── MacSysToolsApp.swift      — @main entry point
├── ContentView.swift         — NavigationSplitView root layout
├── SidebarView.swift         — Left panel, tools grouped by category
├── DetailView.swift          — Right panel, routes to correct view
├── InputToolView.swift       — Input fields for tools requiring parameters
├── ShellRunner.swift         — Async command engine, live output streaming
├── PrivilegedRunner.swift    — sudo elevation via osascript
├── Tool.swift                — Master enum of all 23 tools and their properties
└── Assets.xcassets           — App icon (>_ terminal prompt on dark navy)
```

---

## The 23 Tools

### Network (6 tools)

| Tool | Command | Sudo |
|---|---|---|
| Flush DNS Cache | `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` | Yes |
| nslookup | `nslookup -type=[A/MX/TXT…] [hostname] [server]` | No |
| Wi-Fi Diagnostics | `networksetup -getinfo Wi-Fi && airport -I` | No |
| Ping Host | `ping -c [count] [hostname/IP]` | No |
| Traceroute | `traceroute [hostname/IP]` | No |
| Renew DHCP Lease | `sudo ipconfig set en0 DHCP` | Yes |

> `nslookup` features a full input form — hostname field, record type picker (A, AAAA, MX, TXT, CNAME, NS, ANY), and DNS server field pre-populated with Google's 8.8.8.8. `Ping Host` accepts a hostname or IP and a configurable packet count.

### System (6 tools)

| Tool | Command | Sudo |
|---|---|---|
| Purge Memory | `sudo purge` | Yes |
| Disk Permissions | `diskutil verifyPermissions /` | Yes |
| Clear System Logs | `sudo rm -rf /private/var/log/asl/*.asl` | Yes |
| Rebuild Spotlight | `sudo mdutil -E /` | Yes |
| Show Open Ports | `sudo lsof -i -n -P \| grep LISTEN` | Yes |
| Clear Font Cache | `sudo atsutil databases -remove && sudo atsutil server -shutdown` | Yes |

### Security (4 tools)

| Tool | Command | Sudo |
|---|---|---|
| Kill Process | `killall [process name]` | No |
| Firewall Status | `/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate` | No |
| Gatekeeper Status | `spctl --status` | No |
| Clear App Cache | `rm -rf ~/Library/Caches/*` | No |

> `Kill Process` features an input field accepting the exact process name as shown in Activity Monitor — for example `Finder`, `Safari`, or `Dock`.

### Developer (4 tools)

| Tool | Command | Sudo |
|---|---|---|
| Clear Xcode Derived Data | `rm -rf ~/Library/Developer/Xcode/DerivedData` | No |
| Show Hidden Files | `defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder` | No |
| Edit /etc/hosts | `open -e /etc/hosts` | No |
| System Information | `system_profiler SPHardwareDataType SPSoftwareDataType` | No |

### Sharing (3 tools)

| Tool | Command | Sudo |
|---|---|---|
| Enable Screen Sharing | `sudo launchctl enable system/com.apple.screensharing && sudo launchctl load -w …` | Yes |
| Enable Remote Login | `sudo systemsetup -setremotelogin on` | Yes |
| Enable File Sharing | `sudo launchctl enable system/com.apple.smbd && sudo launchctl load -w …` | Yes |

> **Tahoe note:** Screen Sharing on macOS Tahoe requires a user to be logged in due to a security change Apple introduced in Tahoe 26. The `launchctl` commands function correctly but the session must be active.

---

## The Takeaway

This project is a good example of how I think about problems. The frustration wasn't Terminal — Terminal is powerful. The frustration was the cognitive overhead of remembering syntax for commands I use infrequently. The solution wasn't a notes app or a cheat sheet. The solution was encoding the knowledge into a tool that eliminates the question entirely.

That's the difference between a workaround and an architecture.

---

<div align="center">

<a href="/">← Previous</a> &nbsp;·&nbsp; <a href="/">🏠 Home</a> &nbsp;·&nbsp; <a href="/blog/vibe-coding.html">Next →</a>

<hr/>

<em>Published March 05, 2026 &nbsp;·&nbsp; <a href="https://github.com/trust-lionel">Lionel Mosley</a> &nbsp;·&nbsp; ahr-ki-tekt</em>

<br/><br/>

<a href="https://linkedin.com/in/lionelmosley"><img src="https://img.shields.io/badge/LinkedIn-E8F0FB?style=for-the-badge&logo=linkedin&logoColor=0A66C2" alt="LinkedIn" /></a>&nbsp;
<a href="https://github.com/4thandbailey"><img src="https://img.shields.io/badge/4TH%20AND%20BAILEY-F0F0F0?style=for-the-badge&logo=github&logoColor=1A1A1A" alt="4TH AND BAILEY" /></a>&nbsp;
<a href="https://reddit.com/u/trust-lionel"><img src="https://img.shields.io/badge/Reddit-FFF0E8?style=for-the-badge&logo=reddit&logoColor=FF4500" alt="Reddit" /></a>

<br/><br/>

<sub>© 2026 Lionel Mosley &nbsp;·&nbsp; Houston, TX &nbsp;·&nbsp; Serving Organizations Nationwide</sub>

</div>
