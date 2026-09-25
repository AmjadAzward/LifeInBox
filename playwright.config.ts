import { defineConfig,devices } from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',timeout:30_000,expect:{timeout:8_000},fullyParallel:false,retries:0,
  reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]],
  use:{baseURL:'http://127.0.0.1:3000',channel:'msedge',trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run dev',url:'http://127.0.0.1:3000/login',reuseExistingServer:true,timeout:120_000,env:{...process.env,NEXT_PUBLIC_TURNSTILE_SITE_KEY:''}},
  projects:[
    {name:'desktop-edge',use:{...devices['Desktop Edge']}},
    {name:'mobile-edge',use:{...devices['Pixel 5'],channel:'msedge'}},
  ],
});
