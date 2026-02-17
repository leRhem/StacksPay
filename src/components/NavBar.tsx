import { Link, useLocation } from "react-router-dom";

export const NavBar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  // Only show section-scroll links on the public landing page
  const landingLinks = [
    { name: "How It Works", href: "/#product" },
    { name: "Features", href: "/#features" },
    { name: "Testimonials", href: "/#testimonials" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 mix-blend-difference text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/40 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <Link
          to="/"
          className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2"
        >
          <span className="text-kinetic-purple">Stacks</span>Pay
        </Link>
        {isLandingPage && (
          <div className="hidden md:flex gap-8 font-body text-sm font-medium tracking-wide">
            {landingLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-kinetic-orange transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
        <Link
          to="/dashboard"
          className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300"
        >
          {isLandingPage ? "Launch App" : "Dashboard"}
        </Link>
      </div>
    </nav>
  );
};
