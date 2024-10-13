import * as dotenv from 'dotenv';
dotenv.config();
export const cluster = process.env.DB_CLUSTER;
export const user = process.env.DB_USER;
export const passwd = process.env.DB_PASSWORD;
export const db = process.env.DB_NAME;
export const secret = process.env.JWT_SECRET;
export const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: 'only-films-cbeb4.firebaseapp.com',
    projectId: 'only-films-cbeb4',
    storageBucket: 'only-films-cbeb4.appspot.com',
    messagingSenderId: '1086374942699',
    appId: '1:1086374942699:web:f2ce083306c586e5fe2bae',
};
