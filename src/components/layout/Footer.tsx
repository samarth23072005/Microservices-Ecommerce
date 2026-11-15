import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, Phone, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-ink-900 text-ink-300">
      {/* trust strip */}
      <div className="border-b border-ink-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: '2-day across India' },
            { icon: ShieldCheck, title: 'Secure Payments', desc: '100% protected' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: CreditCard, title: 'COD Available', desc: 'Pay when you receive' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink-800 text-brand-300">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-ink-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-700">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-extrabold text-white">ShopKart</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-400">
            India's smart marketplace — electronics, fashion, home and more, delivered fast.
          </p>
        </div>

        <FooterCol
          title="Shop"
          links={[
            ['All Products', '/products'],
            ['Electronics', '/products?category=electronics'],
            ['Fashion', '/products?category=fashion'],
            ['Home', '/products?category=home'],
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            ['Login', '/login'],
            ['Register', '/register'],
            ['My Orders', '/orders'],
            ['Cart', '/cart'],
          ]}
        />
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-300" /> help@shopkart.in
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-300" /> 1800-123-4567
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-ink-500 sm:flex-row">
          <p>© 2026 ShopKart. Built as a microservices e-commerce demo.</p>
          <p>Frontend • React + TypeScript + Tailwind</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-ink-400 transition hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
