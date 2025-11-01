import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hitelesítési hiba</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sajnos hiba történt a bejelentkezés során. Kérjük, próbálja újra.
        </p>
        <Link
          href="/"
          className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  )
}

