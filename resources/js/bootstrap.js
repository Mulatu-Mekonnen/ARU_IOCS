import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Import Ziggy for route helpers
import { Ziggy } from './ziggy';
window.Ziggy = Ziggy;
