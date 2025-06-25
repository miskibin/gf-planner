# GF Planning App �

A minimal React Native Expo app for managing your girlfriend's events, wishlist items, and things she likes.

## Features ✨

- **📅 Events** - Track important dates with smart badges showing "Today", "Tomorrow", "In X days"
- **💝 Wishlist** - Items with priority levels (high/medium/low) 
- **⭐ What She Likes** - Remember her preferences and favorites
- **🔔 Notifications** - Get reminded about upcoming events with "Don't forget me" messages
- **📱 Modern UI** - Clean, intuitive design with calendar date picker

## How to Run 🚀

```bash
npm install
npm start
```

Then scan the QR code with Expo Go app on your phone.

## Important Notes 📋

**Notifications in Expo Go:**
- Push notifications have limited functionality in Expo Go
- For full notification features, create a development build:
  ```bash
  npx expo install --fix
  npx expo run:android  # or expo run:ios
  ```

**Testing Notifications:**
- In Expo Go: Notifications will show immediately when you add events that are today/tomorrow
- In development build: Full scheduling with proper timing works

## App Structure 📁

```
types/index.ts          - Shared Item interface
utils/storage.ts        - AsyncStorage functions  
utils/dateUtils.ts      - Date calculations & badges
utils/notifications.ts  - Notification scheduling
components/ListView.tsx - Shared list component
components/EditModal.tsx - Shared edit modal with calendar
app/(tabs)/             - 3 tab screens (Events, Wishlist, Likes)
```

## Usage Tips 💡

1. **Add Events**: Use the calendar picker for dates, get automatic badges
2. **Set Priorities**: Wishlist items have color-coded priority levels  
3. **Quick Delete**: Tap the trash icon to delete items
4. **Edit Items**: Tap anywhere on an item to edit it
5. **Notifications**: Events scheduled for today/tomorrow will trigger reminders

Built with ❤️ for keeping track of what matters most!
