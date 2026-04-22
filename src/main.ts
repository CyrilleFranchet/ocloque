import { createClockApp } from './ui/clockApp';
import './style.css';

const appRoot = document.querySelector<HTMLElement>('#app');
if (appRoot) {
  createClockApp(appRoot);
}
