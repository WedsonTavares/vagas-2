import { AppWindow, AreaChart, Layers } from 'lucide-react';

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const links: Array<NavLink> = [
  {
    href: '/dashboard/add-job',
    label: 'Adicionar Vaga',
    icon: <Layers size={16} />,
  },
  {
    href: '/dashboard/jobs',
    label: 'Candidaturas',
    icon: <AppWindow size={16} />,
  },
  {
    href: '/dashboard/stats',
    label: 'Status das Candidaturas',
    icon: <AreaChart size={16} />,
  },
];

export default links;
