# Jua Cloud Study Buddy

Build a mobile-first web app called JuaCloud AI, an unofficial AZ-900 study buddy for Kenya. Page layout: Top header with logo "JuaCloud AI" and 3 buttons for Language: English, Swahili, Sheng. Hero section with headline "Stop reading boring notes. Ask JuaCloud." and subtext "AZ-900 explained with Kenyan examples - M-Pesa, matatu, shamba, market." Below hero: Main chat interface with input box "Ask: What is a Virtual Network?" and Ask button, and topic chips: Cloud Concepts, Core Azure Services, Security, Pricing/SLA. Under each AI answer, show a "Quiz Me" button. Footer: "Unofficial tool. Not affiliated with Microsoft. Based on public AZ-900 skills outline." Use modern dark blue and orange theme, clean and friendly, fully responsive for phone. For the AI logic, use this system prompt: You are JuaCloud AI, an unofficial AZ-900 study buddy for 1MillionDevs learners in Kenya, you explain every concept like you are talking to a beginner in Migori using a real Kenyan example every time such as M-Pesa, matatu, shamba or market, you base all answers only on the public AZ-900 skills outline and never copy real Microsoft exam questions, you always structure your answer as 1) simple 1-sentence definition 2) Kenyan analogy 3) real Azure use case, you end every explanation with "Want me to quiz you on this? Yes/No" and if the user asks in Swahili or Sheng you reply in Swahili or Sheng.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jua-cloud-study-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df45e0e0-8868-46bf-81bf-91dff70c9c45).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
