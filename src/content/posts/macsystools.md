---
title: "MacSysTools — Native macOS System Administration App"
description: "A native macOS system administration app built with SwiftUI + Xcode for macOS Tahoe. 23 tools, one click away — because the frustration wasn't Terminal, it was remembering the syntax."
pubDate: 2026-03-05
author: "Lionel Mosley"
tags: ["macOS", "SwiftUI", "Developer Tools", "Open Source"]
cover: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=75&auto=format&fit=crop"
ogImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=75&auto=format&fit=crop"
recommend: false
pinned: false
draft: false
postType: "coverTop"
---

> *I enjoy working with different computing platforms. When using my MacBook Pro — switching between PowerShell and Terminal — I often forget commands like Flush DNS Cache. Rather than reaching for my notes every time, I opened Xcode and built the solution.*

## What is MacSysTools?

MacSysTools is a native macOS system administration application built specifically for **macOS Tahoe (26.x)** running on an Intel MacBook Pro.

It provides a clean, professional graphical interface for common macOS Terminal commands — eliminating the need to remember complex command syntax or open Terminal manually. Every tool is one click away, with live output streaming, native sudo elevation, and a UI that feels indistinguishable from a first-party Apple application.

**The core philosophy:** encode the knowledge of *what command to run and when*, not just how. The app handles version detection, privilege elevation, output parsing, and error display — the user selects a tool and clicks Run.

**Repository:** [github.com/trust-lionel/macsystools](https://github.com/trust-lionel/macsystools)

---

## Why SwiftUI + Xcode Instead of Electron

**Liquid Glass.** macOS Tahoe introduced the most significant visual redesign since Big Sur, built around a new material called Liquid Glass. SwiftUI gets this automatically and correctly — Electron required undocumented private APIs that could break with any macOS point release.

**Native performance.** The MacSysTools app bundle is approximately 8MB. An equivalent Electron app would be roughly 150MB due to the bundled Chromium runtime.

**Finder, Spotlight, and Dock integration.** A SwiftUI app built with Xcode produces a proper `.app` bundle the OS recognizes natively — it appears in Spotlight search, pins to the Dock, and launches in under a second.

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
| Enable Screen Sharing | `sudo launchctl enable system/com.apple.screensharing` | Yes |
| Enable Remote Login | `sudo systemsetup -setremotelogin on` | Yes |
| Enable File Sharing | `sudo launchctl enable system/com.apple.smbd` | Yes |

---

## The Takeaway

This project is a good example of how I think about problems. The frustration wasn't Terminal — Terminal is powerful. The frustration was the cognitive overhead of remembering syntax for commands I use infrequently. The solution wasn't a notes app or a cheat sheet. The solution was encoding the knowledge into a tool that eliminates the question entirely.

That's the difference between a workaround and an architecture.
