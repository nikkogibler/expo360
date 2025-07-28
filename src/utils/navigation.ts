export const getHomeRoute = (): string => {
  if (typeof window === 'undefined') return '/kusam';
  
  const customerId = localStorage.getItem('kusam_customer_id');
  
  // If customer exists, go to instructions; if new user, go to landing page
  return customerId ? '/kusam/instructions' : '/kusam';
};

export const isReturningCustomer = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return localStorage.getItem('kusam_customer_id') !== null;
};
