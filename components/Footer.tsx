import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Controle de Vagas. Feito com para facilitar sua busca por emprego.
        </p>
      </div>
    </footer>
  )
}

export default Footer
