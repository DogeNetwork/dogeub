import AppLayout from '../layouts/Apps';
import { memo } from 'react';

const Apps = memo(() => <AppLayout type="apps" />);

Apps.displayName = 'Apps';
export default Apps;
