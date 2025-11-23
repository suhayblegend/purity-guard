# 🚀 GitHub Pages Setup Guide for Purity Guard

## Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository Settings**:
   - **Name**: `purity-guard` (lowercase, use hyphens)
   - **Description**: "🛡️ A privacy-first Chrome extension that blocks harmful content with Islamic reminders"
   - **Visibility**: ✅ **PUBLIC** (recommended)
   - **Initialize**: ❌ Do NOT check "Add README" (we'll push our own)
3. **Click**: "Create repository"

---

## Step 2: Prepare Your Files

Before pushing to GitHub, you need to organize files for GitHub Pages:

### **Files to Include in Repo:**
```
✅ landing.html          (rename to index.html for GitHub Pages)
✅ privacy.html          (your privacy policy page)
✅ icons/                (folder with all icons)
✅ README.md             (create a good README)
✅ LICENSE               (optional but recommended)
✅ .gitignore            (to exclude unnecessary files)
```

### **Extension Files (Optional in Repo):**
You can include your extension files too:
```
✅ manifest.json
✅ background.js
✅ popup.html
✅ popup.js
✅ options.html
✅ options.js
✅ block_page.html
✅ block_page.js
✅ content.js
✅ etc...
```

---

## Step 3: Initialize Git & Push to GitHub

Open PowerShell in your project folder and run these commands:

### **A. Rename landing.html to index.html** (GitHub Pages requirement)
```powershell
Rename-Item "landing.html" "index.html"
```

### **B. Create .gitignore file**
```powershell
@"
# OS Files
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/

# Temporary
*.log
*.tmp
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
```

### **C. Initialize Git**
```powershell
git init
git add .
git commit -m "Initial commit: Purity Guard v3.4.0"
```

### **D. Connect to GitHub** (replace YOUR-USERNAME)
```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/purity-guard.git
git push -u origin main
```

**Note**: GitHub will ask you to authenticate. Use your GitHub username and a **Personal Access Token** (not password).

---

## Step 4: Enable GitHub Pages

1. **Go to your repo**: `https://github.com/YOUR-USERNAME/purity-guard`
2. **Click**: "Settings" (top menu)
3. **Scroll to**: "Pages" (left sidebar under "Code and automation")
4. **Configure**:
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` (or `master`)
   - **Folder**: Select `/ (root)`
5. **Click**: "Save"
6. **Wait 1-2 minutes** for deployment

---

## Step 5: Access Your Live Site

Your site will be live at:
```
https://YOUR-USERNAME.github.io/purity-guard/
```

**Pages:**
- **Landing Page**: `https://YOUR-USERNAME.github.io/purity-guard/`
- **Privacy Policy**: `https://YOUR-USERNAME.github.io/purity-guard/privacy.html`

---

## Step 6: Update Links in Your Files

Now that you have your GitHub Pages URL, update these files:

### **1. Update index.html (formerly landing.html)**
Replace:
- `YOUR-USERNAME` → Your actual GitHub username
- `YOUR-EXTENSION-ID` → Your Chrome Web Store extension ID (after publishing)

### **2. Update privacy.html**
Replace:
- `YOUR-USERNAME` → Your actual GitHub username

### **3. Commit and Push Changes**
```powershell
git add .
git commit -m "Update URLs with actual GitHub username"
git push
```

---

## Step 7: Custom Domain (Optional)

If you want a custom domain like `purityguard.com`:

1. **Buy a domain** (Namecheap, Google Domains, etc.)
2. **In GitHub Settings → Pages**:
   - Add your custom domain
   - Enable "Enforce HTTPS"
3. **In your domain registrar**:
   - Add CNAME record pointing to `YOUR-USERNAME.github.io`

---

## 📝 Create a Good README.md

Create a professional README for your repo:

```markdown
# 🛡️ Purity Guard

> A privacy-first Chrome extension that blocks harmful content with Islamic reminders

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/YOUR-EXTENSION-ID)](https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚫 Smart content blocking
- 📖 Islamic reminders (Quran & Hadith)
- 🔊 Quran audio recitation
- 📊 Progress tracking
- 💰 Sadaqah accountability
- 📱 Telegram alerts
- 🔒 100% Privacy-first

## 🚀 Installation

### From Chrome Web Store
1. Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID)
2. Click "Add to Chrome"
3. Configure your preferences

### From Source (Developers)
1. Clone this repository
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## 📖 Documentation

- [Website](https://YOUR-USERNAME.github.io/purity-guard/)
- [Privacy Policy](https://YOUR-USERNAME.github.io/purity-guard/privacy.html)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- Email: suhaybdahir22@gmail.com
- Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/purity-guard/issues)

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Support

If this extension helps you, please:
- ⭐ Star this repository
- 📢 Share with others
- 🐛 Report bugs
- 💡 Suggest features

---

Made with ❤️ for the Ummah
```

---

## 🔧 Troubleshooting

### **Issue: "Page not found"**
- Wait 5 minutes after enabling Pages
- Make sure your file is named `index.html` (not `landing.html`)
- Check Settings → Pages shows "Your site is live at..."

### **Issue: "Icons not loading"**
- Make sure `icons/` folder is in your repo
- Check file paths in HTML are correct: `icons/logo-128.png`

### **Issue: "Privacy page 404"**
- Make sure `privacy.html` is in the root folder
- Push the file to GitHub: `git add privacy.html && git commit -m "Add privacy page" && git push`

---

## 📊 After Setup

1. ✅ Update Chrome Web Store listing with your GitHub Pages URL
2. ✅ Add privacy policy URL to Chrome Web Store (required)
3. ✅ Share your website link in README.md
4. ✅ Test all links on your live site
5. ✅ Update social media with your website

---

## 🎉 You're Done!

Your Purity Guard website is now live on the internet for FREE! 

Share it with the world:
- Twitter: "Check out Purity Guard - a privacy-first Chrome extension 🛡️ https://YOUR-USERNAME.github.io/purity-guard/"
- Reddit: Post in r/chrome, r/islam, r/productivity
- Email signature: Link to your site

---

**Need Help?** Open an issue on GitHub or email suhaybdahir22@gmail.com
