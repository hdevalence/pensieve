# Pensieve

To use this, you'll need to make a copy of your Signal Desktop data.  You must
make a copy, so that there is no possibility of corrupting your Signal data.
Quit Signal first, so that nothing is writing to the data while you are copying
it.

Signal "upgraded" data storage to use the platform keychain. On MacOS, use Keychain Access to access the "Signal Safe Storage" keychain entry.

The location of that data is platform dependent. On MacOS, for instance, you
could do
```
cp -a ~/Library/Application\ Support/Signal/ ~/data/signal/2023-11-23/
```
Adjust file paths as appropriate.  Next, set the STORAGE_PATH in `.env.local`:
```
STORAGE_PATH=~/data/signal/2023-11-23
KEYCHAIN_PASSWORD=THE_VALUE_FROM_KEYCHAIN_ACCESS
```
Then you are ready to follow the instructions below.

## Web docs follow

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
