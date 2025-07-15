# 🤖 GitHub Copilot - Project Instructions

## 📁 **Project Structure Requirements**

This is a **React Native/Expo TypeScript** project. Always maintain and follow this folder structure:

```
frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── shared/         # Components used across multiple screens
│   │   └── platform/       # Platform-specific components (iOS/Android)
│   ├── screens/            # Screen components (pages)
│   ├── layouts/            # Layout components (headers, navigation)
│   ├── styles/             # Shared styles, themes, colors
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── themes.ts
│   ├── utils/              # Helper functions, utilities
│   ├── constants/          # App constants, configurations
│   └── types/              # TypeScript type definitions
├── assets/                 # Images, icons, fonts
├── App.tsx                 # Main app component
├── App.styles.ts           # Main app styles
└── package.json
```

## 🎯 **File Organization Rules**

### **1. Components**

- **Shared components** → `app/components/shared/`
- **Platform-specific** → `app/components/platform/ComponentName.ios.tsx` | `ComponentName.android.tsx`
- Use PascalCase for component names
- Each component should have its own folder if it has multiple files

### **2. Screens**

- All screen components → `app/screens/`
- Use PascalCase: `Home.tsx`, `Profile.tsx`, `Settings.tsx`

### **3. Styles**

- Component-specific styles → Same folder as component with `.styles.ts` suffix
- Global styles → `app/styles/`
- Main app styles → `App.styles.ts` (root level)

### **4. Types**

- All TypeScript interfaces/types → `app/types/`
- Use descriptive names: `User.types.ts`, `Navigation.types.ts`

### **5. Utils**

- Helper functions → `app/utils/`
- API calls → `app/utils/api.ts`
- Validation → `app/utils/validation.ts`

## ⚡ **Coding Standards**

### **React Native Best Practices:**

- Always use functional components with hooks
- Use `StyleSheet.create()` for styles
- Import React Native components from 'react-native'
- Use TypeScript for all files
- Export default for main component, named exports for utilities

### **File Naming:**

- Components: `PascalCase.tsx`
- Styles: `PascalCase.styles.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase.types.ts`

### **Import Order:**

1. React & React Native imports
2. Third-party libraries
3. Local components
4. Types
5. Styles

## 🔧 **When Creating/Moving Files:**

1. **Always check** if the target folder exists, create if needed
2. **Update all imports** in affected files
3. **Maintain the structure** - don't put files in wrong folders
4. **Ask before breaking changes** if unsure about file placement

## 📱 **Platform Considerations:**

- Write cross-platform code by default
- Use `.ios.tsx` / `.android.tsx` only when necessary
- Test on both platforms when making changes
- Use `Platform.OS` for small platform differences

## 🚨 **Never Do:**

- Don't put screens in components folder
- Don't put styles in random locations
- Don't create files without proper folder structure
- Don't break existing import paths without updating them

---

**Remember:** This project should work seamlessly on both iOS and Android. Keep the code clean, organized, and following these guidelines!
