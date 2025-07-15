# 🤖 GitHub Copilot - Project Instructions

## 📁 **Project Structure Requirements**

This is a **full-stack QR Loyalty Platform** with **React Native/Expo TypeScript frontend** and **FastAPI Python backend**. Always maintain and follow these folder structures:

### **🎯 FRONTEND (React Native/Expo TypeScript)**

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

---

## ⚡ **Coding Standards**

### **🎯 FRONTEND - React Native Best Practices:**

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
## 🚨 **Never Do:**

### **Frontend:**

- Don't put screens in components folder
- Don't put styles in random locations
- Don't create files without proper folder structure
- Don't break existing import paths without updating them
- **Don't use raw React Native components** when Gluestack UI equivalent exists
- **Don't use StyleSheet.create** for styling - use Tailwind classes
- **Don't use custom colors** - stick to the defined palette in `tailwind.config.js`
- **Don't mix `style` prop with `className`** - choose one approach consistently

---

## 🎨 **Design System Consistency:**

### **Frontend Colors to Use:**

- **Primary Actions**: `bg-primary-400`, `text-primary-400`
- **Secondary Actions**: `bg-secondary-100`, `text-secondary-600`
- **Success States**: `bg-success-100`, `text-success-700`
- **Error States**: `bg-error-100`, `text-error-700`
- **Backgrounds**: `bg-background-50`, `bg-background-0` (white)
- **Text**: `text-typography-800` (dark), `text-typography-600` (medium)


### **Adding New Libraries:**

#### **Frontend:**

- **Always check** if Gluestack UI has the component first
- **Prefer libraries** that work well with Tailwind CSS
- **Document new components** in the project if they become standard
- **Ask before adding** major UI libraries that might conflict

---

## 🏗️ **Architecture Principles:**

### **Full-Stack Consistency:**

- **Error Handling**: Frontend displays user-friendly messages from backend error codes
- **Data Models**: Pydantic schemas match TypeScript interfaces
- **Authentication**: JWT tokens work seamlessly between frontend/backend
- **API Contracts**: OpenAPI spec serves as single source of truth

### **Performance Standards:**

- **Database Queries**: Optimize with proper indexes and relationships
- **API Response Times**: Target <200ms for most endpoints
- **Mobile App**: Smooth 60fps animations and instant feedback
- **Caching**: Strategic caching for frequently accessed data

### **Security First:**

- **Input Validation**: All data validated at API boundary
- **Authentication**: Secure JWT implementation with refresh tokens
- **Authorization**: Role-based access control for restaurant owners
- **Data Privacy**: GDPR-compliant data handling practices

---

**Remember:** This is a professional QR Loyalty Platform serving real restaurants and customers. The code must be:

- **Production-ready** with proper error handling and logging
- **Scalable** to handle multiple restaurants and thousands of users
- **Maintainable** with clear separation of concerns
- **Secure** with industry-standard authentication and data protection
- **User-friendly** with intuitive interfaces for both customers and restaurant owners

Always prioritize:

- **Frontend**: Gluestack UI components with Tailwind styling for consistency
- **Backend**: FastAPI with async/await, proper typing, and domain-driven architecture
- **Database**: PostgreSQL with proper relationships and migrations
- **API Design**: RESTful endpoints with clear documentation and error handling
