import React from 'react'
import { useAuthContext } from '../providers/useAuthContext'

const AccountPage = () => {
  const { logout } = useAuthContext();
  return (
    <div>
      <h1>Account Page</h1>
      <button 
        onClick={logout} 
        className="bg-red-500 text-white p-2 rounded mt-4"
      >
        Sign Out to Test Login Flow
      </button>
    </div>
  )
}

export default AccountPage