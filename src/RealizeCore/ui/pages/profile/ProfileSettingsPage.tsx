/**
 * @file src/RealizeCore/ui/pages/profile/ProfileSettingsPage.tsx
 * @version 0.1.0 – 2025-12-24 03:45
 * @description
 * Страница настроек профиля (placeholder) с базовым контейнером и карточками.
 */

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/RealizeCore/ui/components/shadcn/card'

/**
 * @remarks
 * Отрисовывает заглушку формы настроек (уведомления и безопасность).
 * @returns JSX-разметка.
 */
export const ProfileSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure email / SMS notifications here. Integrate real form in later iterations.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Security settings (password, MFA) will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSettingsPage
