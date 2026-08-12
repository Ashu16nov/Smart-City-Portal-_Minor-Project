import React from 'react';
import Login from './Login';

const Signup = () => {
  // Since original project was a combined login/signup, we'll reuse the same layout
  return <Login defaultIsSignup={true} />;
};

export default Signup;
