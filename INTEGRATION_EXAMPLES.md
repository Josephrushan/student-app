# Push Notification Integration Examples

Complete examples of how to integrate push notifications into your app's features.

---

## 1. Message Notifications

**File:** `components/InboxModule.tsx`

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleSendMessage = async (recipientId: string, messageText: string) => {
  try {
    // Get recipient user
    const recipient = allUsers.find(u => u.id === recipientId);
    if (!recipient) return;

    // 1. Create message object
    const messageId = `msg_${Date.now()}`;
    const message = {
      id: messageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId,
      text: messageText,
      timestamp: Date.now(),
      read: false
    };

    // 2. Save to database
    await saveDoc('messages', messageId, message);

    // 3. Send push notification to recipient
    await sendPushNotificationToUser(recipientId, {
      title: `💬 Message from ${currentUser.name}`,
      message: messageText.substring(0, 60) + (messageText.length > 60 ? '...' : ''),
      icon: currentUser.avatar,
      url: '/inbox'
    });

    // 4. Update UI
    setMessages([...messages, message]);
    setMessageText('');
    
    // Show success toast
    toast.success('Message sent');

  } catch (error) {
    console.error('Failed to send message:', error);
    toast.error('Failed to send message');
  }
};
```

---

## 2. Homework Notifications

**File:** `components/HomeworkModule.tsx`

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleCreateHomework = async (homeworkData: Assignment) => {
  try {
    // 1. Generate ID and save
    const homeworkId = `hw_${Date.now()}`;
    const homework = {
      id: homeworkId,
      ...homeworkData,
      createdAt: Date.now(),
      createdBy: currentUser.id
    };

    await saveDoc('assignments', homeworkId, homework);

    // 2. Send notifications to all affected students
    const affectedStudents = allUsers.filter(
      u => u.role === 'STUDENT' && u.grade === homework.grade
    );

    console.log(`📤 Sending homework notification to ${affectedStudents.length} students...`);

    for (const student of affectedStudents) {
      await sendPushNotificationToUser(student.id, {
        title: '📚 New Homework Assignment',
        message: `${homework.title} - Due ${new Date(homework.dueDate).toLocaleDateString()}`,
        icon: '/homework-icon.png',
        url: '/homework'
      });
    }

    // 3. Update UI
    setAssignments([...assignments, homework]);
    toast.success(`Homework created and ${affectedStudents.length} students notified`);

  } catch (error) {
    console.error('Failed to create homework:', error);
    toast.error('Failed to create homework');
  }
};
```

---

## 3. Alert Notifications

**File:** `components/AlertsModule.tsx`

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleCreateAlert = async (studentId: string, alertData: Alert) => {
  try {
    // 1. Get student and parent
    const student = allUsers.find(u => u.id === studentId);
    const parent = student ? allUsers.find(u => u.id === student.parentId) : null;

    if (!student || !parent) {
      toast.error('Student or parent not found');
      return;
    }

    // 2. Create and save alert
    const alertId = `alert_${Date.now()}`;
    const alert = {
      id: alertId,
      studentId,
      studentName: student.name,
      ...alertData,
      createdAt: Date.now(),
      createdBy: currentUser.id,
      resolved: false,
      comments: []
    };

    await saveDoc('alerts', alertId, alert);

    // 3. Send notification to parent
    const alertType = alert.type || 'Alert';
    await sendPushNotificationToUser(parent.id, {
      title: `⚠️ Alert: ${student.name}`,
      message: `${alertType}: ${alert.description}`,
      icon: '/alert-icon.png',
      url: '/parent-notifications'
    });

    // 4. Update UI
    setAlerts([...alerts, alert]);
    toast.success('Alert created and parent notified');

  } catch (error) {
    console.error('Failed to create alert:', error);
    toast.error('Failed to create alert');
  }
};
```

---

## 4. Announcement Notifications

**File:** `components/AnnouncementsModule.tsx`

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleCreateAnnouncement = async (announcementData: Announcement) => {
  try {
    // 1. Create announcement
    const announcementId = `ann_${Date.now()}`;
    const announcement = {
      id: announcementId,
      ...announcementData,
      date: new Date().toISOString(),
      createdBy: currentUser.id
    };

    // 2. Save to database
    await saveDoc('announcements', announcementId, announcement);

    // 3. Get all staff members
    const staffMembers = allUsers.filter(u => 
      u.role === 'TEACHER' || u.role === 'PRINCIPAL'
    );

    console.log(`📤 Broadcasting announcement to ${staffMembers.length} staff members...`);

    // 4. Send to all staff
    for (const staff of staffMembers) {
      await sendPushNotificationToUser(staff.id, {
        title: '📢 New Announcement',
        message: announcementData.content.substring(0, 60) + '...',
        icon: '/announcement-icon.png',
        url: '/announcements'
      });
    }

    // 5. Update UI
    setAnnouncements([...announcements, announcement]);
    toast.success(`Announcement created and sent to ${staffMembers.length} staff`);

  } catch (error) {
    console.error('Failed to create announcement:', error);
    toast.error('Failed to create announcement');
  }
};
```

---

## 5. Calendar Event Notifications

**File:** `components/CalendarModule.tsx`

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleCreateEvent = async (eventData: CalendarEvent) => {
  try {
    // 1. Create event
    const eventId = `event_${Date.now()}`;
    const event = {
      id: eventId,
      ...eventData,
      createdAt: Date.now(),
      createdBy: currentUser.id
    };

    // 2. Save event
    await saveDoc('events', eventId, event);

    // 3. Determine who should be notified
    let usersToNotify = [];
    
    if (eventData.audience === 'everyone') {
      usersToNotify = allUsers; // Everyone
    } else if (eventData.audience === 'staff') {
      usersToNotify = allUsers.filter(u => 
        u.role === 'TEACHER' || u.role === 'PRINCIPAL'
      );
    } else if (eventData.audience === 'parents') {
      usersToNotify = allUsers.filter(u => u.role === 'PARENT');
    } else if (eventData.audience === 'students') {
      usersToNotify = allUsers.filter(u => u.role === 'STUDENT');
    }

    // 4. Send notifications
    const eventDate = new Date(eventData.date).toLocaleDateString();
    
    for (const user of usersToNotify) {
      await sendPushNotificationToUser(user.id, {
        title: '📅 New Calendar Event',
        message: `${eventData.title} - ${eventDate}`,
        icon: '/calendar-icon.png',
        url: '/calendar'
      });
    }

    // 5. Update UI
    setEvents([...events, event]);
    toast.success(`Event created and ${usersToNotify.length} users notified`);

  } catch (error) {
    console.error('Failed to create event:', error);
    toast.error('Failed to create event');
  }
};
```

---

## 6. Class Attendance Notifications (for Parents)

```typescript
const handleMarkAttendance = async (studentId: string, present: boolean) => {
  try {
    // 1. Mark attendance
    const attendanceId = `att_${studentId}_${Date.now()}`;
    await saveDoc('attendance', attendanceId, {
      studentId,
      date: new Date().toISOString(),
      present
    });

    // 2. If absent, notify parent
    if (!present) {
      const student = allUsers.find(u => u.id === studentId);
      const parent = student ? allUsers.find(u => u.id === student.parentId) : null;

      if (parent) {
        await sendPushNotificationToUser(parent.id, {
          title: `⏰ Attendance Alert: ${student?.name}`,
          message: `${student?.name} was marked absent today`,
          icon: '/attendance-icon.png',
          url: '/alerts'
        });
      }
    }

    toast.success('Attendance marked');

  } catch (error) {
    console.error('Failed to mark attendance:', error);
    toast.error('Failed to mark attendance');
  }
};
```

---

## 7. Grade Notifications (for Parents)

```typescript
const handlePostGrade = async (studentId: string, gradeData: any) => {
  try {
    // 1. Save grade
    const gradeId = `grade_${studentId}_${Date.now()}`;
    await saveDoc('grades', gradeId, gradeData);

    // 2. Notify parent
    const student = allUsers.find(u => u.id === studentId);
    const parent = student ? allUsers.find(u => u.id === student.parentId) : null;

    if (parent) {
      await sendPushNotificationToUser(parent.id, {
        title: `📊 New Grade for ${student?.name}`,
        message: `${gradeData.subject}: ${gradeData.grade}%`,
        icon: '/grade-icon.png',
        url: '/parent-notifications'
      });
    }

    toast.success('Grade posted and parent notified');

  } catch (error) {
    console.error('Failed to post grade:', error);
    toast.error('Failed to post grade');
  }
};
```

---

## 8. Scheduled Notifications (Example with setTimeout)

```typescript
const scheduleNotification = async (
  recipientId: string,
  notificationData: any,
  delayMinutes: number
) => {
  // Notify after X minutes
  setTimeout(async () => {
    try {
      await sendPushNotificationToUser(recipientId, notificationData);
    } catch (error) {
      console.error('Failed to send scheduled notification:', error);
    }
  }, delayMinutes * 60 * 1000);
};

// Usage: Remind about upcoming homework
scheduleNotification(studentId, {
  title: 'Homework Reminder',
  message: 'Your homework is due in 1 hour',
  icon: '/homework-icon.png',
  url: '/homework'
}, 59); // 59 minutes before due time
```

---

## 9. Broadcast Notifications (using backend endpoint)

**For sending same notification to multiple users:**

```typescript
const broadcastNotification = async (userIds: string[], notificationData: any) => {
  try {
    // Get subscriptions for all users
    const subscriptionPromises = userIds.map(userId =>
      getUserPushSubscriptions(userId)
    );
    const allSubscriptions = await Promise.all(subscriptionPromises);
    const flatSubscriptions = allSubscriptions.flat();

    // Send to backend in bulk
    const response = await fetch('/api/send-push-to-multiple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptions: flatSubscriptions,
        payload: notificationData
      })
    });

    const result = await response.json();
    console.log(`✅ Broadcast complete: ${result.results.sent} sent`);

  } catch (error) {
    console.error('Failed to broadcast:', error);
  }
};

// Usage: Send to all students
const allStudents = allUsers.filter(u => u.role === 'STUDENT');
await broadcastNotification(allStudents.map(s => s.id), {
  title: 'School Closure',
  message: 'School is closed tomorrow',
  url: '/announcements'
});
```

---

## Testing Each Feature

### Test Message Notification
```bash
# 1. Send message between users
# 2. Minimize sender's app
# 3. Recipient should see notification
# 4. Click opens /inbox
```

### Test Homework Notification
```bash
# 1. Create homework assignment
# 2. Should notify all students in that grade
# 3. Notification opens /homework
```

### Test Alert Notification
```bash
# 1. Create alert for student
# 2. Parent should be notified
# 3. Click opens /alerts or /parent-notifications
```

---

## Best Practices

1. **Always catch errors** - notification failure shouldn't break the main feature
2. **Show feedback** - use toast to confirm notification sent
3. **Don't spam** - consider notification frequency
4. **Include context** - title and message should be clear
5. **Correct URL** - make sure notification URL matches feature
6. **Test in background** - minimize app when testing
7. **Check Firebase** - verify subscriptions are being saved

---

That's it! Copy these examples into your modules and notifications will work! 🎉
