# Database Schema

## User
- clerkUserId: String, unique
- email: String
- role: volunteer | coordinator | admin
- status: pending | active | blocked
- skills: String[]
- bio: String
- availability: Object

## Campaign
- title: String
- category: String
- status: draft | pending | active | completed
- location: Object
- volunteersRegistered: ObjectId[] → User
- createdBy: ObjectId → User

## Task
- title: String
- status: pending | in-progress | completed
- estimatedHours: Number
- loggedHours: Number
- checkInTime: Date
- checkOutTime: Date
- assignedTo: ObjectId → User
- campaign: ObjectId → Campaign

## Certificate
- certificateCode: String, unique
- totalHours: Number
- pdfPath: String
- volunteer: ObjectId → User
- campaign: ObjectId → Campaign
- issuedAt: Date
