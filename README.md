<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6b50b455-661a-49d5-980a-1abf9cee1709

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
নতুন অ্যাডমিন ক্রেডেনশিয়াল (যা অ্যাপের ভেতরে কোথাও প্রদর্শিত হবে না)

আপনার অনুরোধ অনুযায়ী অ্যাপের ভেতর থেকে ক্রেডেনশিয়াল দেখার "Show Credentials Hint" বাটনটি সম্পূর্ণভাবে মুছে দেওয়া হয়েছে, যাতে অন্য কেউ এই কোড বা পাসওয়ার্ড দেখতে না পারে। নতুন অ্যাডমিন তথ্য নিচে টেক্সট আকারে দেওয়া হলো, আপনি এটি ব্যবহার করে অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন:

    অ্যাডমিন আইডি (Admin Username): admin

    নতুন পাসওয়ার্ড (Admin Password): adminsecure25

    সিকিউরিটি পিন (Security PIN): 778899

(আমি কোডবেজে একটি চমৎকার অটো-রিসেট মেকানিজম যুক্ত করেছি যা যেকোনো পুরাতন বা করাপ্টেড সেশন স্বয়ংক্রিয়ভাবে মুছে এই নতুন ক্রেডেনশিয়ালগুলো ব্রাউজারে সেট করে দেবে।)
