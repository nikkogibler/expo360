export const getMainPage = () => {
  if (typeof window === 'undefined') return '/main';

  const customerId = localStorage.getItem('customer_id');

  // If there's a customer ID, they should be taken to the instructions page
  return customerId ? '/main/instructions' : '/main';
};

/**
 * Checks if a customer is currently logged in.
 * @returns {boolean} True if a customer ID is found in local storage, false otherwise.
 */
export const isCustomerLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('customer_id') !== null;
};


export const isReturningCustomer = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return localStorage.getItem('kusam_customer_id') !== null;
};
