# Security Best Practices

## Profile Data Access

### ⚠️ CRITICAL: Email Address Privacy

User email addresses are **sensitive personal information** and must never be exposed publicly.

## Role-Based Access Control (RBAC)

### ⚠️ CRITICAL: Privilege Escalation Prevention

User roles are stored in a **separate `user_roles` table** to prevent privilege escalation attacks. Never store roles directly in the `profiles` table where users might update their own roles.

### Checking User Roles Securely

✅ **DO: Use the `has_role()` security definer function**
```typescript
// Check if user is an admin
const { data: isAdmin } = await supabase
  .rpc('has_role', { _user_id: userId, _role: 'admin' })
```

✅ **DO: Use in RLS policies**
```sql
CREATE POLICY "Admins can manage content"
ON public.content
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

❌ **DON'T: Query profiles.role directly for authorization**
```typescript
// Bad: Vulnerable to privilege escalation
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
```

### Safe Profile Queries

✅ **DO: Use specific field selection**
```typescript
// Good: Only select public fields
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url, role')
  .eq('id', userId)
```

✅ **DO: Use the profiles_public view for author display**
```typescript
// Good: Use the public view (available for future use)
const { data } = await supabase
  .from('profiles_public')
  .select('*')
```

❌ **DON'T: Select all fields when displaying other users' profiles**
```typescript
// Bad: Exposes email addresses
const { data } = await supabase
  .from('profiles')
  .select('*')
```

### Current Implementation

The application correctly filters out email addresses in all public-facing queries:
- Story author displays: `author:profiles(id, full_name, avatar_url)`
- Comment author displays: `author:profiles(id, full_name, avatar_url)`
- Profile listings: Only specific fields are selected

### RLS Policies

- **Own Profile**: Users can view ALL fields of their own profile (including email)
- **Other Profiles**: Users can view profiles, but should only access public fields through proper queries
- **profiles_public View**: Available as a safer alternative that excludes sensitive data

### For Developers

When adding new features that display user information:
1. **Never** use `select('*')` on the profiles table for other users
2. Always explicitly list the fields you need
3. Never display email addresses in public views
4. Consider using the `profiles_public` view for author displays

### Password Security

Enable leaked password protection in your Supabase dashboard:
Settings → Auth → Password Security → Enable "Check for leaked passwords"
