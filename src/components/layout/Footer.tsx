export const Footer = () => (
  <footer className="border-t border-outline-variant bg-surface-container-low px-4 py-8 md:px-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
      <p className="text-sm text-on-surface-variant">
        © {new Date().getFullYear()} MedSave. Economia consciente em medicamentos.
      </p>
      <p className="text-sm text-on-surface-variant">Design system: Tailwind CSS</p>
    </div>
  </footer>
);
