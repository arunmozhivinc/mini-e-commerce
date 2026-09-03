const webpush = require('web-push');

console.log('Generating VAPID Keys for Web Push Notifications...\n');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('==================================================');
console.log('Public Key:\n', vapidKeys.publicKey);
console.log('\nPrivate Key:\n', vapidKeys.privateKey);
console.log('==================================================\n');
console.log('Add these to your .env file:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
