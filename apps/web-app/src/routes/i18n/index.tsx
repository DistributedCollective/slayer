import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/i18n/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation('common');
  return (
    <div>
      <p>{t(($) => $.accept)}</p>
      <p>{t(($) => $.close)}</p>
    </div>
  );
}
