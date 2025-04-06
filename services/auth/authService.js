import supabase from '../../db/supabaseClient';


export const createAuthUser = async ({ email, password, firstName, lastName, setError }) => {
  try {
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
    
    // Immediately sign in with the new credentials to establish a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.log('Sign-in after signup failed:', signInError);
      // Continue with the signup data even if sign-in fails
      return { data, error: null };
    }
    
    console.log('Signed in after signup successfully');
    
    // Create the user profile after successful sign-in
    const { user } = signInData;
    const profileSuccess = await createUserProfile({ user, email, firstName, lastName, setError });
    
    if (!profileSuccess) {
      console.log('Profile creation failed after successful signup');
      return { data: signInData, error: 'Profile creation failed' };
    }
    
    return { data: signInData, error: null };
  } catch (error) {
    console.error('Unexpected error during auth user creation:', error);
    if (setError) setError(error.message || 'An unexpected error occurred');
    return { data: null, error: error.message };
  }
};

export const createUserProfile = async ({ user, email, firstName, lastName, setError }) => {
  try {
    // Make sure we have a valid user object
    if (!user || !user.id) {
      const errorMsg = 'Invalid user object provided to createUserProfile';
      console.error(errorMsg, user);
      if (setError) setError(errorMsg);
      return false;
    }
    
    // Insert the profile with the authenticated client
    const { data: profileData, error: profileError } = await supabase
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

    console.log('Profile created successfully:', profileData);
    
    return true;
  } catch (error) {
    console.error('Unexpected error during profile creation:', error);
    if (setError) setError(error.message || 'An unexpected error occurred');
    return false;
  }
};
