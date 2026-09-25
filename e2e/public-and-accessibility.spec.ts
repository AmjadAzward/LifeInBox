import AxeBuilder from '@axe-core/playwright';
import { expect,test } from '@playwright/test';

test('login validates required credentials and is accessible',async({page})=>{
  await page.goto('/login');
  await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
  await page.getByRole('button',{name:'Sign in'}).click();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('registration and legal pages are reachable',async({page})=>{
  await page.goto('/register');
  await expect(page.getByRole('heading',{name:/Create your account/i})).toBeVisible();
  await page.goto('/privacy');
  await expect(page.getByRole('heading',{name:/Privacy/i})).toBeVisible();
  await page.goto('/terms');
  await expect(page.getByRole('heading',{name:/Terms/i})).toBeVisible();
});

test('protected application redirects anonymous users',async({page})=>{
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
});

test('auth layout matches visual baseline',async({page},testInfo)=>{
  await page.goto('/login');
  await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
  await expect(page).toHaveScreenshot('login.png',{fullPage:true,animations:'disabled'});
  expect(['desktop-edge','mobile-edge']).toContain(testInfo.project.name);
});
