import AppLayout from '../layouts/Apps';
import { memo } from 'react';

const Gms = memo(() => <AppLayout type="games" />);

Gms.displayName = 'Games';
export default Gms;
