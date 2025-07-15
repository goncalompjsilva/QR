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

### **UI Framework & Styling Requirements:**

#### **🎨 Gluestack UI Components (MANDATORY)**

- **ALWAYS use Gluestack UI components** from `app/components/` instead of basic React Native components
- **Available components**: Box, Text, Button, Input, VStack, HStack, Center, Avatar, Alert, Modal, Toast, etc.
- **Import path**: `import { ComponentName } from '../components/component-name';`
- **DO NOT** use raw `<View>`, `<Text>`, or `<TouchableOpacity>` - use `<Box>`, `<Text>`, `<Pressable>` instead

#### **🎯 Tailwind CSS Styling (MANDATORY)**

- **ALWAYS use Tailwind classes** via `className` prop instead of StyleSheet
- **Color palette**: Use our orange-centered palette from `tailwind.config.js`
  - Primary: `primary-400` (#f97316) for main actions
  - Secondary: `secondary-*` for neutral elements
  - Success: `success-*` for positive actions
  - Error: `error-*` for validation/warnings
- **Typography**: Use `text-xs`, `text-sm`, `text-md`, `text-lg`, `text-xl`
- **Spacing**: Use `p-*`, `m-*`, `gap-*` classes
- **Rounded corners**: Use `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`

#### **✅ Correct Usage Examples:**

```tsx
// ✅ CORRECT - Gluestack + Tailwind
<Box className="bg-primary-50 p-4 rounded-lg">
  <Text className="text-lg text-primary-700">Welcome!</Text>
  <Button className="bg-primary-400 rounded-md">
    <Text className="text-white">Scan QR</Text>
  </Button>
</Box>

// ✅ CORRECT - Layout with VStack/HStack
<VStack className="gap-4 p-6">
  <HStack className="gap-2 items-center">
    <Avatar className="w-12 h-12" />
    <Text className="text-md">Restaurant Name</Text>
  </HStack>
</VStack>
```

#### **❌ Avoid These Patterns:**

```tsx
// ❌ WRONG - Don't use raw React Native components
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>

// ❌ WRONG - Don't use StyleSheet.create with Gluestack
const styles = StyleSheet.create({
  container: { padding: 16 }
});

// ❌ WRONG - Don't mix style prop with className
<Box style={{padding: 16}} className="bg-primary-100">
```

### **File Naming:**

- Components: `PascalCase.tsx`
- Styles: `PascalCase.styles.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase.types.ts`

### **Import Order:**

1. React & React Native imports
2. Third-party libraries
3. **Gluestack UI components** (from `app/components/`)
4. Local components
5. Types
6. Styles (if needed for non-Gluestack components)

### **Component Import Examples:**

```tsx
// ✅ CORRECT Import Pattern
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Box } from "../components/box";
import { Text } from "../components/text";
import { Button } from "../components/button";
import { VStack } from "../components/vstack";
import { UserProfile } from "../components/shared/UserProfile";
import { User } from "../types/User.types";
```

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
- **Don't use raw React Native components** when Gluestack UI equivalent exists
- **Don't use StyleSheet.create** for styling - use Tailwind classes
- **Don't use custom colors** - stick to the defined palette in `tailwind.config.js`
- **Don't mix `style` prop with `className`** - choose one approach consistently

## 🎨 **Design System Consistency:**

### **Colors to Use:**

- **Primary Actions**: `bg-primary-400`, `text-primary-400`
- **Secondary Actions**: `bg-secondary-100`, `text-secondary-600`
- **Success States**: `bg-success-100`, `text-success-700`
- **Error States**: `bg-error-100`, `text-error-700`
- **Backgrounds**: `bg-background-50`, `bg-background-0` (white)
- **Text**: `text-typography-800` (dark), `text-typography-600` (medium)

### **Adding New Libraries:**

- **Always check** if Gluestack UI has the component first
- **Prefer libraries** that work well with Tailwind CSS
- **Document new components** in the project if they become standard
- **Ask before adding** major UI libraries that might conflict

---

**Remember:** This project should work seamlessly on both iOS and Android. Keep the code clean, organized, and following these guidelines! Always prioritize Gluestack UI components with Tailwind styling for consistency across the entire QR Loyalty Platform.
