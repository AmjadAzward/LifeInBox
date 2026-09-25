export function legalDetails(){return{
  businessName:process.env.LEGAL_BUSINESS_NAME||'LifeInbox',
  address:process.env.LEGAL_BUSINESS_ADDRESS||'Not provided',
  country:process.env.LEGAL_COUNTRY||'Sri Lanka',
  email:process.env.LEGAL_CONTACT_EMAIL||'Not provided',
  jurisdiction:process.env.LEGAL_JURISDICTION||'Sri Lanka',
  retention:process.env.LEGAL_RETENTION_PERIOD||'until the user deletes the content or account',
};}
