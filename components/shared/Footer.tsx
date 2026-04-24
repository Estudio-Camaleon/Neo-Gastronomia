export function Footer() {
  return (
    <footer className="w-full py-8 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} NEO by Estudio Camaleón. Todos los
          derechos reservados.
        </p>

        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Términos
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Privacidad
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
