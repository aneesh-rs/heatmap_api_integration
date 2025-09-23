# NestJS Backend Specification for Heatmap Project

This document outlines the conversion of the Firebase-based frontend services to a NestJS backend with MongoDB. It includes schemas, API routes, authentication, and the role-based invitation system.

## Overview

The original project uses Firebase Authentication and Firestore for user management, reports, and invitations. This backend will replace those with NestJS (Node.js framework) and MongoDB.

### Technologies

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## Database Schemas

### User Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  id: string; // Firebase UID or internal ID

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, enum: ['Admin', 'User'] })
  role: string;

  @Prop()
  name: string;

  @Prop()
  firstSurname: string;

  @Prop()
  secondSurname: string;

  @Prop()
  birthday: string;

  @Prop()
  photoURL?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Report Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema()
export class Report {
  @Prop({ required: true })
  userId: string;

  @Prop({
    required: true,
    enum: ['happy', 'neutral', 'confused', 'sad', 'angry', 'surprised'],
  })
  feeling: string;

  @Prop({
    required: true,
    enum: ['rubbish', 'vandalism', 'hazard', 'traffic', 'others'],
  })
  category: string;

  @Prop({ required: true })
  reportText: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: Object, required: true })
  location: {
    lat: number;
    lng: number;
    address: string;
  };

  @Prop({ required: true, enum: ['Pending', 'New', 'Closed'], default: 'New' })
  reportStatus: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
```

### Invitation Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema()
export class Invitation {
  @Prop({ required: true })
  inviterId: string;

  @Prop({ required: true, enum: ['Admin', 'User'] })
  role: string;

  @Prop({
    required: true,
    enum: ['pending', 'verification_sent', 'accepted'],
    default: 'pending',
  })
  status: string;

  @Prop()
  reservedEmail?: string;

  @Prop()
  acceptedBy?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
```

## Authentication System

### JWT Authentication

- Use `@nestjs/jwt` for token generation and validation.
- Store JWT secret in environment variables.
- Implement login, signup, and social login endpoints.
- Use guards for protected routes.

### Auth Module Structure

```
src/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── jwt.strategy.ts
├── local.strategy.ts
├── dto/
│   ├── login.dto.ts
│   ├── signup.dto.ts
│   └── social-login.dto.ts
└── guards/
    ├── jwt-auth.guard.ts
    └── roles.guard.ts
```

### Key Auth Endpoints

#### POST /auth/login

- Body: `{ email: string, password: string }`
- Returns: `{ access_token: string, user: User }`
- Validates email verification (simulate Firebase behavior)

#### POST /auth/signup

- Body: `{ email: string, password: string, name: string, firstSurname: string, secondSurname: string, birthday: string }`
- Sends verification email (use nodemailer or similar)
- Returns: `{ message: 'Verification email sent' }`

#### POST /auth/google-login

- Body: `{ idToken: string }` (from Google OAuth)
- Verifies token with Google API
- Returns: `{ access_token: string, user: User }`

#### POST /auth/facebook-login

- Similar to Google login

#### POST /auth/apple-login

- Similar to Google login

#### POST /auth/verify-email

- Body: `{ token: string }`
- Verifies email and activates account

## API Routes

### Users Module

#### GET /users

- Protected: Admin only
- Returns: List of all users

#### GET /users/:id

- Protected: Own user or Admin
- Returns: User details

#### PUT /users/:id

- Protected: Own user or Admin
- Body: Partial<User>
- Updates user data

### Reports Module

#### POST /reports

- Protected: Authenticated user
- Body: ReportFormData
- Creates a new report
- Returns: Created report

#### GET /reports

- Protected: Authenticated user
- For Admin: All reports
- For User: User's own reports
- Query params: status, category, etc.
- Returns: List of reports

#### GET /reports/:id

- Protected: Report owner or Admin
- Returns: Report details

#### PUT /reports/:id/status

- Protected: Admin only
- Body: `{ status: 'Pending' | 'New' | 'Closed' }`
- Updates report status

### Invitations Module

#### POST /invitations

- Protected: Admin only
- Body: `{ role: 'Admin' | 'User' }`
- Generates invitation link
- Returns: `{ inviteLink: string }`

#### POST /invitations/:id/accept

- Public (but requires valid invitation)
- Body: `{ email: string, password: string, name: string, firstSurname: string, secondSurname: string, birthday: string }`
- Creates user with invited role
- Sends verification email
- Returns: `{ message: 'Account created, please verify email' }`

#### GET /invitations

- Protected: Admin only
- Returns: List of invitations with status

## Role-Based Access Control

### Roles Guard

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

### Usage

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Get('admin-only')
getAdminData() {
  // Only Admin can access
}
```

## Invitation System Implementation

1. **Generate Invitation**:

   - Admin calls POST /invitations with role
   - Create Invitation document with status 'pending'
   - Generate unique invite ID
   - Return invite link: `${FRONTEND_URL}/signup?inviteId=${inviteId}`

2. **Accept Invitation**:

   - User visits link, fills signup form
   - POST /invitations/:id/accept with user data
   - Validate invitation exists and status is 'pending'
   - Create user with invited role
   - Update invitation status to 'verification_sent', set reservedEmail
   - Send verification email
   - User must verify email before login

3. **Email Verification**:
   - User clicks verification link
   - POST /auth/verify-email with token
   - Update invitation status to 'accepted'
   - User can now login

## Additional Considerations

### Email Service

- Use `@nestjs-modules/mailer` for sending emails
- Templates for verification and invitation emails

### Social Login Integration

- For Google/Facebook/Apple, use respective SDKs to verify tokens
- Create user if not exists, or link to existing account

### Data Migration

- Script to migrate existing Firebase users and data to MongoDB
- Handle Firebase UIDs as user IDs

### Security

- Rate limiting on auth endpoints
- Password hashing with bcrypt
- CORS configuration for frontend
- Input validation with class-validator

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/heatmap
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
FACEBOOK_APP_ID=...
APPLE_CLIENT_ID=...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
FRONTEND_URL=https://your-frontend.com
```

This specification provides a complete blueprint for building the NestJS backend to replace Firebase services while maintaining all existing functionality.
