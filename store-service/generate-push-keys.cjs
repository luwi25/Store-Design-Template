// Generates a private, ignored file. Never print private keys into logs or commit it.
const {createECDH}=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const pair=createECDH('prime256v1');pair.generateKeys();
const target=path.join(__dirname,'.push-secrets.env');
fs.writeFileSync(target,`VAPID_PUBLIC_KEY=${pair.getPublicKey().toString('base64url')}\nVAPID_PRIVATE_KEY=${pair.getPrivateKey().toString('base64url')}\nVAPID_SUBJECT=https://luwi25.github.io/Store-Design-Template/\n`,{flag:'wx',mode:0o600});
console.log('Saved store-service/.push-secrets.env. Copy its three values into Supabase secrets. Keep this file private; do not regenerate keys after enrollment.');
