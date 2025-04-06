import supabase from '../../db/supabaseClient';


export const createAuthUser = async ({ email, password, firstName, lastName, setError }) => {
  // Sign up the user with Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    }
  });

  if (signUpError) {
    if (setError) setError(signUpError.message || 'Signup failed');
    return { data: null, error: signUpError.message };
  }
  
  console.log('Auth user created:', data?.user?.id);
  
  return { data, error: null };
};

export const createUserProfile = async ({ user, email, firstName, lastName, setError }) => {
  
  // Make sure we have a valid user object
  if (!user || !user.id) {
    const errorMsg = 'Invalid user object provided to createUserProfile';
    console.error(errorMsg, user);
    if (setError) setError(errorMsg);
    return false;
  }

  console.log('Creating profile for user ID:', user.id);
    
    // Insert the profile with the authenticated client
    const { data, error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          user_id: user.id,
          email: email,
          first_name: firstName,
          last_name: lastName
        }
      ])
      .select();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      if (setError) setError(profileError.message || 'Failed to create profile');
      return false;
    }

    console.log('Profile created successfully:', data);
    return true;
};
