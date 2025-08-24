import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../store/slices/authSlice'
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'

function Auth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)
  const { isSignedIn } = useAuth()
  const [authMode, setAuthMode] = useState('clerk') // 'clerk' or 'legacy'
  const [isLogin, setIsLogin] = useState(true)
  const [signupRole, setSignupRole] = useState('customer')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'customer'
  })

  useEffect(() => {
    // Redirect if authenticated via either method
    if (isAuthenticated || isSignedIn) {
      navigate('/')
    }
  }, [isAuthenticated, isSignedIn, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return 'Please fill in all required fields'
    }
    if (!isLogin && (!formData.name || !formData.confirmPassword)) {
      return 'Please fill in all required fields'
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validateForm()
    if (error) {
      dispatch({ type: 'auth/setError', payload: error })
      return
    }

    try {
      if (isLogin) {
        await dispatch(login({ email: formData.email, password: formData.password })).unwrap()
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }
        await dispatch(register(userData)).unwrap()
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log('Google login clicked')
  }

  const handleSocialLogin = (provider) => {
    // Handle social login for other providers
    console.log(`${provider} login clicked`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              authMode === 'clerk' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
            onClick={() => setAuthMode('clerk')}
          >
            Use Clerk Auth
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              authMode === 'legacy' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
            onClick={() => setAuthMode('legacy')}
          >
            Use Legacy Auth
          </button>
        </div>
        
        {authMode === 'clerk' ? (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-4">
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            )}
            {isLogin ? (
              <SignIn redirectUrl="/" afterSignInUrl="/" />
            ) : (
              <SignUp redirectUrl="/" afterSignUpUrl="/" />
            )}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:text-primary-dark"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              <div className="rounded-md shadow-sm -space-y-px">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                      isLogin && 'rounded-t-md'
                    } focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                      isLogin && 'rounded-b-md'
                    } focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="sr-only">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required={!isLogin}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="sr-only">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        required={!isLogin}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="customer">Customer</option>
                        <option value="store_owner">Store Owner</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaGithub className="h-5 w-5 text-gray-800" />
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary hover:text-primary-dark"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Auth
