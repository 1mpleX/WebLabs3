export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };
  
  export const removeTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };
  
  export const getAccessToken = () => localStorage.getItem('accessToken');
  export const getRefreshToken = () => localStorage.getItem('refreshToken');