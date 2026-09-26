import Alpine from 'alpinejs';
import { shortenerStore } from './stores/shortener';
import './style.css';

window.Alpine = Alpine;
Alpine.store('shortener', shortenerStore);
Alpine.start();
